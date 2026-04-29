import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryPieChart } from "@/components/category-pie-chart";
import { MonthFilter } from "@/components/month-filter";
import { TagFilter } from "@/components/tag-filter";
import { UpcomingBillsWidget } from "@/components/upcoming-bills-widget";
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

  const summary = await getDashboardSummary({ month, tag });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão consolidada do período.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthFilter value={month} />
          <TagFilter value={tag} />
          <Button asChild size="sm">
            <Link href="/transacoes?new=1">
              <Plus className="h-4 w-4" />
              Nova transação
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receitas
            </CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.receitaTotal)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesas
            </CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-rose-600">
              {formatCurrency(summary.despesaTotal)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                summary.saldo >= 0 ? "text-blue-600" : "text-rose-600"
              }`}
            >
              {formatCurrency(summary.saldo)}
            </p>
          </CardContent>
        </Card>
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
          <CardHeader>
            <CardTitle>Últimas transações</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma transação no período.
              </p>
            ) : (
              <ul className="space-y-2">
                {summary.recent.map((tx) => (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
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
