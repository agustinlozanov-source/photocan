-- Radar, entrega 1: quién prospecta, el ciclo antes del CRM, verificación manual y objetivos.

-- ───────────────────────────── Perfil de cada persona del equipo (para firmar propuestas)
alter table public.equipo
  add column puesto text,
  add column telefono text,
  add column firma_institucional boolean not null default false;
comment on column public.equipo.firma_institucional is 'Quien firma todas las propuestas junto a quien prospecta (p. ej. Director General). Solo uno.';
create unique index equipo_una_firma on public.equipo (firma_institucional) where firma_institucional;

-- Cada quien edita su propio nombre, puesto y teléfono (el rol y la firma solo los cambia un admin).
create function public.actualizar_mi_perfil_equipo(p_nombre text, p_puesto text, p_telefono text)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.equipo
     set nombre = nullif(trim(p_nombre), ''), puesto = nullif(trim(p_puesto), ''), telefono = nullif(trim(p_telefono), '')
   where correo = lower(coalesce((select auth.jwt() ->> 'email'), ''));
end $$;
revoke all on function public.actualizar_mi_perfil_equipo(text, text, text) from public, anon;
grant execute on function public.actualizar_mi_perfil_equipo(text, text, text) to authenticated;

-- ───────────────────────────── Responsable de cada escaneo y de cada negocio
alter table public.radar_escaneos add column responsable text references public.equipo (correo) on update cascade on delete set null;

alter table public.radar_negocios
  add column responsable text references public.equipo (correo) on update cascade on delete set null,
  add column verificacion jsonb,            -- { abre: bool, por: correo, nombre, fecha }
  add column estado_desde timestamptz not null default now();

-- El ciclo antes del CRM. Entra al CRM al responder (o pagar), no antes.
alter table public.radar_negocios drop constraint radar_negocios_estado_check;
alter table public.radar_negocios add constraint radar_negocios_estado_check
  check (estado in ('detectado', 'elegido', 'propuesta_enviada', 'abrio', 'respondio', 'convertido', 'descartado'));

-- ───────────────────────────── Historial: cada paso, quién y cuándo (de aquí salen las métricas)
create table public.radar_eventos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.radar_negocios (id) on delete cascade,
  tipo text not null,                       -- estado | verificacion
  de text,
  a text,
  por text,                                 -- correo de quien lo hizo (null = sistema / prospecto)
  creado timestamptz not null default now()
);
create index radar_eventos_por_fecha on public.radar_eventos (por, creado);
create index radar_eventos_negocio on public.radar_eventos (negocio_id, creado);

-- ───────────────────────────── Objetivos semanales por persona (el mes se ve sumando semanas)
create table public.radar_objetivos (
  correo text not null references public.equipo (correo) on update cascade on delete cascade,
  semana date not null check (extract(isodow from semana) = 1),   -- lunes de la semana
  propuestas int not null default 0 check (propuestas >= 0),
  abiertas int not null default 0 check (abiertas >= 0),
  respuestas int not null default 0 check (respuestas >= 0),
  ventas int not null default 0 check (ventas >= 0),
  actualizado timestamptz not null default now(),
  primary key (correo, semana)
);

alter table public.radar_eventos enable row level security;
alter table public.radar_objetivos enable row level security;
create policy "equipo ve eventos" on public.radar_eventos for select to authenticated using ((select privado.es_staff()));
create policy "equipo ve objetivos" on public.radar_objetivos for select to authenticated using ((select privado.es_staff()));
create policy "admin pone objetivos" on public.radar_objetivos for insert to authenticated with check ((select privado.es_admin()));
create policy "admin cambia objetivos" on public.radar_objetivos for update to authenticated using ((select privado.es_admin())) with check ((select privado.es_admin()));
create policy "admin quita objetivos" on public.radar_objetivos for delete to authenticated using ((select privado.es_admin()));

-- Los cambios de estado y verificaciones pasan por el servidor (registra el evento y recalcula);
-- la pantalla ya no actualiza negocios directo.
drop policy "equipo marca negocios" on public.radar_negocios;

-- Los escaneos que ya existían quedan a nombre de quien los hizo, si es del equipo.
update public.radar_escaneos e
   set responsable = q.correo
  from public.equipo q, auth.users u
 where u.id = e.creado_por and lower(u.email) = q.correo;
update public.radar_negocios n
   set responsable = e.responsable
  from public.radar_escaneos e
 where e.id = n.escaneo_id and n.responsable is null;
