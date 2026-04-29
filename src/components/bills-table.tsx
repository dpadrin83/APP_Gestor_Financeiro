"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Check, MoreVertical, Pencil, Plus, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BillForm } from "@/components/bill-form";
import { BillStatusBadge } from "@/components/bill-status-badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { BillInstance, RecurringBill } from "@/lib/types";
import {
  deleteBillAction,
  setBillStatusAction,
} from "@/lib/bills/actions";

type Filter = "todas" | "pendentes" | "pagas" | "vencidas";

const TABS: { key: Filter; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "pendentes", label: "Pendentes" },
  { key: "pagas", label: "Pagas" },
  { key: "vencidas", label: "Vencidas" },
];

export function BillsTable({
  instances,
  referenceMonth,
}: {
  instances: BillInstance[];
  referenceMonth: string;
}) {
  const [filter, setFilter] = useState<Filter>("todas");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringBill | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 3500);
    return () => clearTimeout(t);
  }, [feedback]);

  const counts = useMemo(() => {
    const c = { todas: instances.length, pendentes: 0, pagas: 0, vencidas: 0 };
    for (const i of instances) {
      if (i.status === "pendente" || i.status === "agendado") c.pendentes++;
      else if (i.status === "pago") c.pagas++;
      else if (i.status === "vencido") c.vencidas++;
    }
    return c;
  }, [instances]);

  const filtered = useMemo(() => {
    if (filter === "todas") return instances;
    if (filter === "pendentes")
      return instances.filter(
        (i) => i.status === "pendente" || i.status === "agendado"
      );
    if (filter === "pagas") return instances.filter((i) => i.status === "pago");
    return instances.filter((i) => i.status === "vencido");
  }, [filter, instances]);

  function handleNew() {
    setEditing(null);
    setOpen(true);
  }

  function handleEdit(bill: RecurringBill) {
    setEditing(bill);
    setOpen(true);
  }

  function handleDelete(bill: RecurringBill) {
    if (!confirm(`Excluir a conta "${bill.name}"? Os históricos serão removidos.`))
      return;
    startTransition(async () => {
      const result = await deleteBillAction(bill.id);
      if ("error" in result) setFeedback({ kind: "err", msg: result.error });
      else setFeedback({ kind: "ok", msg: "Conta excluída." });
    });
  }

  function handleMarkPaid(inst: BillInstance) {
    startTransition(async () => {
      const result = await setBillStatusAction(
        inst.bill.id,
        inst.reference_month,
        "pago",
        Number(inst.bill.amount)
      );
      if ("error" in result) setFeedback({ kind: "err", msg: result.error });
      else setFeedback({ kind: "ok", msg: `${inst.bill.name} marcada como paga.` });
    });
  }

  function handleUndo(inst: BillInstance) {
    startTransition(async () => {
      const result = await setBillStatusAction(
        inst.bill.id,
        inst.reference_month,
        "pendente"
      );
      if ("error" in result) setFeedback({ kind: "err", msg: result.error });
      else setFeedback({ kind: "ok", msg: "Pagamento revertido." });
    });
  }

  function handleSchedule(inst: BillInstance) {
    startTransition(async () => {
      const result = await setBillStatusAction(
        inst.bill.id,
        inst.reference_month,
        "agendado"
      );
      if ("error" in result) setFeedback({ kind: "err", msg: result.error });
      else setFeedback({ kind: "ok", msg: "Pagamento agendado." });
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1 rounded-md border bg-secondary p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-colors",
                filter === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                {counts[tab.key]}
              </Badge>
            </button>
          ))}
        </div>
        <Button size="sm" onClick={handleNew}>
          <Plus className="h-4 w-4" /> Nova conta
        </Button>
      </div>

      {feedback && (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            feedback.kind === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.msg}
        </p>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="w-32">Vencimento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {instances.length === 0
                    ? "Nenhuma conta recorrente cadastrada. Adicione a primeira."
                    : "Nenhuma conta nesse filtro."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inst) => (
                <TableRow key={inst.bill.id}>
                  <TableCell>
                    <div className="font-medium">{inst.bill.name}</div>
                    {inst.bill.notes && (
                      <div className="text-xs text-muted-foreground">{inst.bill.notes}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{inst.bill.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(inst.due_date)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(inst.bill.amount))}
                  </TableCell>
                  <TableCell>
                    <BillStatusBadge status={inst.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isPending}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {inst.status !== "pago" && (
                          <DropdownMenuItem onClick={() => handleMarkPaid(inst)}>
                            <Check className="h-4 w-4" /> Marcar como pago
                          </DropdownMenuItem>
                        )}
                        {inst.status === "pendente" && (
                          <DropdownMenuItem onClick={() => handleSchedule(inst)}>
                            <Check className="h-4 w-4" /> Agendar pagamento
                          </DropdownMenuItem>
                        )}
                        {inst.status === "pago" && (
                          <DropdownMenuItem onClick={() => handleUndo(inst)}>
                            <Undo2 className="h-4 w-4" /> Reverter pagamento
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(inst.bill)}>
                          <Pencil className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(inst.bill)}
                        >
                          <Trash2 className="h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BillForm
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
        bill={editing}
        referenceMonth={referenceMonth}
      />
    </div>
  );
}
