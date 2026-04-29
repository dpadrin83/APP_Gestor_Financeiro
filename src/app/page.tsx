import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  PieChart,
  ShieldCheck,
  Tag,
  Wallet,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: Wallet,
    title: "CRUD de Transações",
    desc: "Cadastre receitas e despesas em segundos com categorias prontas.",
  },
  {
    icon: PieChart,
    title: "Dashboard Visual",
    desc: "Cards de resumo e gráfico de pizza por categoria com Recharts.",
  },
  {
    icon: Tag,
    title: "Pessoal vs PJ",
    desc: "Separe finanças do estúdio e pessoais usando tags.",
  },
  {
    icon: BarChart3,
    title: "Filtros e Busca",
    desc: "Filtre por mês, categoria e busque por descrição.",
  },
  {
    icon: FileSpreadsheet,
    title: "Importar/Exportar CSV",
    desc: "Importe extratos e exporte os filtros em CSV.",
  },
  {
    icon: ShieldCheck,
    title: "Seguro com Supabase",
    desc: "Autenticação e Row Level Security: cada usuário só vê seus dados.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Wallet className="h-4 w-4" />
            </span>
            Gestor Financeiro
          </Link>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Criar conta</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                Pessoal + PJ no mesmo bolso
              </span>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Suas finanças com clareza,{" "}
                <span className="text-primary">sem planilha bagunçada.</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Cadastre receitas e despesas, separe pessoal de PJ por tag e veja seu
                saldo, gráficos e relatórios em segundos. Pensado para freelas e donos
                de estúdio criativo.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Começar grátis <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Já tenho conta</Link>
                </Button>
              </div>
            </div>

            <Card className="border-2">
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/40">
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      Receitas
                    </p>
                    <p className="text-lg font-semibold">R$ 12.430</p>
                  </div>
                  <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-950/40">
                    <p className="text-xs text-rose-700 dark:text-rose-400">
                      Despesas
                    </p>
                    <p className="text-lg font-semibold">R$ 7.812</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/40">
                    <p className="text-xs text-blue-700 dark:text-blue-400">Saldo</p>
                    <p className="text-lg font-semibold">R$ 4.618</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { c: "Salário", v: "+ R$ 8.500", t: "PJ" },
                    { c: "Alimentação", v: "- R$ 320", t: "Pessoal" },
                    { c: "Software", v: "- R$ 89", t: "PJ" },
                    { c: "Freelance", v: "+ R$ 1.200", t: "PJ" },
                  ].map((row) => (
                    <div
                      key={row.c}
                      className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">
                          {row.t}
                        </span>
                        {row.c}
                      </div>
                      <span
                        className={
                          row.v.startsWith("+")
                            ? "font-medium text-emerald-600"
                            : "font-medium text-rose-600"
                        }
                      >
                        {row.v}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Tudo que você precisa para começar
            </h2>
            <p className="mt-2 text-muted-foreground">
              Construído com Next.js, Supabase e shadcn/ui.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title}>
                <CardContent className="space-y-2 p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Gestor Financeiro</p>
          <p>Feito com Next.js + Supabase</p>
        </div>
      </footer>
    </div>
  );
}
