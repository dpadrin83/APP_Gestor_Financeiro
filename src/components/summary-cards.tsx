import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface SummaryCardsProps {
  receitaTotal: number;
  despesaTotal: number;
  saldo: number;
}

export function SummaryCards({
  receitaTotal,
  despesaTotal,
  saldo,
}: SummaryCardsProps) {
  const isNegative = saldo < 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card
        title="Receitas"
        value={formatCurrency(receitaTotal)}
        icon={<ArrowUpCircle className="h-4 w-4" />}
        accent="emerald"
      />
      <Card
        title="Despesas"
        value={formatCurrency(despesaTotal)}
        icon={<ArrowDownCircle className="h-4 w-4" />}
        accent="rose"
      />
      <Card
        title="Saldo"
        value={formatCurrency(saldo)}
        icon={<Wallet className="h-4 w-4" />}
        accent={isNegative ? "rose" : "blue"}
        hint={isNegative ? "negativo" : "positivo"}
      />
    </div>
  );
}

type Accent = "emerald" | "rose" | "blue";

const ACCENT_STYLES: Record<
  Accent,
  { border: string; iconBg: string; iconText: string; valueText: string; dot: string }
> = {
  emerald: {
    border: "border-l-emerald-500",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-600 dark:text-emerald-400",
    valueText: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  rose: {
    border: "border-l-rose-500",
    iconBg: "bg-rose-500/10",
    iconText: "text-rose-600 dark:text-rose-400",
    valueText: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
  },
  blue: {
    border: "border-l-blue-500",
    iconBg: "bg-blue-500/10",
    iconText: "text-blue-600 dark:text-blue-400",
    valueText: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
};

function Card({
  title,
  value,
  icon,
  accent,
  hint,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent: Accent;
  hint?: string;
}) {
  const s = ACCENT_STYLES[accent];
  return (
    <div
      className={cn(
        "rounded-xl border border-l-4 bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
        s.border
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-md",
            s.iconBg,
            s.iconText
          )}
        >
          {icon}
        </span>
      </div>
      <p className={cn("mt-3 text-3xl font-bold tracking-tight", s.valueText)}>
        {value}
      </p>
      {hint && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
          {hint}
        </div>
      )}
    </div>
  );
}
