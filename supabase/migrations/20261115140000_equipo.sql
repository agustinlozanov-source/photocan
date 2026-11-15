-- Equipo de Phot8can con roles. El acceso se da por correo: quien entra con un correo de esta
-- lista es parte del equipo, aunque su cuenta se cree después.
--   admin  → todo, incluido invitar o quitar gente del equipo
--   equipo → superadministrador (Radar, clientes) sin administrar el equipo

create table public.equipo (
  correo text primary key check (correo = lower(trim(correo)) and correo like '%_@_%._%'),
  nombre text,
  rol text not null default 'equipo' check (rol in ('admin', 'equipo')),
  invitado_por uuid references auth.users (id) on delete set null,
  creado timestamptz not null default now()
);
comment on table public.equipo is 'Correos con acceso al superadministrador y su rol.';

/** Rol del usuario actual en el equipo (null si no es del equipo). El perfil marcado a mano cuenta como "equipo". */
create function privado.rol_equipo() returns text
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select e.rol from public.equipo e where e.correo = lower(coalesce((select auth.jwt() ->> 'email'), ''))),
    case when (select p.es_staff from public.perfiles p where p.id = (select auth.uid())) then 'equipo' end
  )
$$;

create or replace function privado.es_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select (select privado.rol_equipo()) is not null
$$;

create function privado.es_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select (select privado.rol_equipo()) = 'admin'
$$;

revoke all on function privado.rol_equipo(), privado.es_admin() from public;
grant execute on function privado.rol_equipo(), privado.es_admin() to authenticated;

-- Para la pantalla: mi rol en el equipo.
create function public.mi_rol_equipo() returns text
language sql stable security definer set search_path = '' as $$
  select privado.rol_equipo()
$$;
revoke all on function public.mi_rol_equipo() from public, anon;
grant execute on function public.mi_rol_equipo() to authenticated;

alter table public.equipo enable row level security;
create policy "equipo ve al equipo" on public.equipo for select to authenticated using ((select privado.es_staff()));
create policy "admin agrega" on public.equipo for insert to authenticated with check ((select privado.es_admin()));
create policy "admin cambia" on public.equipo for update to authenticated using ((select privado.es_admin())) with check ((select privado.es_admin()));
create policy "admin quita" on public.equipo for delete to authenticated using ((select privado.es_admin()) and correo <> lower(coalesce((select auth.jwt() ->> 'email'), '')));

insert into public.equipo (correo, nombre, rol) values ('agustinlozanov@gmail.com', 'Agustín', 'admin');
