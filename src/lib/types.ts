import type {
  BankType,
  BillCategory,
  BillRecurrence,
  BillStatus,
  Category,
  Tag,
  TransactionType,
} from "./constants";

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: Category;
  tag: Tag;
  bank_id: string | null;
  external_id: string | null;
  reconciled: boolean;
  created_at: string;
  updated_at: string;
}

export type TransactionInput = Omit<
  Transaction,
  "id" | "user_id" | "created_at" | "updated_at" | "external_id" | "reconciled"
>;

export interface Bank {
  id: string;
  user_id: string;
  name: string;
  type: BankType;
  account_label: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface RecurringBill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_day: number;
  category: BillCategory;
  recurrence: BillRecurrence;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillPayment {
  id: string;
  user_id: string;
  bill_id: string;
  reference_month: string;
  status: BillStatus;
  paid_at: string | null;
  amount_paid: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * View calculada para uma conta em um mês específico:
 * junta dados do bill com a payment correspondente (ou status virtual).
 */
export interface BillInstance {
  bill: RecurringBill;
  reference_month: string;
  due_date: string;
  status: BillStatus;
  payment: BillPayment | null;
}
