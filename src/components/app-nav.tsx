"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  CalendarRange,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/app/(auth)/actions";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transacoes", label: "Transações", icon: ListOrdered },
  { href: "/contas", label: "Contas", icon: CalendarRange },
  { href: "/bancos", label: "Bancos", icon: Building2 },
  { href: "/alertas", label: "Alertas", icon: Bell, badgeKey: "alerts" as const },
];

export function AppNav({
  email,
  alertsCount = 0,
}: {
  email?: string;
  alertsCount?: number;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <Wallet className="h-3.5 w-3.5" />
            </span>
            <span className="hidden lg:inline">Gestor Financeiro</span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const showBadge = item.badgeKey === "alerts" && alertsCount > 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative inline-flex h-8 flex-shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                  {showBadge && (
                    <Badge
                      variant="destructive"
                      className="h-4 min-w-4 px-1 text-[10px]"
                    >
                      {alertsCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {email && (
            <span className="hidden text-xs text-muted-foreground xl:block">
              {email}
            </span>
          )}
          <ThemeToggle />
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
