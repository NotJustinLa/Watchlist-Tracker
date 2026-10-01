-- Member search for the Discover page. RLS hides other profiles, so this
-- security-definer function returns public profile fields and the signed-in
-- user's relationship to each match. No ids.
create function public.search_members(query text)
returns table (
  handle text,
  display_name text,
  avatar_url text,
  is_private boolean,
  relationship text
)
language sql
stable
security definer
set search_path = ''
as $$
  with pattern as (
    -- Match the text literally: escape LIKE wildcards (handles often contain _).
    select '%' || replace(replace(replace(trim(query), '\', '\\'), '%', '\%'), '_', '\_') || '%' as p
  )
  select
    pr.handle::text,
    pr.display_name,
    pr.avatar_url,
    pr.is_private,
    case
      when pr.id = auth.uid() then 'self'
      when f.status = 'accepted' then 'following'
      when f.status = 'pending' then 'requested'
      else 'none'
    end
  from public.profiles pr
  cross join pattern
  left join public.follows f
    on f.follower_id = auth.uid() and f.followee_id = pr.id
  where auth.uid() is not null
    and (pr.handle::text ilike pattern.p or pr.display_name ilike pattern.p)
  order by pr.handle::text = lower(trim(query)) desc, pr.handle
  limit 20;
$$;

revoke execute on function public.search_members(text) from public, anon;
grant execute on function public.search_members(text) to authenticated;
