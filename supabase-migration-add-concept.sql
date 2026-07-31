-- Ejecutar SOLO si ya habías corrido supabase-schema.sql antes de esta
-- actualización (agrega la columna "concept" para clasificar ingresos:
-- Membresía, Mentoría 1-1, Curso grabado, Otro). Si es tu primera vez,
-- no hace falta este archivo: ya está incluido en supabase-schema.sql.

alter table public.payments
  add column if not exists concept text default 'Membresía mensual';
