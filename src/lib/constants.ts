export const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Salário",
  "Freelance",
  "Outros",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const TAGS = ["Pessoal", "PJ"] as const;
export type Tag = (typeof TAGS)[number];

export const TRANSACTION_TYPES = ["receita", "despesa"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  Alimentação: "#f97316",
  Transporte: "#0ea5e9",
  Moradia: "#8b5cf6",
  Lazer: "#ec4899",
  Saúde: "#ef4444",
  Educação: "#14b8a6",
  Salário: "#22c55e",
  Freelance: "#3b82f6",
  Outros: "#a3a3a3",
};

export const BILL_CATEGORIES = [
  "Conta fixa",
  "Serviço",
  "Imposto",
  "Fornecedor",
  "Cartão",
  "Assinatura",
  "Outros",
] as const;
export type BillCategory = (typeof BILL_CATEGORIES)[number];

export const BILL_RECURRENCES = ["mensal", "anual", "semanal"] as const;
export type BillRecurrence = (typeof BILL_RECURRENCES)[number];

export const BILL_STATUSES = ["pendente", "agendado", "pago", "vencido"] as const;
export type BillStatus = (typeof BILL_STATUSES)[number];

export const BANK_TYPES = [
  "corrente",
  "poupanca",
  "cartao",
  "investimento",
  "outro",
] as const;
export type BankType = (typeof BANK_TYPES)[number];

export const BANK_TYPE_LABEL: Record<BankType, string> = {
  corrente: "Conta corrente",
  poupanca: "Poupança",
  cartao: "Cartão de crédito",
  investimento: "Investimento",
  outro: "Outro",
};
