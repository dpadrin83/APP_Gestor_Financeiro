import { CategoryFilter } from "@/components/category-filter";
import { MonthFilter } from "@/components/month-filter";
import { SearchInput } from "@/components/search-input";
import { TagFilter } from "@/components/tag-filter";
import { TransactionsTable } from "@/components/transactions-table";
import { TypeFilter } from "@/components/type-filter";
import {
  currentMonthIso,
  listTransactions,
  type ListFilters,
} from "@/lib/transactions/queries";
import type { Category, Tag, TransactionType } from "@/lib/constants";

export default async function TransacoesPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    category?: string;
    tag?: string;
    type?: string;
    search?: string;
    new?: string;
  }>;
}) {
  const params = await searchParams;
  const filters: ListFilters = {
    month: params.month ?? currentMonthIso(),
    category: (params.category ?? "all") as Category | "all",
    tag: (params.tag ?? "all") as Tag | "all",
    type: (params.type ?? "all") as TransactionType | "all",
    search: params.search ?? "",
  };

  const transactions = await listTransactions(filters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie suas receitas e despesas. Filtre, busque e exporte.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={filters.search ?? ""} />
        <MonthFilter value={filters.month ?? ""} />
        <TypeFilter value={String(filters.type)} />
        <CategoryFilter value={String(filters.category)} />
        <TagFilter value={String(filters.tag)} />
      </div>

      <TransactionsTable
        transactions={transactions}
        initialOpenNew={params.new === "1"}
      />
    </div>
  );
}
