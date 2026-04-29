import Link from "next/link";
import {
  Building2,
  CalendarPlus,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    href: "/transacoes?new=1",
    label: "Nova transação",
    icon: Plus,
    accent: "from-blue-500/15 to-blue-500/0 text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/15",
  },
  {
    href: "/contas",
    label: "Nova conta",
    icon: CalendarPlus,
    accent: "from-violet-500/15 to-violet-500/0 text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-500/15",
  },
  {
    href: "/transacoes",
    label: "Importar CSV",
    icon: FileSpreadsheet,
    accent: "from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/15",
  },
  {
    href: "/bancos",
    label: "Cadastrar banco",
    icon: Building2,
    accent: "from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-500",
    iconBg: "bg-amber-500/15",
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.href + a.label}
            href={a.href}
            className={cn(
              "group flex items-center gap-3 rounded-xl border bg-gradient-to-br p-4 transition-all hover:-translate-y-0.5 hover:shadow-md",
              a.accent
            )}
          >
            <span
              className={cn(
                "grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg",
                a.iconBg
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-foreground">{a.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
