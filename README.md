# Gestor Financeiro

Web app de gestão financeira pessoal e da PJ no mesmo lugar. Cadastre receitas e
despesas, separe por tag (Pessoal/PJ), visualize um dashboard com gráfico de
pizza por categoria, filtre por mês e categoria, importe e exporte CSV.

Construído com Next.js 16, Supabase (Auth + PostgreSQL + RLS), Tailwind CSS v4,
shadcn/ui e Recharts.

## Features

- Login e cadastro com Supabase Auth (e-mail + senha)
- Proteção de rotas via `proxy.ts` (Next.js 16)
- CRUD de transações (descrição, valor, data, tipo, categoria, tag)
- Dashboard com cards de Receitas, Despesas e Saldo
- Gráfico de pizza de despesas por categoria (Recharts)
- Filtros por mês, tipo, categoria, tag e busca por descrição
- Importar e exportar CSV (UTF-8 com BOM)
- Row Level Security: cada usuário só vê suas transações
- Layout responsivo (mobile-first)

## Setup local

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar projeto Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto.
2. Em **SQL Editor**, cole e execute o conteúdo de [supabase/schema.sql](supabase/schema.sql).
3. Em **Authentication → Providers**, mantenha _Email_ habilitado. Para
   desenvolvimento, desabilite "Confirm email" para login imediato.
4. Em **Settings → API**, copie a `Project URL` e a `anon public` key.

### 3. Variáveis de ambiente

Copie o template e preencha com suas credenciais:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 4. Rodar em modo dev

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Deploy na Vercel

1. Faça push do repo para GitHub.
2. No painel da Vercel, **Import Project** e selecione o repo.
3. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Clique em **Deploy**.

## Estrutura

```
src/
├── app/
│   ├── (auth)/             # rotas de login e signup
│   │   ├── actions.ts      # server actions de auth
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/              # rotas autenticadas
│   │   ├── layout.tsx      # checa sessão e renderiza nav
│   │   ├── dashboard/page.tsx
│   │   └── transacoes/page.tsx
│   └── page.tsx            # landing
├── components/
│   ├── ui/                 # shadcn/ui (button, card, dialog, ...)
│   ├── auth-form.tsx
│   ├── transaction-form.tsx
│   ├── transactions-table.tsx
│   └── category-pie-chart.tsx
├── lib/
│   ├── supabase/           # browser, server, proxy clients
│   ├── transactions/       # actions e queries
│   ├── constants.ts        # categorias, tags, cores
│   ├── csv.ts              # parser e gerador CSV
│   ├── types.ts
│   └── utils.ts
├── proxy.ts                # antigo middleware (Next 16)
└── supabase/schema.sql
```

## Formato CSV

Cabeçalhos esperados (separador `,`, encoding UTF-8):

```csv
data,descricao,valor,tipo,categoria,tag
2025-04-29,Mercado da semana,320.50,despesa,Alimentação,Pessoal
2025-04-28,Pagamento cliente X,2500.00,receita,Freelance,PJ
```

- `data`: `YYYY-MM-DD`
- `valor`: positivo, ponto ou vírgula como decimal
- `tipo`: `receita` ou `despesa`
- `categoria`: Alimentação, Transporte, Moradia, Lazer, Saúde, Educação, Salário, Freelance, Outros (default: Outros)
- `tag`: Pessoal ou PJ (default: Pessoal)

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- [Supabase](https://supabase.com/) (Auth, PostgreSQL, RLS)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- [Recharts](https://recharts.org/)
- [lucide-react](https://lucide.dev/)
