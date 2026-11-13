-- Portal de cliente de Phot8can · estructura inicial
--
-- Cada cliente es una ORGANIZACIÓN. Todas las tablas llevan organizacion_id y
-- reglas por fila (RLS): un cliente solo ve lo de su organización; el equipo de
-- Phot8can (perfiles.es_staff) ve todo. Los cambios de estado que hacen el
-- servidor, el agente de IA o los webhooks de Stripe usan la service_role, que no
-- pasa por RLS.

-- ─────────────────────────────────────────────────────────────── Tipos

create type public.rol_miembro as enum ('dueno', 'editor', 'soporte');
create type public.fase_proyecto as enum ('briefing', 'diseno', 'revision', 'en_linea');
create type public.tipo_producto as enum ('pagina', 'plan', 'base', 'complemento', 'dominio', 'hospedaje');
create type public.tipo_cobro as enum ('unico', 'mensual', 'anual', 'uso');
create type public.estado_contrato as enum ('pendiente_pago', 'preparacion', 'activo', 'cancelado');
create type public.complejidad as enum ('simple', 'mediano', 'complejo', 'equipo');
create type public.estado_cambio as enum ('clasificado', 'confirmado', 'trabajando', 'vista_previa', 'publicado', 'cancelado');
create type public.estado_solicitud as enum ('abierta', 'en_curso', 'resuelta', 'cerrada');

-- ─────────────────────────────────────────────────────────────── Funciones internas

create schema if not exists privado;
grant usage on schema privado to authenticated;

create function privado.tocar() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.actualizado := now();
  return new;
end $$;

-- ─────────────────────────────────────────────────────────────── Perfiles

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  telefono text,
  es_staff boolean not null default false,
  creado timestamptz not null default now()
);
comment on table public.perfiles is 'Una fila por usuario. es_staff = equipo de Phot8can.';

-- Crea el perfil al registrarse (enlace mágico).
create function privado.nuevo_usuario() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function privado.nuevo_usuario();

-- ─────────────────────────────────────────────────────────────── Organizaciones y miembros

create table public.organizaciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  dominio text,
  fase public.fase_proyecto not null default 'briefing',
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create trigger tocar before update on public.organizaciones for each row execute function privado.tocar();

create table public.miembros (
  organizacion_id uuid not null references public.organizaciones (id) on delete cascade,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  rol public.rol_miembro not null default 'editor',
  creado timestamptz not null default now(),
  primary key (organizacion_id, usuario_id)
);
create index miembros_usuario on public.miembros (usuario_id);

create function privado.es_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select p.es_staff from public.perfiles p where p.id = (select auth.uid())), false)
$$;

create function privado.es_miembro(org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.miembros m
    where m.organizacion_id = org and m.usuario_id = (select auth.uid())
  ) or privado.es_staff()
$$;

create function privado.es_dueno(org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.miembros m
    where m.organizacion_id = org and m.usuario_id = (select auth.uid()) and m.rol = 'dueno'
  ) or privado.es_staff()
$$;

-- Para rutas de archivos: la primera carpeta es el id de la organización.
create function privado.es_miembro_ruta(ruta text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare
  carpeta text := split_part(ruta, '/', 1);
begin
  if carpeta !~ '^[0-9a-fA-F-]{36}$' then
    return false;
  end if;
  return privado.es_miembro(carpeta::uuid);
end $$;

revoke all on function privado.es_staff(), privado.es_miembro(uuid), privado.es_dueno(uuid), privado.es_miembro_ruta(text) from public;
grant execute on function privado.es_staff(), privado.es_miembro(uuid), privado.es_dueno(uuid), privado.es_miembro_ruta(text) to authenticated;

-- ─────────────────────────────────────────────────────────────── Catálogo

create table public.productos (
  id text primary key,
  tipo public.tipo_producto not null,
  nombre text not null,
  resumen text,
  precio_mxn numeric(10, 2),            -- null = por definir
  cobro public.tipo_cobro not null,
  automatico boolean not null default false, -- true: se activa al pagar; false: lo prepara el equipo
  incluye jsonb not null default '{}'::jsonb,
  activo boolean not null default true,
  orden smallint not null default 0
);
comment on column public.productos.precio_mxn is 'Precio en pesos. NULL = por definir.';

-- ─────────────────────────────────────────────────────────────── Contratados

create table public.contratados (
  id uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references public.organizaciones (id) on delete cascade,
  producto_id text not null references public.productos (id),
  nombre text not null,                  -- copia del nombre, p. ej. el dominio comprado
  estado public.estado_contrato not null default 'pendiente_pago',
  precio_mxn numeric(10, 2),             -- precio pactado al contratar
  cobro public.tipo_cobro not null,
  stripe_suscripcion_id text,
  inicio timestamptz not null default now(),
  fin timestamptz,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index contratados_org on public.contratados (organizacion_id);
create index contratados_producto on public.contratados (producto_id);
create trigger tocar before update on public.contratados for each row execute function privado.tocar();

-- ─────────────────────────────────────────────────────────────── Briefing

create table public.briefings (
  organizacion_id uuid primary key references public.organizaciones (id) on delete cascade,
  modo text check (modo in ('yo', 'asistido')),
  respuestas jsonb not null default '{}'::jsonb, -- { "negocio.nombre": "…", "servicios.lista": [ … ] }
  avance smallint not null default 0 check (avance between 0 and 100),
  llamada jsonb,                                -- { dia, horario, telefono }
  enviado_en timestamptz,
  actualizado_por uuid references auth.users (id) on delete set null,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index briefings_actualizado_por on public.briefings (actualizado_por);
create trigger tocar before update on public.briefings for each row execute function privado.tocar();

create table public.briefing_archivos (
  id uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references public.organizaciones (id) on delete cascade,
  pregunta text not null,                -- p. ej. "identidad.logoArchivo"
  ruta text not null unique,             -- ruta en el bucket "briefing": {organizacion_id}/{pregunta}/{archivo}
  nombre text not null,
  tamano_bytes bigint,
  tipo_mime text,
  subido_por uuid references auth.users (id) on delete set null,
  creado timestamptz not null default now()
);
create index briefing_archivos_org on public.briefing_archivos (organizacion_id);
create index briefing_archivos_subido_por on public.briefing_archivos (subido_por);

-- ─────────────────────────────────────────────────────────────── Cambios con IA

create table public.cambios (
  id uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references public.organizaciones (id) on delete cascade,
  solicitado_por uuid references auth.users (id) on delete set null,
  pedido text not null,
  complejidad public.complejidad,
  cobro text check (cobro in ('plan', 'suelto', 'equipo')),
  estado public.estado_cambio not null default 'clasificado',
  rondas_restantes smallint not null default 3 check (rondas_restantes >= 0),
  vista_previa_url text,
  publicado_en timestamptz,
  periodo date not null default (date_trunc('month', now()))::date,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index cambios_org_periodo on public.cambios (organizacion_id, periodo);
create index cambios_solicitado_por on public.cambios (solicitado_por);
create trigger tocar before update on public.cambios for each row execute function privado.tocar();

create table public.mensajes_cambio (
  id bigint generated always as identity primary key,
  organizacion_id uuid not null references public.organizaciones (id) on delete cascade,
  cambio_id uuid references public.cambios (id) on delete cascade,
  autor text not null check (autor in ('cliente', 'ia', 'equipo')),
  usuario_id uuid references auth.users (id) on delete set null,
  contenido text,
  adjuntos jsonb not null default '[]'::jsonb,
  creado timestamptz not null default now()
);
create index mensajes_cambio_org on public.mensajes_cambio (organizacion_id, creado);
create index mensajes_cambio_cambio on public.mensajes_cambio (cambio_id);
create index mensajes_cambio_usuario on public.mensajes_cambio (usuario_id);

-- Uso del mes contra el plan (respeta las reglas de quien consulta).
create view public.uso_mensual with (security_invoker = true) as
  select organizacion_id, periodo, complejidad, count(*)::int as usados
  from public.cambios
  where cobro = 'plan' and estado <> 'cancelado'
  group by organizacion_id, periodo, complejidad;

-- ─────────────────────────────────────────────────────────────── Solicitudes al equipo

create table public.solicitudes_equipo (
  folio bigint generated always as identity (start with 1040) primary key,
  organizacion_id uuid not null references public.organizaciones (id) on delete cascade,
  cambio_id uuid references public.cambios (id) on delete set null,
  creado_por uuid references auth.users (id) on delete set null,
  asunto text not null,
  detalle text,
  estado public.estado_solicitud not null default 'abierta',
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index solicitudes_equipo_org on public.solicitudes_equipo (organizacion_id);
create index solicitudes_equipo_cambio on public.solicitudes_equipo (cambio_id);
create index solicitudes_equipo_creado_por on public.solicitudes_equipo (creado_por);
create trigger tocar before update on public.solicitudes_equipo for each row execute function privado.tocar();

-- ─────────────────────────────────────────────────────────────── Reglas por fila (RLS)

alter table public.perfiles enable row level security;
alter table public.organizaciones enable row level security;
alter table public.miembros enable row level security;
alter table public.productos enable row level security;
alter table public.contratados enable row level security;
alter table public.briefings enable row level security;
alter table public.briefing_archivos enable row level security;
alter table public.cambios enable row level security;
alter table public.mensajes_cambio enable row level security;
alter table public.solicitudes_equipo enable row level security;

-- Perfiles: cada quien el suyo; el equipo ve todos.
create policy "ver mi perfil" on public.perfiles for select to authenticated
  using (id = (select auth.uid()) or (select privado.es_staff()));
create policy "editar mi perfil" on public.perfiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and es_staff = (select privado.es_staff())); -- nadie se hace staff solo

-- Organizaciones: los miembros las ven; solo el equipo las crea o cambia (fase, dominio).
create policy "ver mi organización" on public.organizaciones for select to authenticated
  using ((select privado.es_miembro(id)));
create policy "equipo administra organizaciones" on public.organizaciones for all to authenticated
  using ((select privado.es_staff())) with check ((select privado.es_staff()));

-- Miembros: se ven entre sí; el dueño invita o quita (sin dar rol de soporte).
create policy "ver miembros" on public.miembros for select to authenticated
  using ((select privado.es_miembro(organizacion_id)));
create policy "dueño agrega miembros" on public.miembros for insert to authenticated
  with check ((select privado.es_dueno(organizacion_id)) and (rol <> 'soporte' or (select privado.es_staff())));
create policy "dueño cambia roles" on public.miembros for update to authenticated
  using ((select privado.es_dueno(organizacion_id)))
  with check ((select privado.es_dueno(organizacion_id)) and (rol <> 'soporte' or (select privado.es_staff())));
create policy "dueño quita miembros" on public.miembros for delete to authenticated
  using ((select privado.es_dueno(organizacion_id)));

-- Catálogo: público para leer; solo el equipo lo edita.
create policy "catálogo visible" on public.productos for select to anon, authenticated using (activo or (select privado.es_staff()));
create policy "equipo edita catálogo" on public.productos for all to authenticated
  using ((select privado.es_staff())) with check ((select privado.es_staff()));

-- Contratados: el cliente los ve; los crea el servidor al cobrar (service_role) o el equipo.
create policy "ver lo contratado" on public.contratados for select to authenticated
  using ((select privado.es_miembro(organizacion_id)));
create policy "equipo administra contratos" on public.contratados for all to authenticated
  using ((select privado.es_staff())) with check ((select privado.es_staff()));

-- Briefing: los miembros lo leen y lo llenan.
create policy "ver briefing" on public.briefings for select to authenticated
  using ((select privado.es_miembro(organizacion_id)));
create policy "crear briefing" on public.briefings for insert to authenticated
  with check ((select privado.es_miembro(organizacion_id)));
create policy "llenar briefing" on public.briefings for update to authenticated
  using ((select privado.es_miembro(organizacion_id)))
  with check ((select privado.es_miembro(organizacion_id)));

create policy "ver archivos del briefing" on public.briefing_archivos for select to authenticated
  using ((select privado.es_miembro(organizacion_id)));
create policy "subir archivos del briefing" on public.briefing_archivos for insert to authenticated
  with check ((select privado.es_miembro(organizacion_id)) and subido_por = (select auth.uid()));
create policy "quitar archivos del briefing" on public.briefing_archivos for delete to authenticated
  using ((select privado.es_miembro(organizacion_id)));

-- Cambios: el cliente los pide y los ve; los avanza el servidor/agente o el equipo.
create policy "ver cambios" on public.cambios for select to authenticated
  using ((select privado.es_miembro(organizacion_id)));
create policy "pedir cambios" on public.cambios for insert to authenticated
  with check ((select privado.es_miembro(organizacion_id)) and solicitado_por = (select auth.uid()) and estado = 'clasificado');
create policy "equipo avanza cambios" on public.cambios for update to authenticated
  using ((select privado.es_staff())) with check ((select privado.es_staff()));

create policy "ver conversación" on public.mensajes_cambio for select to authenticated
  using ((select privado.es_miembro(organizacion_id)));
create policy "escribir en la conversación" on public.mensajes_cambio for insert to authenticated
  with check (
    (select privado.es_miembro(organizacion_id))
    and usuario_id = (select auth.uid())
    and (autor = 'cliente' or (autor = 'equipo' and (select privado.es_staff())))
  );

-- Solicitudes al equipo.
create policy "ver solicitudes" on public.solicitudes_equipo for select to authenticated
  using ((select privado.es_miembro(organizacion_id)));
create policy "crear solicitudes" on public.solicitudes_equipo for insert to authenticated
  with check ((select privado.es_miembro(organizacion_id)) and creado_por = (select auth.uid()) and estado = 'abierta');
create policy "equipo atiende solicitudes" on public.solicitudes_equipo for update to authenticated
  using ((select privado.es_staff())) with check ((select privado.es_staff()));

-- ─────────────────────────────────────────────────────────────── Archivos (Storage)

insert into storage.buckets (id, name, public, file_size_limit)
values ('briefing', 'briefing', false, 52428800) -- 50 MB por archivo
on conflict (id) do nothing;

create policy "ver archivos de mi organización" on storage.objects for select to authenticated
  using (bucket_id = 'briefing' and (select privado.es_miembro_ruta(name)));
create policy "subir archivos a mi organización" on storage.objects for insert to authenticated
  with check (bucket_id = 'briefing' and (select privado.es_miembro_ruta(name)));
create policy "borrar archivos de mi organización" on storage.objects for delete to authenticated
  using (bucket_id = 'briefing' and (select privado.es_miembro_ruta(name)));

-- ─────────────────────────────────────────────────────────────── Catálogo inicial
-- Precios en NULL = por definir. Planes y bases son la propuesta del 13 nov 2026.

insert into public.productos (id, tipo, nombre, resumen, precio_mxn, cobro, automatico, incluye, orden) values
  ('pagina-viva', 'pagina', 'Página Viva', 'Página con 40 funciones incluidas.', 17000, 'unico', false, '{}', 1),
  ('hospedaje', 'hospedaje', 'Hospedaje Página Viva', 'Hospedaje, certificado y respaldos.', null, 'mensual', true, '{}', 2),
  ('dominio', 'dominio', 'Dominio', 'Registrado a nombre del cliente, al costo.', null, 'anual', true, '{}', 3),

  ('plan-basico', 'plan', 'Plan de cambios Básico', 'Para mantener al día fotos e información.', 390, 'mensual', true, '{"simple": 10, "mediano": 0, "complejo": 0, "rondas": 3}', 10),
  ('plan-plus', 'plan', 'Plan de cambios Plus', 'Para lanzar promociones y servicios nuevos.', 790, 'mensual', true, '{"simple": 15, "mediano": 2, "complejo": 0, "rondas": 3}', 11),
  ('plan-pro', 'plan', 'Plan de cambios Pro', 'Para hacer crecer tu página cada mes.', 1990, 'mensual', true, '{"simple": 30, "mediano": 6, "complejo": 1, "rondas": 3}', 12),
  ('cambio-simple', 'plan', 'Cambio simple suelto', 'Fotos, textos, precios, horarios, teléfonos.', 79, 'unico', true, '{"complejidad": "simple"}', 13),
  ('cambio-mediano', 'plan', 'Cambio mediano suelto', 'Sección nueva, página de servicio, promoción.', 390, 'unico', true, '{"complejidad": "mediano"}', 14),
  ('cambio-complejo', 'plan', 'Cambio complejo suelto', 'Función nueva, integración, rediseño de una página.', 1500, 'unico', true, '{"complejidad": "complejo", "desde": true}', 15),

  ('base-inicial', 'base', 'Base de datos Inicial', 'Prospectos, formularios y citas.', 290, 'mensual', true, '{"registros": 10000, "archivos_gb": 1}', 20),
  ('base-negocio', 'base', 'Base de datos Negocio', 'Tienda, inventario y pedidos.', 690, 'mensual', true, '{"registros": 100000, "archivos_gb": 10}', 21),
  ('base-dedicada', 'base', 'Base de datos Dedicada', 'Base propia para alto volumen.', 1990, 'mensual', false, '{"desde": true}', 22),

  ('modulo-tienda', 'complemento', 'Tienda en línea con cobro y facturación', 'Vende en línea y factura sin hacer nada a mano.', null, 'unico', false, '{}', 30),
  ('modulo-pos', 'complemento', 'Punto de venta', null, null, 'unico', false, '{}', 31),
  ('modulo-admin', 'complemento', 'Súper administrador', null, null, 'unico', false, '{}', 32),
  ('modulo-citas', 'complemento', 'Citas en línea', null, null, 'unico', true, '{}', 33),
  ('modulo-reservas', 'complemento', 'Reservaciones con pago', null, null, 'unico', false, '{}', 34),
  ('modulo-ingles', 'complemento', 'Versión en inglés', null, null, 'unico', true, '{}', 35),
  ('modulo-paginas', 'complemento', 'Más páginas', null, null, 'unico', true, '{}', 36),
  ('modulo-agente', 'complemento', 'Agente 24/7', 'Contesta, cotiza y agenda. Se cobra por uso.', null, 'uso', true, '{}', 37),
  ('modulo-fotos', 'complemento', 'Sesión de fotos', null, null, 'unico', false, '{}', 40),
  ('modulo-video', 'complemento', 'Video', null, null, 'unico', false, '{}', 41),
  ('modulo-marca', 'complemento', 'Logo e identidad', null, null, 'unico', false, '{}', 42),
  ('modulo-lanzamiento', 'complemento', 'Campaña de lanzamiento', null, null, 'unico', false, '{}', 43);
