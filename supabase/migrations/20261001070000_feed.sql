-- Activity feed: watched and watchlist events from members the signed-in user
-- follows (accepted only), newest first. Derived from the existing tables, so it
-- can't drift out of sync: unmarking a film or removing it from a watchlist
-- removes the event. Returns handles, never user ids.
create function public.get_feed(
  before timestamptz default null,
  page_size integer default 20
)
returns table (
  kind text,
  handle text,
  display_name text,
  avatar_url text,
  tmdb_id integer,
  title text,
  poster_path text,
  rating smallint,
  at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with followed as (
    select followee_id as id
    from public.follows
    where follower_id = auth.uid() and status = 'accepted'
  ),
  events as (
    select 'watched'::text as kind, w.user_id, w.tmdb_id, w.rating, w.watched_at as at
    from public.watched w
    join followed f on f.id = w.user_id
    union all
    select 'watchlist', l.user_id, l.tmdb_id, null::smallint, l.added_at
    from public.watchlist_items l
    join followed f on f.id = l.user_id
  )
  select e.kind, p.handle::text, p.display_name, p.avatar_url,
         m.tmdb_id, m.title, m.poster_path, e.rating, e.at
  from events e
  join public.profiles p on p.id = e.user_id
  join public.movies m on m.tmdb_id = e.tmdb_id
  where e.at < coalesce(before, 'infinity'::timestamptz)
  order by e.at desc
  limit least(greatest(page_size, 1), 50);
$$;

revoke execute on function public.get_feed(timestamptz, integer) from public, anon;
grant execute on function public.get_feed(timestamptz, integer) to authenticated;
