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
