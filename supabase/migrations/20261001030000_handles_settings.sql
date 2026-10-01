-- Settings can edit the display name too (handle and is_private were already editable).
grant update (display_name) on public.profiles to authenticated;

-- RLS hides other members' profiles, so the handle check asks this function instead.
-- It answers yes/no only and never exposes who owns a handle. Handles are always
-- lowercase (the check constraint enforces it), so a plain text comparison is exact.
create function public.handle_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles where handle::text = lower(candidate)
  );
$$;

revoke execute on function public.handle_available(text) from public, anon;
grant execute on function public.handle_available(text) to authenticated;
