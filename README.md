# Watchlist-Tracker

Movie watchlist and rating tracker with AI taste profiles and a social feed. Built with Next.js, Supabase and TMDB.

## Decisions

| Area                 | Decision                                                                                                                                                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack                | Next.js (App Router) + TypeScript + Tailwind, deployed on Vercel                                                                                                                                                                  |
| Auth                 | Supabase Auth, OAuth only (Google, GitHub, Discord). No email/password                                                                                                                                                            |
| Database             | Supabase Postgres with Row Level Security on every table                                                                                                                                                                          |
| Keys                 | Every user-owned row keys on `auth.users.id` (UUID). Never email, never handle                                                                                                                                                    |
| Movies               | Movies only, via TMDB v4 bearer token, called server-side only                                                                                                                                                                    |
| Ratings              | 1–5 whole stars. A film is "watched" once it has a rating                                                                                                                                                                         |
| AI                   | Gemini, server-side only, structured JSON output validated before use                                                                                                                                                             |
| Handles              | Auto-generated from OAuth name, numeric suffix on collision, editable in settings                                                                                                                                                 |
| Privacy              | Public or private profile. Following a private account creates a request that must be approved                                                                                                                                    |
| Visible to followers | Watched films, ratings, stats and watchlist (subject to privacy)                                                                                                                                                                  |
| Feed                 | "Watched + rated" and "added to watchlist" events from accepted follows                                                                                                                                                           |
| ID rule              | Another member's UUID never reaches the browser. Social data is shaped server-side and exposes handles only                                                                                                                       |
| Movie snapshot       | A minimal `movies` row (title, poster, year, genres) is stored when a user first saves a film, so feeds, profiles and the AI prompt don't need one TMDB call per film. This is a snapshot for display, not a TMDB cache or mirror |
