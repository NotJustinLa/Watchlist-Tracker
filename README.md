# Reel

A movie watchlist and rating tracker with an AI taste profile. Search films, save them to a watchlist, mark what you've watched and rate it, and get a short read on your taste with recommendations grounded in real films.

Built with Next.js (App Router), TypeScript, Tailwind, Supabase (Auth, Postgres, RLS), TMDB and Gemini. Deployed on Vercel.

## Features

- **Sign in** with Google, GitHub or Discord (OAuth only, no passwords).
- **Search** TMDB as you type, or browse "Popular right now". Posters show your rating and watchlist status.
- **Movie pages** with backdrop, poster, runtime, genres and overview, plus **Add to watchlist** and **Mark as watched**.
- **Watchlist** sorted by date added or title, with remove on each poster.
- **Watched** list (its own tab) where you rate each film with 1–5 stars under its poster. Sort by recent, rating or title; filter by star count or show only unrated films.
- **Taste profile**: once you've rated 5 films, Gemini writes a one-to-two sentence summary of your taste and recommends 3–5 films you haven't seen, each with a reason that names a film you rated.

## Running locally

Requirements: Node 20+, a Supabase project, a TMDB account and a Gemini API key.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill it in (see [Environment variables](#environment-variables)).
3. Apply the database migrations to your Supabase project:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
4. In Supabase, under **Authentication**:
   - **Sign In / Providers**: enable Google, GitHub and Discord with each provider's client ID and secret (each provider's OAuth app uses `https://<project-ref>.supabase.co/auth/v1/callback` as its callback URL). Disable Email.
   - **URL Configuration**: set Site URL to your deployed URL, and add `http://localhost:3000/auth/callback` and `https://<your-domain>/auth/callback` to Redirect URLs.
5. Start the dev server:
   ```bash
   npm run dev
   ```

Other commands: `npm run build`, `npm run lint`, and after any migration
`npx supabase gen types typescript --project-id <project-ref> > src/lib/database.types.ts`.

## Environment variables

| Variable | Exposed to browser | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (safe to expose; RLS protects data) |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** | Bypasses RLS. Used only to write movie snapshots from server-side TMDB data |
| `TMDB_READ_TOKEN` | **No** | TMDB v4 "API Read Access Token" |
| `GEMINI_API_KEY` | **No** | Google AI Studio key |
| `GEMINI_MODEL` | **No** | Gemini model id, e.g. a current Flash model |

On Vercel, mark the three server-only values as secrets. A scan of the production build confirms none of them appear in browser code.

## How it's built

```
src/
  app/
    (auth)/sign-in, actions.ts   OAuth sign-in and sign-out server actions
    auth/callback/route.ts       Exchanges the OAuth code for a session
    (app)/layout.tsx             Nav shell (bottom bar on phones, top bar on desktop)
    (app)/(contained)/           Standard centred pages: search (/), watchlist, watched, taste, profile
    (app)/movie/[id]/            Full-bleed movie page and the watchlist/rating server actions
    api/taste/route.ts           POST: generates and stores the taste profile
  components/                    Shared UI: Button, PosterCard, PosterGrid, StarRating, Skeleton, ...
  lib/
    auth.ts                      requireUser()
    tmdb.ts                      The only TMDB client; maps responses to internal types
    gemini.ts                    The only Gemini client
    my-films.ts                  The user's ratings and watchlist status for a set of films
    supabase/server.ts, admin.ts Session client and the service-role client
    validation.ts                zod schemas for every input
  proxy.ts                       Refreshes the session; redirects signed-out users to /sign-in
supabase/migrations/             Schema, RLS and the profile trigger
```

### Security model

- Every user-owned row is keyed on the Supabase user UUID. The client never sends a `user_id`; actions use the session user.
- Row Level Security is on for every table. Users can read and write only their own `watched`, `watchlist_items` and `taste_profiles` rows, and only their own profile. Column grants limit profile edits to `handle` and `is_private`.
- Every server action and route handler calls `requireUser()` (which uses `supabase.auth.getUser()`, not `getSession()`) and validates input with zod. Sign-in and the OAuth callback are the exceptions, since they create the session.
- TMDB, Gemini and the service-role client are imported only from server code (`import 'server-only'`).
- `movies` is read-only to users. Snapshots are built from TMDB on the server, so a client can't plant a fake title or poster.
- AI output is validated with zod before use, rendered as plain text, and every recommendation is matched to a real TMDB film before it is shown.

## Decisions

**Product**
- Movies only, via TMDB. Ratings are 1–5 whole stars.
- Watching and rating are separate steps: **Mark as watched** on a film's page adds it to Watched, and you rate it from the Watched page. A rating is optional, and only rated films count towards the taste profile.
- Marking a film watched removes it from the watchlist; a watched film can be added back to rewatch. Unmarking a film removes it from Watched along with its rating.
- Changing or clearing a rating keeps the original `watched_at`.
- Search is the home page (`/`). The nav has six tabs: Search, Feed, Watchlist, Watched, Taste, Profile.

**Data**
- A minimal `movies` snapshot (title, poster path, year, genres) is stored when a user first saves or rates a film, so lists and the AI prompt don't need a TMDB call per film. It is a display snapshot, not a TMDB mirror.
- Profiles are created by a database trigger on sign-up. Handles are slugified from the OAuth name (fallback `user`), up to 16 characters, with a numeric suffix on collision.
- `setOnWatchlist(tmdbId, on)` and `setWatched(tmdbId, on)` take the desired state rather than toggling, so a double tap or retry can't flip it the wrong way. `rateMovie(tmdbId, rating | null)` only updates a film already marked watched.
- List sorts and filters live in the URL (`?sort=`, `?stars=1..5|unrated`); invalid values fall back to defaults. Sorting by rating puts unrated films last.
- TMDB responses are cached for an hour. Images use TMDB sizes: `w342` in grids, `w500` for the detail poster, `w1280` for backdrops.

**AI taste profile**
- Generated only on request (`POST /api/taste`), stored in `taste_profiles` with the rating count it used, and shown from storage afterwards. The page notes when you've rated more films since.
- Needs at least 5 rated films (watched-but-unrated films don't count). Regenerating is limited to once a minute per user to protect the API key.
- Gemini returns JSON against a response schema derived from the same zod schema that validates it. Transient errors (such as 503 "high demand") are retried up to 3 times within a 30-second timeout.
- Each recommendation is matched to TMDB by title and year (±1). Picks that don't match, repeat, or are already watched are dropped; picks you watch later are hidden.
- The loading state is a plain "Thinking about your ratings…" with skeletons rather than the design's timed step animation, so the UI never implies progress it can't measure.

**Interface**
- Design tokens use the design system's names (`bg`, `surface`, `raised`, `line`, `ink`, `muted`, `accent`, ...); Tailwind's default palette is removed so only tokens can be used.
- Manrope via `next/font`. Lucide icons only, no emoji; the sign-in buttons use the official Google (full colour), GitHub and Discord marks.
- Mutations use optimistic UI (`useOptimistic`): the change shows instantly and reverts with an inline message if the server rejects it.
- Standard pages share a centred container via the `(app)/(contained)` route group; the movie page sits outside it so its backdrop runs full width.
- A faint dot pattern sits behind all content and glows yellow around the pointer on hover-capable devices, and the movie backdrop has letterbox bars. This is a deliberate exception to the design system's "no decoration" and "yellow only for controls, stars and the active tab" rules.
- Films without a poster show a film icon on a raised 2:3 block.

**Next.js 16**
- Session refresh and sign-in redirects live in `src/proxy.ts`, Next 16's replacement for `middleware.ts`.
- `error.tsx` files use Next 16's `retry()`, which re-fetches, rather than `reset()`.

## Known limitations

- **Social features aren't built yet.** Public/private profiles, follows and follow requests, an activity feed and editable handles are planned. The Profile tab is a placeholder at `/u/me` with Sign out. The Feed tab has no page yet.
- **Google's consent screen names the Supabase domain** (`<project-ref>.supabase.co`) rather than the app, because Supabase handles the OAuth exchange. Fixing this needs a Supabase custom domain (paid).
- **Unknown movie ids return HTTP 200** with the 404 page and a `noindex` tag, because `loading.tsx` starts streaming before the id is checked. This is documented Next.js behaviour.
- **Gemini availability**: generation depends on Google's model capacity. Retries cover short spikes; a sustained outage shows an error with "Try again", and the previous profile is kept.
- **No automated test suite.** Behaviour was verified manually and with scripted checks against the live database during development.
