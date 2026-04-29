"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  BILL_CATEGORIES,
  BILL_RECURRENCES,
  BILL_STATUSES,
  type BillCategory,
  type BillRecurrence,
  type BillStatus,
} from "@/lib/constants";

type Result = { error: string } | { ok: true };

type ParsedBill = {
  name: string;
  amount: number;
  due_day: number;
  category: BillCategory;
  recurrence: BillRecurrence;
  notes: string | null;
  active: boolean;
};

function parseBillForm(formData: FormData): { error: string } | { data: ParsedBill } {
  const name = String(formData.get("name") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "0").replace(",", "."));
  const dueDay = Number(String(formData.get("due_day") ?? "0"));
  const category = String(formData.get("category") ?? "Outros") as BillCategory;
  const recurrence = String(formData.get("recurrence") ?? "mensal") as BillRecurrence;
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const active = String(formData.get("active") ?? "true") !== "false";

  if (!name) return { error: "Nome da conta é obrigatório." };
  if (Number.isNaN(amount) || amount < 0) return { error: "Valor inválido." };
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
    return { error: "Dia de vencimento deve estar entre 1 e 31." };
  }
  if (!BILL_CATEGORIES.includes(category)) return { error: "Categoria inválida." };
  if (!BILL_RECURRENCES.includes(recurrence)) return { error: "Recorrência inválida." };

  return {
    data: {
      name,
      amount,
      due_day: dueDay,
      category,
      recurrence,
      notes: notesRaw || null,
      active,
    },
  };
}

export async function createBillAction(formData: FormData): Promise<Result> {
  const parsed = parseBillForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const initialStatus = String(formData.get("initial_status") ?? "pendente") as BillStatus;
  const referenceMonth = String(formData.get("reference_month") ?? currentReferenceMonth());

  const { data: bill, error: billError } = await supabase
    .from("recurring_bills")
    .insert({ ...parsed.data, user_id: user.id })
    .select("*")
    .single();
  if (billError || !bill) return { error: billError?.message ?? "Erro ao criar conta." };

  if (BILL_STATUSES.includes(initialStatus) && initialStatus !== "pendente") {
    const { error: payError } = await supabase.from("bill_payments").insert({
      user_id: user.id,
      bill_id: bill.id,
      reference_month: referenceMonth,
      status: initialStatus,
      paid_at: initialStatus === "pago" ? new Date().toISOString().slice(0, 10) : null,
      amount_paid: initialStatus === "pago" ? parsed.data.amount : null,
    });
    if (payError) return { error: payError.message };
  }

  revalidatePath("/contas");
  revalidatePath("/alertas");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateBillAction(id: string, formData: FormData): Promise<Result> {
  const parsed = parseBillForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("recurring_bills")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/contas");
  revalidatePath("/alertas");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteBillAction(id: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("recurring_bills").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/contas");
  revalidatePath("/alertas");
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Marca uma conta como paga em um mês específico. Cria ou atualiza o registro
 * em bill_payments. Se o mês ainda não existir, é criado.
 */
export async function setBillStatusAction(
  billId: string,
  referenceMonth: string,
  status: BillStatus,
  amountPaid?: number
): Promise<Result> {
  if (!BILL_STATUSES.includes(status)) return { error: "Status inválido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const today = new Date().toISOString().slice(0, 10);
  const payload = {
    user_id: user.id,
    bill_id: billId,
    reference_month: referenceMonth,
    status,
    paid_at: status === "pago" ? today : null,
    amount_paid: status === "pago" ? amountPaid ?? null : null,
  };

  const { error } = await supabase
    .from("bill_payments")
    .upsert(payload, { onConflict: "user_id,bill_id,reference_month" });
  if (error) return { error: error.message };

  revalidatePath("/contas");
  revalidatePath("/alertas");
  revalidatePath("/dashboard");
  return { ok: true };
}

function currentReferenceMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
