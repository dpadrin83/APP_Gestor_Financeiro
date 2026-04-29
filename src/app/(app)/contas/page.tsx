import {
  ArrowDownCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillsTable } from "@/components/bills-table";
import { MonthFilter } from "@/components/month-filter";
import {
  currentMonthIso,
  listBillInstances,
  referenceMonthFromIso,
  summarizeBills,
} from "@/lib/bills/queries";
import { formatCurrency } from "@/lib/utils";

export default async function ContasPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const monthIso = params.month ?? currentMonthIso();
  const referenceMonth = referenceMonthFromIso(monthIso);

  const instances = await listBillInstances(referenceMonth);
  const summary = summarizeBills(instances);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contas</h1>
          <p className="text-sm text-muted-foreground">
            Contas recorrentes e vencimentos do mês.
          </p>
        </div>
        <MonthFilter value={monthIso} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.pendentes + summary.agendadas}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.totalPendente)} a pagar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vencidas
            </CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-rose-600">{summary.vencidas}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.totalVencido)} em atraso
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{summary.pagas}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.totalPago)} no mês
            </p>
          </CardContent>
        </Card>
      </div>

      <BillsTable instances={instances} referenceMonth={referenceMonth} />
    </div>
  );
}
