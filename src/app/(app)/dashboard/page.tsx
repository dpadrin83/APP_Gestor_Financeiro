import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryPieChart } from "@/components/category-pie-chart";
import { DashboardGreeting } from "@/components/dashboard-greeting";
import { MonthFilter } from "@/components/month-filter";
import { QuickActions } from "@/components/quick-actions";
import { SummaryCards } from "@/components/summary-cards";
import { TagFilter } from "@/components/tag-filter";
import { UpcomingBillsWidget } from "@/components/upcoming-bills-widget";
import { createClient } from "@/lib/supabase/server";
import { currentMonthIso, getDashboardSummary } from "@/lib/transactions/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Tag } from "@/lib/constants";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ?? currentMonthIso();
  const tag = (params.tag ?? "all") as Tag | "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const summary = await getDashboardSummary({ month, tag });

  return (
    <div className="space-y-6">
      <DashboardGreeting email={user?.email ?? undefined} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão consolidada do período selecionado.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthFilter value={month} />
          <TagFilter value={tag} />
        </div>
      </div>

      <SummaryCards
        receitaTotal={summary.receitaTotal}
        despesaTotal={summary.despesaTotal}
        saldo={summary.saldo}
      />

      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Ações rápidas
        </h2>
        <QuickActions />
      </div>

      <UpcomingBillsWidget />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={summary.porCategoria} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Últimas transações</CardTitle>
            {summary.recent.length > 0 && (
              <Link
                href="/transacoes"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {summary.recent.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma transação no período.
                </p>
                <Link
                  href="/transacoes?new=1"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Criar primeira transação →
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {summary.recent.map((tx) => (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{tx.description}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {tx.tag}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tx.category} · {formatDate(tx.date)}
                      </p>
                    </div>
                    <span
                      className={`font-medium ${
                        tx.type === "receita" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {tx.type === "receita" ? "+" : "-"}
                      {formatCurrency(Number(tx.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
