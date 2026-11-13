-- Alta del cliente: quien entra por primera vez crea su organización y queda como
-- dueño, con su briefing listo para llenar. Solo se puede una vez por usuario; las
-- siguientes organizaciones las crea el equipo. Crear una organización no da
-- ningún producto: lo contratado solo lo escriben el servidor al cobrar o el equipo.

create function public.crear_mi_organizacion(nombre text)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  org uuid;
begin
  if uid is null then
    raise exception 'Necesitas iniciar sesión.';
  end if;
  if exists (select 1 from public.miembros m where m.usuario_id = uid) then
    raise exception 'Ya tienes una organización.';
  end if;
  if coalesce(length(trim(nombre)), 0) < 2 or length(nombre) > 120 then
    raise exception 'Escribe el nombre de tu negocio.';
  end if;

  insert into public.organizaciones (nombre) values (trim(nombre)) returning id into org;
  insert into public.miembros (organizacion_id, usuario_id, rol) values (org, uid, 'dueno');
  insert into public.briefings (organizacion_id, respuestas, actualizado_por)
    values (org, jsonb_build_object('negocio.nombre', trim(nombre)), uid);
  return org;
end $$;

revoke all on function public.crear_mi_organizacion(text) from public, anon;
grant execute on function public.crear_mi_organizacion(text) to authenticated;
