"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORIES,
  TAGS,
  TRANSACTION_TYPES,
  type Category,
  type Tag,
  type TransactionType,
} from "@/lib/constants";

type Result = { error: string } | { ok: true };

type ParsedFields = {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: Category;
  tag: Tag;
};

type ParseResult = { error: string } | { data: ParsedFields };

function parseFormData(formData: FormData): ParseResult {
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "0").replace(",", "."));
  const date = String(formData.get("date") ?? "");
  const type = String(formData.get("type") ?? "") as TransactionType;
  const category = String(formData.get("category") ?? "") as Category;
  const tag = String(formData.get("tag") ?? "Pessoal") as Tag;

  if (!description) return { error: "Descrição é obrigatória." };
  if (!amount || amount <= 0) return { error: "Valor deve ser maior que zero." };
  if (!date) return { error: "Data é obrigatória." };
  if (!TRANSACTION_TYPES.includes(type)) return { error: "Tipo inválido." };
  if (!CATEGORIES.includes(category)) return { error: "Categoria inválida." };
  if (!TAGS.includes(tag)) return { error: "Tag inválida." };

  return { data: { description, amount, date, type, category, tag } };
}

export async function createTransactionAction(formData: FormData): Promise<Result> {
  const parsed = parseFormData(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { error } = await supabase.from("transactions").insert({
    ...parsed.data,
    user_id: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/transacoes");
  return { ok: true };
}

export async function updateTransactionAction(
  id: string,
  formData: FormData
): Promise<Result> {
  const parsed = parseFormData(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/transacoes");
  return { ok: true };
}

export async function deleteTransactionAction(id: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/transacoes");
  return { ok: true };
}

export async function importTransactionsAction(rows: Array<{
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: Category;
  tag: Tag;
}>): Promise<Result & { imported?: number }> {
  if (!rows.length) return { error: "Nenhuma linha para importar." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const valid = rows
    .map((r) => {
      if (!r.description) return null;
      if (!r.amount || r.amount <= 0) return null;
      if (!r.date) return null;
      if (!TRANSACTION_TYPES.includes(r.type)) return null;
      const category = CATEGORIES.includes(r.category) ? r.category : "Outros";
      const tag = TAGS.includes(r.tag) ? r.tag : "Pessoal";
      return { ...r, category, tag, user_id: user.id };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (!valid.length) return { error: "Nenhuma linha válida no CSV." };

  const { error } = await supabase.from("transactions").insert(valid);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/transacoes");
  return { ok: true, imported: valid.length };
}
