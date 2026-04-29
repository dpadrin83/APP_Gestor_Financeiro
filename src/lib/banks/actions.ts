"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { BANK_TYPES, type BankType } from "@/lib/constants";

type Result = { error: string } | { ok: true };

type ParsedBank = {
  name: string;
  type: BankType;
  account_label: string | null;
  color: string;
};

function parseBankForm(formData: FormData): { error: string } | { data: ParsedBank } {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "corrente") as BankType;
  const accountLabelRaw = String(formData.get("account_label") ?? "").trim();
  const color = String(formData.get("color") ?? "#3b82f6").trim();

  if (!name) return { error: "Nome do banco é obrigatório." };
  if (!BANK_TYPES.includes(type)) return { error: "Tipo de conta inválido." };
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return { error: "Cor inválida." };

  return {
    data: {
      name,
      type,
      account_label: accountLabelRaw || null,
      color,
    },
  };
}

export async function createBankAction(formData: FormData): Promise<Result> {
  const parsed = parseBankForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { error } = await supabase
    .from("banks")
    .insert({ ...parsed.data, user_id: user.id });
  if (error) return { error: error.message };

  revalidatePath("/bancos");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateBankAction(id: string, formData: FormData): Promise<Result> {
  const parsed = parseBankForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("banks").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/bancos");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteBankAction(id: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("banks").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/bancos");
  revalidatePath("/dashboard");
  return { ok: true };
}
