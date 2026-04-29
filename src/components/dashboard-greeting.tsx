import { Sparkles } from "lucide-react";

function greetingFor(hour: number): string {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function todayLabel(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function DashboardGreeting({ email }: { email?: string }) {
  const hour = new Date().getHours();
  const greeting = greetingFor(hour);
  const name = email ? email.split("@")[0] : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="text-lg font-semibold">
            {greeting}
            {name ? `, ${name}` : ""}.
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {todayLabel()}
          </p>
        </div>
      </div>
    </div>
  );
}
