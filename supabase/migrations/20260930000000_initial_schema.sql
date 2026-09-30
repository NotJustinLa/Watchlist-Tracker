create extension if not exists citext with schema extensions;

-- Tables ---------------------------------------------------------------------

-- One profile per auth user. PK is the auth UUID.
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  handle       extensions.citext not null unique
               check (handle ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null check (char_length(display_name) between 1 and 50),
  avatar_url   text,
  is_private   boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Minimal display snapshot, natural key is the TMDB id.
create table public.movies (
  tmdb_id      integer primary key,
  title        text not null,
  poster_path  text,
  release_year smallint,
  genres       text[] not null default '{}'
);

-- Composite PK: a user can list a film once.
create table public.watchlist_items (
  user_id  uuid not null references public.profiles (id) on delete cascade,
  tmdb_id  integer not null references public.movies (tmdb_id),
  added_at timestamptz not null default now(),
  primary key (user_id, tmdb_id)
);

create table public.watched (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  tmdb_id    integer not null references public.movies (tmdb_id),
  rating     smallint not null check (rating between 1 and 5),
  watched_at timestamptz not null default now(),
  primary key (user_id, tmdb_id)
);

create table public.taste_profiles (
  user_id         uuid primary key references public.profiles (id) on delete cascade,
  summary         text not null,
  recommendations jsonb not null,
  generated_at    timestamptz not null default now()
);

create index watched_user_recent on public.watched (user_id, watched_at desc);
create index watchlist_items_user_recent on public.watchlist_items (user_id, added_at desc);

-- Profile creation -------------------------------------------------------------

-- Handle: slug of the OAuth name (fallback "user"), max 16 chars, then
-- name, name1, name2... until the unique insert succeeds.
create function public.create_profile(user_id uuid, meta jsonb)
returns void
language plpgsql
set search_path = ''
as $$
declare
  oauth_name text := coalesce(
    nullif(trim(meta ->> 'full_name'), ''),
    nullif(trim(meta ->> 'name'), ''),
    nullif(trim(meta ->> 'user_name'), '')
  );
  base text := left(trim(both '_' from regexp_replace(lower(coalesce(oauth_name, '')), '[^a-z0-9]+', '_', 'g')), 16);
  candidate text;
  suffix integer := 0;
  violated text;
begin
  if char_length(base) < 3 then
    base := 'user';
  end if;
  candidate := base;
  loop
    begin
      insert into public.profiles (id, handle, display_name, avatar_url)
      values (user_id, candidate, left(coalesce(oauth_name, candidate), 50), meta ->> 'avatar_url');
      return;
    exception when unique_violation then
      get stacked diagnostics violated = constraint_name;
      if violated <> 'profiles_handle_key' then
        raise;
      end if;
      suffix := suffix + 1;
      candidate := base || suffix;
    end;
  end loop;
end;
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.create_profile(new.id, new.raw_user_meta_data);
  return new;
end;
$$;

revoke execute on function public.create_profile(uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill users who signed up before this migration.
select public.create_profile(u.id, u.raw_user_meta_data)
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- Row level security -----------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.movies enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.watched enable row level security;
alter table public.taste_profiles enable row level security;

create policy "Read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Only the handle and privacy setting are user-editable.
revoke update on public.profiles from anon, authenticated;
grant update (handle, is_private) on public.profiles to authenticated;

-- Snapshots are written server-side with the service role, never by clients.
create policy "Read movies" on public.movies
  for select to authenticated using (true);

create policy "Own watchlist" on public.watchlist_items
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Own watched" on public.watched
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Own taste profile" on public.taste_profiles
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
