import Link from "next/link";
import { AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillStatusBadge } from "@/components/bill-status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getUpcomingAndOverdueBills } from "@/lib/bills/queries";

export async function UpcomingBillsWidget() {
  const { overdue, upcoming } = await getUpcomingAndOverdueBills(7);
  const items = [...overdue, ...upcoming];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Contas a vencer</CardTitle>
        <Link
          href="/alertas"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma conta vencendo nos próximos 7 dias. 🎉
          </p>
        ) : (
          <ul className="space-y-2">
            {items.slice(0, 5).map((inst) => (
              <li
                key={inst.bill.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
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
