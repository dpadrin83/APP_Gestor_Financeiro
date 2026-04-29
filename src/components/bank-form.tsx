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
import { BANK_TYPES, BANK_TYPE_LABEL } from "@/lib/constants";
import type { Bank } from "@/lib/types";
import { createBankAction, updateBankAction } from "@/lib/banks/actions";

const PRESET_COLORS = [
  "#3b82f6", "#22c55e", "#f97316", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#0ea5e9", "#eab308", "#6366f1",
];

export function BankForm({
  open,
  onOpenChange,
  bank,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  bank?: Bank | null;
}) {
  const [type, setType] = useState<string>(bank?.type ?? "corrente");
  const [color, setColor] = useState<string>(bank?.color ?? "#3b82f6");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEdit = Boolean(bank);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("type", type);
    formData.set("color", color);

    startTransition(async () => {
      const result =
        isEdit && bank
          ? await updateBankAction(bank.id, formData)
          : await createBankAction(formData);
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
          <DialogTitle>{isEdit ? "Editar banco" : "Novo banco"}</DialogTitle>
          <DialogDescription>
            Cadastre uma conta bancária ou cartão para classificar suas transações.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank-name">Nome</Label>
            <Input
              id="bank-name"
              name="name"
              required
              defaultValue={bank?.name ?? ""}
              placeholder="Ex: Nubank, C6 Bank, Bradesco PJ"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BANK_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {BANK_TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_label">Identificação (opcional)</Label>
              <Input
                id="account_label"
                name="account_label"
                defaultValue={bank?.account_label ?? ""}
                placeholder="Ex: final 1234"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition ${
                    color === c
                      ? "border-foreground scale-110"
                      : "border-transparent hover:border-muted-foreground"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
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
              {isPending ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
