-- Follows -------------------------------------------------------------------------

create type public.follow_status as enum ('pending', 'accepted');

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  status      public.follow_status not null,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create index follows_followee_status on public.follows (followee_id, status);

-- Users can see follow rows they're part of. There are no write policies:
-- all writes go through the functions below.
alter table public.follows enable row level security;
revoke insert, update, delete on public.follows from anon, authenticated;

create policy "See own follows" on public.follows
  for select to authenticated
  using (
    follower_id = (select auth.uid()) or followee_id = (select auth.uid())
  );

-- Visibility ------------------------------------------------------------------------

-- True if the signed-in user may see the target's films and stats:
-- it's them, the target is public, or they have an accepted follow.
create function public.can_view(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select target = auth.uid()
    or exists (select 1 from public.profiles where id = target and not is_private)
    or exists (
      select 1 from public.follows
      where follower_id = auth.uid() and followee_id = target and status = 'accepted'
    );
$$;

-- Follow actions by handle --------------------------------------------------------
-- Each acts as auth.uid(), takes a handle, and never returns a user id.

create function public.follow_by_handle(target_handle text)
returns public.follow_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  target_id uuid;
  target_private boolean;
  result public.follow_status;
begin
  if me is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  select id, is_private into target_id, target_private
  from public.profiles where handle::text = lower(target_handle);
  if target_id is null then
    raise exception 'No member with that handle' using errcode = 'P0002';
  end if;
  if target_id = me then
    raise exception 'You can''t follow yourself' using errcode = '22023';
  end if;

  -- Public accounts are followed at once; private ones get a request.
  insert into public.follows (follower_id, followee_id, status)
  values (
    me, target_id,
    case when target_private then 'pending' else 'accepted' end::public.follow_status
  )
  on conflict (follower_id, followee_id) do nothing;

  select status into result
  from public.follows where follower_id = me and followee_id = target_id;
  return result;
end;
$$;

-- Unfollows, or cancels a pending request. A missing row is not an error.
create function public.unfollow_by_handle(target_handle text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.follows
  where follower_id = auth.uid()
    and followee_id = (select id from public.profiles where handle::text = lower(target_handle));
$$;

-- Approves or declines a pending request made to the signed-in user.
create function public.respond_to_request(follower_handle text, approve boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  requester uuid := (select id from public.profiles where handle::text = lower(follower_handle));
begin
  if approve then
    update public.follows set status = 'accepted'
    where followee_id = auth.uid() and follower_id = requester and status = 'pending';
  else
    delete from public.follows
    where followee_id = auth.uid() and follower_id = requester and status = 'pending';
  end if;
end;
$$;

-- Pending requests to the signed-in user, newest first. Handles only, no ids.
create function public.get_follow_requests()
returns table (handle text, display_name text, avatar_url text, requested_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select p.handle::text, p.display_name, p.avatar_url, f.created_at
  from public.follows f
  join public.profiles p on p.id = f.follower_id
  where f.followee_id = auth.uid() and f.status = 'pending'
  order by f.created_at desc;
$$;

-- Going public accepts everyone who was waiting ------------------------------------

create function public.accept_requests_when_public()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.follows set status = 'accepted'
  where followee_id = new.id and status = 'pending';
  return new;
end;
$$;

create trigger on_profile_made_public
  after update of is_private on public.profiles
  for each row
  when (old.is_private and not new.is_private)
  execute function public.accept_requests_when_public();

-- Permissions -------------------------------------------------------------------------

revoke execute on function public.can_view(uuid) from public, anon, authenticated;
revoke execute on function public.accept_requests_when_public() from public, anon, authenticated;

revoke execute on function public.follow_by_handle(text) from public, anon;
revoke execute on function public.unfollow_by_handle(text) from public, anon;
revoke execute on function public.respond_to_request(text, boolean) from public, anon;
revoke execute on function public.get_follow_requests() from public, anon;
grant execute on function public.follow_by_handle(text) to authenticated;
grant execute on function public.unfollow_by_handle(text) to authenticated;
grant execute on function public.respond_to_request(text, boolean) to authenticated;
grant execute on function public.get_follow_requests() to authenticated;
