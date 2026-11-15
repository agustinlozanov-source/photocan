-- Radar de prospección (superadministrador). Solo el equipo de Phot8can (perfiles.es_staff).
-- Un escaneo = una zona + un rubro. Cada negocio guarda el id de Google (place_id), los datos
-- públicos de su ficha con la fecha en que se consultaron, y NUESTRO diagnóstico de su página.

create table public.radar_escaneos (
  id uuid primary key default gen_random_uuid(),
  zona text not null,
  rubro text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'escaneando', 'listo', 'error')),
  total int not null default 0,
  revisados int not null default 0,
  detalle text,
  creado_por uuid references auth.users (id) on delete set null,
  creado timestamptz not null default now(),
  terminado timestamptz
);

create table public.radar_negocios (
  id uuid primary key default gen_random_uuid(),
  escaneo_id uuid not null references public.radar_escaneos (id) on delete cascade,
  place_id text not null,
  posicion int not null,                 -- lugar en que lo devolvió Google para esa búsqueda
  nombre text,
  direccion text,
  telefono text,
  sitio text,
  calificacion numeric(2, 1),
  resenas int,
  categoria text,
  maps_url text,
  google_consultado timestamptz,         -- datos de Google: se refrescan, no se guardan para siempre
  diagnostico jsonb not null default '{}'::jsonb,   -- nuestro revisor + PageSpeed
  factores jsonb not null default '{}'::jsonb,      -- dolor, valor, demanda, presion, contacto (0-100)
  indice int,                            -- índice de oportunidad 0-100
  razon text,                            -- por qué está en el ranking, en una línea
  circulo int check (circulo between 1 and 4),
  estado text not null default 'detectado' check (estado in ('detectado', 'elegido', 'descartado')),
  creado timestamptz not null default now(),
  unique (escaneo_id, place_id)
);
create index radar_negocios_escaneo on public.radar_negocios (escaneo_id, indice desc);

alter table public.radar_escaneos enable row level security;
alter table public.radar_negocios enable row level security;

create policy "equipo ve escaneos" on public.radar_escaneos for select to authenticated using ((select privado.es_staff()));
create policy "equipo ve negocios" on public.radar_negocios for select to authenticated using ((select privado.es_staff()));
create policy "equipo marca negocios" on public.radar_negocios for update to authenticated
  using ((select privado.es_staff())) with check ((select privado.es_staff()));
