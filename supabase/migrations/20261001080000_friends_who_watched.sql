-- Which of the films on screen have people you follow (accepted only) watched,
-- with their ratings. One call per grid; at most 60 films. Handles, never user ids.
create function public.friends_who_watched(tmdb_ids integer[])
returns table (
  tmdb_id integer,
  handle text,
  display_name text,
  avatar_url text,
  rating smallint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if cardinality(tmdb_ids) > 60 then
    raise exception 'At most 60 films at a time' using errcode = '22023';
  end if;

  return query
    select w.tmdb_id, p.handle::text, p.display_name, p.avatar_url, w.rating
    from public.follows f
    join public.watched w on w.user_id = f.followee_id
    join public.profiles p on p.id = f.followee_id
    where f.follower_id = auth.uid()
      and f.status = 'accepted'
      and w.tmdb_id = any (tmdb_ids)
    order by w.rating desc nulls last, w.watched_at desc;
end;
$$;

revoke execute on function public.friends_who_watched(integer[]) from public, anon;
grant execute on function public.friends_who_watched(integer[]) to authenticated;
