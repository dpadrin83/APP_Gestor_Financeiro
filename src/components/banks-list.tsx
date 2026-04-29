"use client";

import { useState, useTransition } from "react";
import { Building2, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BankForm } from "@/components/bank-form";
import { BANK_TYPE_LABEL } from "@/lib/constants";
import type { Bank } from "@/lib/types";
import { deleteBankAction } from "@/lib/banks/actions";

export function BanksList({ banks }: { banks: Bank[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Bank | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleNew() {
    setEditing(null);
    setOpen(true);
  }

  function handleEdit(bank: Bank) {
    setEditing(bank);
    setOpen(true);
  }

  function handleDelete(bank: Bank) {
    if (!confirm(`Excluir o banco "${bank.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteBankAction(bank.id);
      if ("error" in result) setError(result.error);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={handleNew}>
          <Plus className="h-4 w-4" /> Novo banco
        </Button>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {banks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <Building2 className="h-8 w-8 opacity-50" />
            <p>Nenhum banco cadastrado ainda.</p>
            <p>
              Cadastre seus bancos e cartões para classificar transações e, no futuro,
              fazer conciliação dos extratos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {banks.map((bank) => (
            <Card key={bank.id} className="relative">
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full text-white"
                  style={{ backgroundColor: bank.color }}
                >
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{bank.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {BANK_TYPE_LABEL[bank.type]}
                    {bank.account_label ? ` · ${bank.account_label}` : ""}
                  </p>
                </div>
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
                    <DropdownMenuItem onClick={() => handleEdit(bank)}>
                      <Pencil className="h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(bank)}
                    >
                      <Trash2 className="h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BankForm
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
        bank={editing}
      />
    </div>
  );
}
