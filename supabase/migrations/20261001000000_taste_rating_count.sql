-- How many ratings the taste profile was generated from, so the page can say
-- "Based on N ratings" and notice when newer ratings make it stale.
alter table public.taste_profiles
  add column rating_count integer not null default 0 check (rating_count >= 0);
