-- Watching and rating are separate steps: a film is marked watched first and
-- rated later. The existing check still limits a set rating to 1-5.
alter table public.watched alter column rating drop not null;
