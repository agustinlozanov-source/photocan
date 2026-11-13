-- Sitio web de cada cliente: repo en GitHub, sitio en Netlify y la sesión del agente
-- de Claude que lo construye. Lo escribe el servidor (service_role); el cliente solo lee.

create table public.sitios (
  organizacion_id uuid primary key references public.organizaciones (id) on delete cascade,
  repo text,                     -- "phot8can-dotcom/clinica-sonrisa"
  netlify_site_id text,
  netlify_url text,              -- https://clinica-sonrisa.netlify.app
  rama text,                     -- rama donde trabaja el agente
  pr_numero integer,
  vista_previa_url text,
  produccion_url text,
  sesion_id text,                -- sesión de Managed Agents
  estado text not null default 'preparando'
    check (estado in ('preparando', 'construyendo', 'revision', 'publicando', 'en_linea', 'error')),
  detalle text,                  -- mensaje para el cliente o para el equipo
  resumen_agente text,           -- lo que reportó el agente al terminar
  costo_centavos_usd integer,    -- costo de lista de la sesión
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create trigger tocar before update on public.sitios for each row execute function privado.tocar();

alter table public.sitios enable row level security;
create policy "ver mi sitio" on public.sitios for select to authenticated
  using ((select privado.es_miembro(organizacion_id)));

-- Ajustes internos del servidor (ids del agente y del entorno). Sin reglas: solo service_role.
create table public.ajustes (
  clave text primary key,
  valor jsonb not null,
  actualizado timestamptz not null default now()
);
alter table public.ajustes enable row level security;
