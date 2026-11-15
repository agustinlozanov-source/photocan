-- Con el equipo por correo, "editar mi perfil" ya no puede comparar contra es_staff(): un miembro
-- del equipo sin la marca en su perfil no podría guardar su nombre. Se compara con la marca guardada.
create function privado.marca_staff_guardada(uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select p.es_staff from public.perfiles p where p.id = uid), false)
$$;
revoke all on function privado.marca_staff_guardada(uuid) from public;
grant execute on function privado.marca_staff_guardada(uuid) to authenticated;

drop policy "editar mi perfil" on public.perfiles;
create policy "editar mi perfil" on public.perfiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and es_staff = (select privado.marca_staff_guardada(id))); -- nadie se hace staff solo
