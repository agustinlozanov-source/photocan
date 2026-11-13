-- Gancho de compilación de Netlify por sitio: el servidor lo usa para compilar la rama
-- del agente como vista previa. Es interno: el cliente no lo puede leer.
alter table public.sitios add column netlify_hook text;
revoke select (netlify_hook) on public.sitios from authenticated, anon;
