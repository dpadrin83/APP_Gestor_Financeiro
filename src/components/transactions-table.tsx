"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Download, MoreVertical, Pencil, Plus, Trash2, Upload } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionForm } from "@/components/transaction-form";
import { downloadCsv, parseCsv, transactionsToCsv } from "@/lib/csv";
import {
  deleteTransactionAction,
  importTransactionsAction,
} from "@/lib/transactions/actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

export function TransactionsTable({
  transactions,
  initialOpenNew = false,
}: {
  transactions: Transaction[];
  initialOpenNew?: boolean;
}) {
  const [open, setOpen] = useState(initialOpenNew);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  function handleNew() {
    setEditing(null);
    setOpen(true);
  }

  function handleEdit(tx: Transaction) {
    setEditing(tx);
    setOpen(true);
  }

  function handleDelete(tx: Transaction) {
    if (!confirm(`Excluir "${tx.description}"?`)) return;
    startTransition(async () => {
      const result = await deleteTransactionAction(tx.id);
      if ("error" in result) setFeedback({ kind: "err", msg: result.error });
      else setFeedback({ kind: "ok", msg: "Transação excluída." });
    });
  }

  function handleExport() {
    const csv = transactionsToCsv(transactions);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`transacoes-${stamp}.csv`, csv);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseCsv(String(reader.result ?? ""));
        if (!rows.length) {
          setFeedback({ kind: "err", msg: "Nenhuma linha válida no CSV." });
          return;
        }
        startTransition(async () => {
          const result = await importTransactionsAction(rows);
          if ("error" in result) {
            setFeedback({ kind: "err", msg: result.error });
          } else {
            setFeedback({
              kind: "ok",
              msg: `${result.imported ?? rows.length} transações importadas.`,
            });
          }
        });
      } catch (err) {
        setFeedback({
          kind: "err",
          msg: err instanceof Error ? err.message : "Erro ao ler o CSV.",
        });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file, "utf-8");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleImport}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
        >
          <Upload className="h-4 w-4" /> Importar CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={transactions.length === 0}
        >
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
        <Button size="sm" onClick={handleNew}>
          <Plus className="h-4 w-4" /> Nova
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
              <TableHead className="w-24">Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma transação encontrada. Crie a primeira.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(tx.date)}
                  </TableCell>
                  <TableCell className="font-medium">{tx.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{tx.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tx.tag}</Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      tx.type === "receita" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {tx.type === "receita" ? "+" : "-"}
                    {formatCurrency(Number(tx.amount))}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(tx)}>
                          <Pencil className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(tx)}
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

      <TransactionForm
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
        transaction={editing}
      />
    </div>
  );
}
