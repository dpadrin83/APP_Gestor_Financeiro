import type { Transaction } from "./types";
import {
  CATEGORIES,
  TAGS,
  TRANSACTION_TYPES,
  type Category,
  type Tag,
  type TransactionType,
} from "./constants";

const HEADERS = ["data", "descricao", "valor", "tipo", "categoria", "tag"] as const;

function escapeCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function transactionsToCsv(transactions: Transaction[]): string {
  const lines = [HEADERS.join(",")];
  for (const tx of transactions) {
    const row = [
      tx.date,
      tx.description,
      Number(tx.amount).toFixed(2).replace(".", ","),
      tx.type,
      tx.category,
      tx.tag,
    ].map((c) => escapeCell(String(c)));
    lines.push(row.join(","));
  }
  return lines.join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ParsedCsvRow {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: Category;
  tag: Tag;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

export function parseCsv(text: string): ParsedCsvRow[] {
  const stripped = text.replace(/^﻿/, "");
  const lines = stripped.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const idx = {
    date: header.indexOf("data"),
    description: header.indexOf("descricao"),
    amount: header.indexOf("valor"),
    type: header.indexOf("tipo"),
    category: header.indexOf("categoria"),
    tag: header.indexOf("tag"),
  };

  if (idx.date < 0 || idx.description < 0 || idx.amount < 0 || idx.type < 0) {
    throw new Error(
      "CSV inválido. Cabeçalhos esperados: data, descricao, valor, tipo, categoria, tag"
    );
  }

  const rows: ParsedCsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const dateRaw = (cols[idx.date] ?? "").trim();
    const description = (cols[idx.description] ?? "").trim();
    const amountRaw = (cols[idx.amount] ?? "").trim().replace(/\./g, "").replace(",", ".");
    const typeRaw = (cols[idx.type] ?? "").trim().toLowerCase();
    const categoryRaw = idx.category >= 0 ? (cols[idx.category] ?? "").trim() : "Outros";
    const tagRaw = idx.tag >= 0 ? (cols[idx.tag] ?? "").trim() : "Pessoal";

    if (!description || !dateRaw) continue;
    const amount = Number(amountRaw);
    if (!amount || amount <= 0) continue;

    const type = (TRANSACTION_TYPES as readonly string[]).includes(typeRaw)
      ? (typeRaw as TransactionType)
      : null;
    if (!type) continue;

    const category = (CATEGORIES as readonly string[]).includes(categoryRaw)
      ? (categoryRaw as Category)
      : "Outros";
    const tag = (TAGS as readonly string[]).includes(tagRaw) ? (tagRaw as Tag) : "Pessoal";

    rows.push({ description, amount, date: dateRaw, type, category, tag });
  }
  return rows;
}
