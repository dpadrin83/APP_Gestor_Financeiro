import Link from "next/link";
import { AlertCircle, ArrowRight, Calendar, CalendarPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillStatusBadge } from "@/components/bill-status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getUpcomingAndOverdueBills } from "@/lib/bills/queries";

export async function UpcomingBillsWidget() {
  const { overdue, upcoming } = await getUpcomingAndOverdueBills(7);
  const items = [...overdue, ...upcoming];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4 text-amber-500" />
          Contas a vencer
        </CardTitle>
        {items.length > 0 && (
          <Link
            href="/alertas"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CalendarPlus className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium">
                Nenhuma conta vencendo nos próximos 7 dias
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Cadastre suas contas recorrentes e nunca mais perca um vencimento.
              </p>
            </div>
            <Link
              href="/contas"
              className="text-xs font-medium text-primary hover:underline"
            >
              Cadastrar conta recorrente →
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.slice(0, 5).map((inst) => (
              <li
                key={inst.bill.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent/50"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {inst.status === "vencido" ? (
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-500" />
                  ) : (
                    <Calendar className="h-4 w-4 flex-shrink-0 text-amber-500" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{inst.bill.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Vence {formatDate(inst.due_date)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span className="font-medium">
                    {formatCurrency(Number(inst.bill.amount))}
                  </span>
                  <BillStatusBadge status={inst.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
