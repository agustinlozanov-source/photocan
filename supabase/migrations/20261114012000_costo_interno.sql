-- El costo de fabricación es interno: el cliente no puede leerlo desde su sesión.
revoke select (costo_centavos_usd) on public.sitios from authenticated, anon;
