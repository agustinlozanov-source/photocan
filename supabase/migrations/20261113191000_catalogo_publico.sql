-- El catálogo se puede leer sin sesión (precios en la página). Su regla consulta
-- privado.es_staff(), así que el rol anónimo también necesita poder llamarla
-- (para un visitante siempre devuelve false).
grant usage on schema privado to anon;
grant execute on function privado.es_staff() to anon;
