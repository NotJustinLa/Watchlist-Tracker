-- Member profiles. Each function runs as the signed-in user, takes a handle and
-- never returns a user id. Films and stats are returned only if can_view() passes.

create function public.get_profile(target_handle text)
returns table (
  handle text,
  display_name text,
  avatar_url text,
  is_private boolean,
  followers integer,
  following integer,
  relationship text,
  visible boolean,
  watched_count integer,
  watchlist_count integer,
  average_rating numeric,
  distribution integer[]
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    t.handle::text,
    t.display_name,
    t.avatar_url,
    t.is_private,
    (select count(*)::int from public.follows where followee_id = t.id and status = 'accepted'),
    (select count(*)::int from public.follows where follower_id = t.id and status = 'accepted'),
    case
      when t.id = auth.uid() then 'self'
      when f.status = 'accepted' then 'following'
      when f.status = 'pending' then 'requested'
      else 'none'
    end,
    v.visible,
    case when v.visible then
      (select count(*)::int from public.watched where user_id = t.id) end,
    case when v.visible then
      (select count(*)::int from public.watchlist_items where user_id = t.id) end,
    case when v.visible then
      (select round(avg(rating), 1) from public.watched where user_id = t.id and rating is not null) end,
    case when v.visible then
      array(
        select (select count(*)::int from public.watched where user_id = t.id and rating = stars)
        from generate_series(1, 5) as stars
      ) end
  from public.profiles t
  cross join lateral (select public.can_view(t.id) as visible) v
  left join public.follows f on f.follower_id = auth.uid() and f.followee_id = t.id
  where t.handle::text = lower(target_handle)
    and auth.uid() is not null;
$$;

create function public.get_member_watched(target_handle text)
returns table (
  tmdb_id integer,
  title text,
  poster_path text,
  release_year smallint,
  rating smallint,
  watched_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select m.tmdb_id, m.title, m.poster_path, m.release_year, w.rating, w.watched_at
  from public.profiles p
  join public.watched w on w.user_id = p.id
  join public.movies m on m.tmdb_id = w.tmdb_id
  where p.handle::text = lower(target_handle)
    and auth.uid() is not null
    and public.can_view(p.id)
  order by w.watched_at desc;
$$;

create function public.get_member_watchlist(target_handle text)
returns table (
  tmdb_id integer,
  title text,
  poster_path text,
  release_year smallint,
  added_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select m.tmdb_id, m.title, m.poster_path, m.release_year, l.added_at
  from public.profiles p
  join public.watchlist_items l on l.user_id = p.id
  join public.movies m on m.tmdb_id = l.tmdb_id
  where p.handle::text = lower(target_handle)
    and auth.uid() is not null
    and public.can_view(p.id)
  order by l.added_at desc;
$$;

revoke execute on function public.get_profile(text) from public, anon;
revoke execute on function public.get_member_watched(text) from public, anon;
revoke execute on function public.get_member_watchlist(text) from public, anon;
grant execute on function public.get_profile(text) to authenticated;
grant execute on function public.get_member_watched(text) to authenticated;
grant execute on function public.get_member_watchlist(text) to authenticated;
