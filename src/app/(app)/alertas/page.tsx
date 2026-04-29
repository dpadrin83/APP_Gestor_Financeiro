import { AlertCircle, Bell, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillStatusBadge } from "@/components/bill-status-badge";
import { getUpcomingAndOverdueBills } from "@/lib/bills/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BillInstance } from "@/lib/types";

export default async function AlertasPage() {
  const { overdue, upcoming } = await getUpcomingAndOverdueBills(15);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alertas</h1>
        <p className="text-sm text-muted-foreground">
          Contas que precisam de atenção: vencidas e próximas dos 15 dias.
        </p>
      </div>

      <Card>
        <CardContent className="flex items-start gap-3 p-4">
          <Bell className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
          <div className="text-sm">
            <p className="font-medium">Avisos via WhatsApp e e-mail</p>
            <p className="text-muted-foreground">
              Em breve você poderá ativar lembretes automáticos antes do
              vencimento. Por enquanto, acompanhe os alertas por aqui.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <AlertSection
          title="Vencidas"
          icon={<AlertCircle className="h-4 w-4 text-rose-500" />}
          items={overdue}
          empty="Nenhuma conta vencida — bom trabalho! 🎉"
          badgeVariant="destructive"
        />
        <AlertSection
          title="Próximos vencimentos"
          icon={<CalendarClock className="h-4 w-4 text-amber-500" />}
          items={upcoming}
          empty="Nenhum vencimento nos próximos 15 dias."
          badgeVariant="secondary"
        />
      </div>
    </div>
  );
}

function AlertSection({
  title,
  icon,
  items,
  empty,
  badgeVariant,
}: {
  title: string;
  icon: React.ReactNode;
  items: BillInstance[];
  empty: string;
  badgeVariant: "destructive" | "secondary";
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
        <Badge variant={badgeVariant}>{items.length}</Badge>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((inst) => (
              <li
                key={inst.bill.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{inst.bill.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Vence {formatDate(inst.due_date)} · {inst.bill.category}
                  </p>
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
