-- Gestor Financeiro - Migration 0002
-- Adiciona: bancos, contas recorrentes, instâncias mensais (bill_payments)
-- e fundação para conciliação (bank_id em transactions).
-- Execute no SQL Editor do Supabase.

-------------------------------------------------------------------------------
-- 1. BANKS
-------------------------------------------------------------------------------

create table if not exists public.banks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'corrente'
    check (type in ('corrente', 'poupanca', 'cartao', 'investimento', 'outro')),
  account_label text,
  color text not null default '#3b82f6',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists banks_user_id_idx on public.banks(user_id);

alter table public.banks enable row level security;

drop policy if exists "Users can view own banks" on public.banks;
create policy "Users can view own banks"
  on public.banks for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own banks" on public.banks;
create policy "Users can insert own banks"
  on public.banks for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own banks" on public.banks;
create policy "Users can update own banks"
  on public.banks for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own banks" on public.banks;
create policy "Users can delete own banks"
  on public.banks for delete using (auth.uid() = user_id);

drop trigger if exists set_updated_at on public.banks;
create trigger set_updated_at
  before update on public.banks
  for each row execute function public.handle_updated_at();

-------------------------------------------------------------------------------
-- 2. RECURRING BILLS
-------------------------------------------------------------------------------

create table if not exists public.recurring_bills (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  due_day int not null check (due_day between 1 and 31),
  category text not null default 'Outros',
  recurrence text not null default 'mensal'
    check (recurrence in ('mensal', 'anual', 'semanal')),
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recurring_bills_user_id_idx on public.recurring_bills(user_id);

alter table public.recurring_bills enable row level security;

drop policy if exists "Users can view own bills" on public.recurring_bills;
create policy "Users can view own bills"
  on public.recurring_bills for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own bills" on public.recurring_bills;
create policy "Users can insert own bills"
  on public.recurring_bills for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own bills" on public.recurring_bills;
create policy "Users can update own bills"
  on public.recurring_bills for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own bills" on public.recurring_bills;
create policy "Users can delete own bills"
  on public.recurring_bills for delete using (auth.uid() = user_id);

drop trigger if exists set_updated_at on public.recurring_bills;
create trigger set_updated_at
  before update on public.recurring_bills
  for each row execute function public.handle_updated_at();

-------------------------------------------------------------------------------
-- 3. BILL PAYMENTS (instâncias mensais)
-------------------------------------------------------------------------------
-- Cada linha representa o status de uma conta em um mês de referência.
-- reference_month é sempre o dia 1 do mês (ex: 2026-04-01 = abril/2026).

create table if not exists public.bill_payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bill_id uuid not null references public.recurring_bills(id) on delete cascade,
  reference_month date not null,
  status text not null default 'pendente'
    check (status in ('pendente', 'agendado', 'pago', 'vencido')),
  paid_at date,
  amount_paid numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, bill_id, reference_month)
);

create index if not exists bill_payments_user_id_idx on public.bill_payments(user_id);
create index if not exists bill_payments_bill_id_idx on public.bill_payments(bill_id);
create index if not exists bill_payments_reference_idx on public.bill_payments(reference_month);

alter table public.bill_payments enable row level security;

drop policy if exists "Users can view own payments" on public.bill_payments;
create policy "Users can view own payments"
  on public.bill_payments for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own payments" on public.bill_payments;
create policy "Users can insert own payments"
  on public.bill_payments for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own payments" on public.bill_payments;
create policy "Users can update own payments"
  on public.bill_payments for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own payments" on public.bill_payments;
create policy "Users can delete own payments"
  on public.bill_payments for delete using (auth.uid() = user_id);

drop trigger if exists set_updated_at on public.bill_payments;
create trigger set_updated_at
  before update on public.bill_payments
  for each row execute function public.handle_updated_at();

-------------------------------------------------------------------------------
-- 4. TRANSACTIONS: campos para conciliação
-------------------------------------------------------------------------------

alter table public.transactions
  add column if not exists bank_id uuid references public.banks(id) on delete set null;

alter table public.transactions
  add column if not exists external_id text;

alter table public.transactions
  add column if not exists reconciled boolean not null default false;

create index if not exists transactions_bank_id_idx on public.transactions(bank_id);
