-- Pagos con Stripe Checkout. Cada intento de pago es una fila; el aviso de Stripe
-- (webhook) la marca como pagada y da de alta lo contratado. Solo el servidor escribe.

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  organizacion_id uuid references public.organizaciones (id) on delete set null,
  correo text not null,
  nombre text,
  negocio text,
  modo text not null check (modo in ('unico', 'mensual')),
  metodo text check (metodo in ('tarjeta', 'transferencia')),
  items jsonb not null,                  -- [{ producto_id, nombre, precio_mxn, cobro, automatico }]
  sin_costo jsonb not null default '[]'::jsonb,
  codigo text,
  subtotal_mxn numeric(10, 2) not null,
  iva_mxn numeric(10, 2) not null,
  total_mxn numeric(10, 2) not null,
  stripe_sesion_id text unique,
  stripe_cliente_id text,
  stripe_suscripcion_id text,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'esperando_transferencia', 'pagado', 'fallido', 'expirado')),
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index pagos_org on public.pagos (organizacion_id);
create trigger tocar before update on public.pagos for each row execute function privado.tocar();

alter table public.pagos enable row level security;
create policy "ver mis pagos" on public.pagos for select to authenticated
  using ((select privado.es_miembro(organizacion_id)));

-- Para el servidor: el id de un usuario por su correo (para dar de alta a quien pagó).
create function public.usuario_por_correo(correo text)
returns uuid
language sql stable security definer set search_path = '' as $$
  select u.id from auth.users u where lower(u.email) = lower(trim(correo)) limit 1
$$;
revoke all on function public.usuario_por_correo(text) from public, anon, authenticated;
grant execute on function public.usuario_por_correo(text) to service_role;
