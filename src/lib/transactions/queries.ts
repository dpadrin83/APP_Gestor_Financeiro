import { createClient } from "@/lib/supabase/server";
import type { Transaction } from "@/lib/types";
import type { Category, Tag, TransactionType } from "@/lib/constants";

export interface ListFilters {
  month?: string;
  category?: Category | "all";
  tag?: Tag | "all";
  search?: string;
  type?: TransactionType | "all";
}

function monthRange(month?: string) {
  if (!month) return null;
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const m = Number(monthStr);
  if (!year || !m) return null;
  const start = new Date(year, m - 1, 1);
  const end = new Date(year, m, 1);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

export async function listTransactions(filters: ListFilters = {}): Promise<Transaction[]> {
  const supabase = await createClient();
  let query = supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const range = monthRange(filters.month);
  if (range) {
    query = query.gte("date", range.start).lt("date", range.end);
  }
  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }
  if (filters.tag && filters.tag !== "all") {
    query = query.eq("tag", filters.tag);
  }
  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }
  if (filters.search) {
    query = query.ilike("description", `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Transaction[];
}

export interface DashboardSummary {
  receitaTotal: number;
  despesaTotal: number;
  saldo: number;
  porCategoria: { name: Category; value: number }[];
  recent: Transaction[];
}

export async function getDashboardSummary(filters: ListFilters = {}): Promise<DashboardSummary> {
  const transactions = await listTransactions(filters);

  let receitaTotal = 0;
  let despesaTotal = 0;
  const categoryMap = new Map<string, number>();

  for (const tx of transactions) {
    const value = Number(tx.amount);
    if (tx.type === "receita") {
      receitaTotal += value;
    } else {
      despesaTotal += value;
      categoryMap.set(tx.category, (categoryMap.get(tx.category) ?? 0) + value);
    }
  }

  const porCategoria = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name: name as Category, value }))
    .sort((a, b) => b.value - a.value);

  return {
    receitaTotal,
    despesaTotal,
    saldo: receitaTotal - despesaTotal,
    porCategoria,
    recent: transactions.slice(0, 5),
  };
}

export function currentMonthIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
