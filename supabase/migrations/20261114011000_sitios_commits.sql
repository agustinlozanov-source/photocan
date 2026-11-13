-- Commits para no confundir una vista previa vieja con la nueva, ni la publicación anterior con la actual.
alter table public.sitios add column commit_revision text, add column commit_publicado text;
