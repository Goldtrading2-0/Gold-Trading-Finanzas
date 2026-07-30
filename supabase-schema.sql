-- =========================================================
-- GOLD TRADING 2.0 — PANEL FINANCIERO — Esquema de base de datos
-- Pegar y ejecutar TODO este archivo en:
-- Supabase > tu proyecto > SQL Editor > New query > Run
--
-- IMPORTANTE: usá un proyecto de Supabase NUEVO y SEPARADO del Diario de
-- Trading (no el mismo). El Diario tiene registro público habilitado para
-- alumnos; si usaras el mismo proyecto acá, cualquier alumno que se registre
-- en el Diario podría entrar también a este panel financiero, porque
-- comparten la misma base de usuarios. Un proyecto aparte lo mantiene
-- completamente aislado.
-- =========================================================

create table if not exists public.students (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text,
  phone text,
  plan_amount numeric default 47,
  status text default 'activo' check (status in ('activo','pausado','cancelado')),
  join_date date default current_date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete set null,
  amount numeric not null,
  payment_date date not null default current_date,
  method text default 'Transferencia',
  period_label text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  expense_date date not null default current_date,
  category text default 'Otros',
  description text,
  amount numeric not null,
  created_at timestamptz default now()
);

create index if not exists payments_date_idx on public.payments(payment_date);
create index if not exists expenses_date_idx on public.expenses(expense_date);

-- Seguridad: esta app es privada (solo vos vas a tener cuenta acá), así que
-- cualquier usuario autenticado puede leer/escribir todo.
alter table public.students enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;

drop policy if exists "auth_all_students" on public.students;
create policy "auth_all_students" on public.students for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "auth_all_payments" on public.payments;
create policy "auth_all_payments" on public.payments for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "auth_all_expenses" on public.expenses;
create policy "auth_all_expenses" on public.expenses for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- =========================================================
-- IMPORTANTE — Después de correr esto:
-- 1. Entrá a la app y creá tu única cuenta (pestaña "Crear cuenta").
-- 2. Andá a Supabase > Authentication > Providers > Email, y desactivá
--    "Allow new users to sign up" (o el toggle de registro). Así el panel
--    queda cerrado: nadie más se puede crear una cuenta ahí.
-- =========================================================
