import { createClient } from "@/lib/supabase/server";
import type { BillInstance, BillPayment, RecurringBill } from "@/lib/types";
import type { BillStatus } from "@/lib/constants";

export function referenceMonthFromIso(monthIso: string): string {
  return `${monthIso}-01`;
}

export function currentReferenceMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function currentMonthIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function clampDay(year: number, monthIdx: number, day: number): number {
  const lastDay = new Date(year, monthIdx + 1, 0).getDate();
  return Math.min(day, lastDay);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildDueDate(referenceMonth: string, dueDay: number): string {
  const [yearStr, monthStr] = referenceMonth.split("-");
  const year = Number(yearStr);
  const monthIdx = Number(monthStr) - 1;
  const day = clampDay(year, monthIdx, dueDay);
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Calcula o status efetivo de uma conta:
 * - se já existe pagamento explícito (pago/agendado/vencido), respeita
 * - senão: vencido se due_date já passou; pendente caso contrário
 */
function effectiveStatus(
  bill: RecurringBill,
  referenceMonth: string,
  payment: BillPayment | null
): BillStatus {
  if (payment) return payment.status;
  const due = buildDueDate(referenceMonth, bill.due_day);
  return due < todayIso() ? "vencido" : "pendente";
}

export async function listRecurringBills(): Promise<RecurringBill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_bills")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as RecurringBill[];
}

/**
 * Lista contas recorrentes com seus status para um mês específico.
 * Cada bill ativo aparece uma vez na lista, com o status calculado.
 */
export async function listBillInstances(
  referenceMonth: string = currentReferenceMonth()
): Promise<BillInstance[]> {
  const supabase = await createClient();
  const [billsRes, paymentsRes] = await Promise.all([
    supabase
      .from("recurring_bills")
      .select("*")
      .eq("active", true)
      .order("due_day", { ascending: true }),
    supabase.from("bill_payments").select("*").eq("reference_month", referenceMonth),
  ]);

  if (billsRes.error) throw billsRes.error;
  if (paymentsRes.error) throw paymentsRes.error;

  const bills = (billsRes.data ?? []) as RecurringBill[];
  const payments = (paymentsRes.data ?? []) as BillPayment[];
  const paymentByBill = new Map<string, BillPayment>();
  for (const p of payments) paymentByBill.set(p.bill_id, p);

  return bills.map<BillInstance>((bill) => {
    const payment = paymentByBill.get(bill.id) ?? null;
    return {
      bill,
      reference_month: referenceMonth,
      due_date: buildDueDate(referenceMonth, bill.due_day),
      status: effectiveStatus(bill, referenceMonth, payment),
      payment,
    };
  });
}

export interface BillsSummary {
  pendentes: number;
  vencidas: number;
  pagas: number;
  agendadas: number;
  totalPendente: number;
  totalVencido: number;
  totalPago: number;
}

export function summarizeBills(instances: BillInstance[]): BillsSummary {
  const summary: BillsSummary = {
    pendentes: 0,
    vencidas: 0,
    pagas: 0,
    agendadas: 0,
    totalPendente: 0,
    totalVencido: 0,
    totalPago: 0,
  };
  for (const i of instances) {
    const value = Number(i.bill.amount);
    if (i.status === "pendente") {
      summary.pendentes++;
      summary.totalPendente += value;
    } else if (i.status === "vencido") {
      summary.vencidas++;
      summary.totalVencido += value;
    } else if (i.status === "pago") {
      summary.pagas++;
      summary.totalPago += Number(i.payment?.amount_paid ?? value);
    } else if (i.status === "agendado") {
      summary.agendadas++;
    }
  }
  return summary;
}

/**
 * Para o dashboard / página de alertas: contas vencidas + próximas X dias.
 */
export async function getUpcomingAndOverdueBills(daysAhead = 7): Promise<{
  overdue: BillInstance[];
  upcoming: BillInstance[];
}> {
  const ref = currentReferenceMonth();
  const instances = await listBillInstances(ref);
  const today = todayIso();
  const ahead = new Date();
  ahead.setDate(ahead.getDate() + daysAhead);
  const aheadIso = ahead.toISOString().slice(0, 10);

  const overdue: BillInstance[] = [];
  const upcoming: BillInstance[] = [];
  for (const inst of instances) {
    if (inst.status === "pago") continue;
    if (inst.due_date < today) overdue.push(inst);
    else if (inst.due_date <= aheadIso) upcoming.push(inst);
  }
  overdue.sort((a, b) => a.due_date.localeCompare(b.due_date));
  upcoming.sort((a, b) => a.due_date.localeCompare(b.due_date));
  return { overdue, upcoming };
}

export function alertsBadgeCount(overdue: BillInstance[], upcoming: BillInstance[]): number {
  return overdue.length + upcoming.length;
}
