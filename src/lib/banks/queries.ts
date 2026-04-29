import { createClient } from "@/lib/supabase/server";
import type { Bank } from "@/lib/types";

export async function listBanks(): Promise<Bank[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banks")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Bank[];
}
