"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const SHORT_MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function buildYearList(currentYear: number): number[] {
  const years: number[] = [];
  for (let y = currentYear - 5; y <= currentYear + 2; y++) years.push(y);
  return years;
}

export function MonthFilter({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [yearStr, monthStr] = value.split("-");
  const today = new Date();
  const year = Number(yearStr) || today.getFullYear();
  const month = Number(monthStr) || today.getMonth() + 1;

  function navigate(nextYear: number, nextMonth: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(
      "month",
      `${nextYear}-${String(nextMonth).padStart(2, "0")}`
    );
    router.push(`${pathname}?${params.toString()}`);
  }

  function goPrev() {
    if (month === 1) navigate(year - 1, 12);
    else navigate(year, month - 1);
  }

  function goNext() {
    if (month === 12) navigate(year + 1, 1);
    else navigate(year, month + 1);
  }

  const years = buildYearList(today.getFullYear());

  return (
    <div className="inline-flex h-9 items-center gap-0.5 rounded-md border bg-background p-1 shadow-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={goPrev}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Select
        value={String(month)}
        onValueChange={(v) => navigate(year, Number(v))}
      >
        <SelectTrigger className="h-7 min-w-28 border-0 bg-transparent px-2 shadow-none focus:ring-0">
          <SelectValue>
            <span className="text-sm font-medium">
              <span className="hidden sm:inline">{MONTHS[month - 1]}</span>
              <span className="sm:hidden">{SHORT_MONTHS[month - 1]}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((name, idx) => (
            <SelectItem key={idx} value={String(idx + 1)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(year)}
        onValueChange={(v) => navigate(Number(v), month)}
      >
        <SelectTrigger className="h-7 min-w-16 border-0 bg-transparent px-2 shadow-none focus:ring-0">
          <SelectValue>
            <span className="text-sm font-medium tabular-nums">{year}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={goNext}
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
