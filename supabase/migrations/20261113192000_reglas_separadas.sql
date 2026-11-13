-- Las reglas "for all" del equipo se sumaban a las de lectura y Postgres evaluaba
-- dos reglas en cada SELECT. La lectura ya incluye al equipo (es_miembro / es_staff),
-- así que el equipo solo necesita reglas para escribir.

drop policy "equipo administra organizaciones" on public.organizaciones;
create policy "equipo crea organizaciones" on public.organizaciones for insert to authenticated with check ((select privado.es_staff()));
create policy "equipo cambia organizaciones" on public.organizaciones for update to authenticated using ((select privado.es_staff())) with check ((select privado.es_staff()));
create policy "equipo borra organizaciones" on public.organizaciones for delete to authenticated using ((select privado.es_staff()));

drop policy "equipo administra contratos" on public.contratados;
create policy "equipo crea contratos" on public.contratados for insert to authenticated with check ((select privado.es_staff()));
create policy "equipo cambia contratos" on public.contratados for update to authenticated using ((select privado.es_staff())) with check ((select privado.es_staff()));
create policy "equipo borra contratos" on public.contratados for delete to authenticated using ((select privado.es_staff()));

drop policy "equipo edita catálogo" on public.productos;
create policy "equipo agrega productos" on public.productos for insert to authenticated with check ((select privado.es_staff()));
create policy "equipo cambia productos" on public.productos for update to authenticated using ((select privado.es_staff())) with check ((select privado.es_staff()));
create policy "equipo borra productos" on public.productos for delete to authenticated using ((select privado.es_staff()));
