"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BILL_CATEGORIES,
  BILL_RECURRENCES,
  BILL_STATUSES,
} from "@/lib/constants";
import type { RecurringBill } from "@/lib/types";
import { createBillAction, updateBillAction } from "@/lib/bills/actions";

const RECURRENCE_LABEL: Record<string, string> = {
  mensal: "Mensal",
  anual: "Anual",
  semanal: "Semanal",
};

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  agendado: "Agendado",
  pago: "Pago",
  vencido: "Vencido",
};

export function BillForm({
  open,
  onOpenChange,
  bill,
  referenceMonth,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  bill?: RecurringBill | null;
  referenceMonth: string;
}) {
  const [category, setCategory] = useState<string>(bill?.category ?? "Conta fixa");
  const [recurrence, setRecurrence] = useState<string>(bill?.recurrence ?? "mensal");
  const [initialStatus, setInitialStatus] = useState<string>("pendente");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(bill);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("category", category);
    formData.set("recurrence", recurrence);
    formData.set("active", "true");
    if (!isEdit) {
      formData.set("initial_status", initialStatus);
      formData.set("reference_month", referenceMonth);
    }

    startTransition(async () => {
      const result =
        isEdit && bill
          ? await updateBillAction(bill.id, formData)
          : await createBillAction(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar conta" : "Nova conta recorrente"}
          </DialogTitle>
          <DialogDescription>
            Cadastre uma despesa que se repete (assinatura, fatura, fornecedor) e
            acompanhe os vencimentos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bill-name">Nome da conta</Label>
            <Input
              id="bill-name"
              name="name"
              required
              defaultValue={bill?.name ?? ""}
              placeholder="Ex: Plano de Saúde, Spotify, Contador..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="bill-amount">Valor (R$)</Label>
              <Input
                id="bill-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={bill?.amount ?? ""}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-due-day">Dia do vencimento</Label>
              <Input
                id="bill-due-day"
                name="due_day"
                type="number"
                min="1"
                max="31"
                required
                defaultValue={bill?.due_day ?? 10}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recorrência</Label>
              <Select value={recurrence} onValueChange={setRecurrence}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILL_RECURRENCES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {RECURRENCE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label>Status inicial (mês corrente)</Label>
              <Select value={initialStatus} onValueChange={setInitialStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bill-notes">Observação (opcional)</Label>
            <Input
              id="bill-notes"
              name="notes"
              defaultValue={bill?.notes ?? ""}
              placeholder="Ex: débito automático Nubank"
            />
          </div>

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : isEdit ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
