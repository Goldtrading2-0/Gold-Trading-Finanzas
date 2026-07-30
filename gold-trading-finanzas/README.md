# Gold Trading 2.0 — Panel Financiero (privado)

Dashboard para vos: alumnos, pagos (ingresos) y gastos del negocio (egresos),
con resumen automático, MRR estimado, y aviso de pagos vencidos.

Es el mismo tipo de proyecto que el Diario de Trading, así que el proceso
para publicarlo es igual. Resumen rápido (si te trabás en algún paso, los
detalles completos están en la guía que ya usamos para el Diario):

## 1. Base de datos (Supabase)

**Importante: creá un proyecto de Supabase NUEVO, distinto al del Diario de
Trading.** El Diario tiene registro abierto para que se anoten tus alumnos;
si este panel usara el mismo proyecto, técnicamente cualquier alumno podría
entrar acá también. Con un proyecto aparte, este panel queda 100% cerrado.

1. supabase.com → New project.
2. SQL Editor → pegá todo `supabase-schema.sql` → Run.
3. Project Settings → API → copiá **Project URL** y **anon public key**
   (¡la URL sin `/rest/v1/` al final! — solo hasta `.supabase.co`).

## 2. Publicarlo (Vercel)

1. Subí esta carpeta a un repositorio nuevo en GitHub.
2. vercel.com → Add New Project → elegí ese repo.
3. Antes de Deploy, en Environment Variables cargá:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. Te da un link — ese es tu panel privado.

## 3. Crear tu única cuenta y cerrar el acceso

1. Entrá al link → "Crear cuenta" → registrate con tu email.
2. Andá a Supabase → **Authentication → Providers → Email** → desactivá el
   registro público (**"Allow new users to sign up"**, o el toggle
   equivalente). Esto evita que nadie más pueda crear una cuenta ahí, ni por
   error ni a propósito.
3. De ahí en más, entrás con "Ingresar".

## Cómo se usa

- **Resumen**: alumnos activos, MRR estimado, ingresos/egresos del mes,
  neto, gráfico de los últimos 6 meses, y aviso de alumnos con pago vencido
  (calculado automáticamente: último pago + 1 mes).
- **Alumnos**: alta/baja/edición, estado (activo/pausado/cancelado), monto
  del plan.
- **Ingresos**: cada pago que cargás, asociado a un alumno (o suelto, si es
  un ingreso sin alumno vinculado). El monto se autocompleta con el plan del
  alumno elegido, pero lo podés cambiar.
- **Egresos**: gastos del negocio por categoría (plataformas, publicidad,
  comisiones, producción de contenido, otros).

## A futuro: conectar cobros automáticos

Cuando quieras que los pagos se carguen solos (Mercado Pago, Hotmart, etc.)
en vez de a mano, se conecta vía webhook: cada vez que entra un cobro en la
plataforma de pago, esta app recibe el aviso y crea el registro en
"Ingresos" sola. Avisame cuando llegues a ese punto y lo armamos — no hace
falta rehacer nada de lo que ya tenés cargado.
