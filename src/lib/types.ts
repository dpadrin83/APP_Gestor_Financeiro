import type { Category, Tag, TransactionType } from "./constants";

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: Category;
  tag: Tag;
  created_at: string;
  updated_at: string;
}

export type TransactionInput = Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">;
