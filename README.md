# Reel

Name: Justin
Email: notjustinla@gmail.com
link to the deployed project: https://watchlist-tracker-seven.vercel.app/

A movie watchlist and rating tracker with an AI taste profile. Search films, save them to a watchlist, mark what you've watched and rate it, and get a short read on your taste with recommendations grounded in real films.

Built with Next.js (App Router), TypeScript, Tailwind, Motion, Supabase (Auth, Postgres, RLS), TMDB and Gemini. Deployed on Vercel.

## Features

- **Sign in** with Google, GitHub or Discord (OAuth only, no passwords).
- **Settings** to change your display name and handle (with a live availability check) and make your profile private.
- **Discover people** by name or @handle and follow them; private accounts get a follow request instead.
- **Friends who watched**: posters show a small avatar stack of people you follow who watched the film, and movie pages list them with their ratings.
- **Activity feed**: what people you follow watched (with their stars) and added to their watchlists, newest first, with Load more.
- **Member profiles** at `/u/<handle>`: avatar, follower counts, stats (films watched, average rating, a 1–5 star distribution chart) and Watched / Watchlist tabs. Private profiles show only a lock and "Request to follow" until you're approved.
- **Follow requests**: private accounts approve or decline followers on the Requests page; a badge on the Profile tab shows how many are waiting.
- **Search** TMDB as you type, or browse "Popular right now". Posters show your rating and watchlist status.
- **Movie pages** with backdrop, poster, runtime, genres and overview, plus **Add to watchlist** and **Mark as watched**.
- **Reels**: a Hinge-style swipe deck of recommended films. Swipe right (or tap the bookmark, or press →) to add a film to your watchlist, left (✕ or ←) to skip.
- **Watchlist** sorted by date added or title, with remove on each poster.
- **Watched** list (its own tab) where you rate each film with 1–5 stars under its poster. Sort by recent, rating or title; filter by star count or show only unrated films.
- **Taste profile**: once you've rated 5 films, Gemini writes a one-to-two sentence summary of your taste and recommends 3–5 films you haven't seen, each with a reason that names a film you rated.

## Try the social features

The deployed app has four demo members you can follow. They're display-only (no one can sign in as them), so their activity is already in place:

| Handle                     | Profile     | Taste                                                                       |
| -------------------------- | ----------- | --------------------------------------------------------------------------- |
| `@maya_demo` (Maya Chen)   | public      | quiet dramas: Past Lives, Aftersun, In the Mood for Love ★5; Fast X ★1      |
| `@sam_demo` (Sam Okafor)   | public      | sci-fi and action: Dune: Part Two, Blade Runner 2049, Mad Max: Fury Road ★5 |
| `@priya_demo` (Priya Nair) | public      | a mix: Parasite, Spirited Away ★5; one film watched but not yet rated       |
| `@ren_demo` (Ren Ito)      | **private** | Portrait of a Lady on Fire, Burning ★5 (hidden until approved)              |

To try them:

1. Sign in, open **Feed → Discover people** and search `demo`.
2. **Follow** Maya, Sam and Priya. Their watches and watchlist additions appear in **Feed**.
3. Search **Past Lives**: its poster shows who you follow has watched it, and the film page lists them with their ratings under **Friends who watched this**.
4. Open a demo member's profile for their stats, rating chart and Watched / Watchlist tabs.
5. Open `@ren_demo`: the profile is locked. **Request to follow** sends a request (it stays **Requested**, since nobody can sign in as Ren to approve it).

To try approving requests, sign in with a second account in another browser (use a provider with a different email; accounts that share an email are merged), make one account private in **Settings**, and request it from the other.

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

| Variable                        | Exposed to browser | Purpose                                                                     |
| ------------------------------- | ------------------ | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes                | Supabase project URL                                                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes                | Supabase anon key (safe to expose; RLS protects data)                       |
| `SUPABASE_SERVICE_ROLE_KEY`     | **No**             | Bypasses RLS. Used only to write movie snapshots from server-side TMDB data |
| `TMDB_READ_TOKEN`               | **No**             | TMDB v4 "API Read Access Token"                                             |
| `GEMINI_API_KEY`                | **No**             | Google AI Studio key                                                        |
| `GEMINI_MODEL`                  | **No**             | Gemini model id, e.g. a current Flash model                                 |

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

These are the choices made while building Reel, and the reasons behind them. Each point says what it means when you use the app first; the names in brackets at the end show where it lives in the code, if you want to look.

### A few words you'll see

- **TMDB**: The Movie Database, the free online catalogue Reel gets every film, poster and description from.
- **Supabase**: the service that handles sign-in and stores Reel's data (your ratings, watchlist, follows).
- **Handle**: your public username, like `@maya`.
- **RLS (row-level security)**: a rule inside the database that only lets you read and change your own rows, even if someone tries to ask for more.
- **Server action** and **API route**: code that runs on Reel's server (not in your browser) when you press a button or a page needs data.

### Films, watching and rating

- **Reel is for movies only**, and every film comes from TMDB. Ratings are whole stars from 1 to 5.
- **Watching and rating are two separate steps.** On a film's page you press **Mark as watched**; later, on your **Watched** page, you give it stars. Rating is optional. Only rated films count towards your AI taste profile, because an unrated film doesn't say whether you liked it.
- **Marking a film watched takes it off your watchlist**, since you've now seen it. You can add it back if you want to watch it again. Un-marking a film removes it from Watched and clears its rating.
- **Changing your rating doesn't change the date you watched it**, so your history stays accurate.
- **Search is the home page**, and the navigation has seven tabs: Search, Reels, Feed, Watchlist, Watched, Taste and Profile.
- **Sorts and filters are part of the page address** (for example `/watched?sort=rating`). That means refreshing or sharing the link keeps your view. Anything invalid in the address is quietly ignored. When sorting by rating, unrated films go last.

### Saving copies of films

- **When you first save or watch a film, Reel keeps a small copy of it**: title, poster, year and genres. Your lists, your friends' activity and the AI prompt read from these copies, so Reel doesn't have to ask TMDB about every film every time. It's only what's needed for display, not a full copy of TMDB. (`movies` table)
- **Those copies are always made on the server from TMDB's own data**, never from what your browser sends, so nobody can sneak in a fake title or poster. Regular users can only read them; only the server can write them. (`saveMovieSnapshot` in `movie/[id]/actions.ts`, using the admin client)
- **TMDB answers are remembered for an hour** to keep pages fast, and posters are loaded at sensible sizes: smaller in grids, larger on a film's page. (`src/lib/tmdb.ts`)

### Your profile and handle

- **Your profile is created automatically the first time you sign in.** Your handle is made from your name (for example "Justin La" becomes `justin_la`), shortened if needed, with a number added if it's already taken. (a database trigger in the first migration)
- **You can change your handle in Settings.** As you type, Reel tells you if it's free. That check only ever answers yes or no and never reveals who owns a handle. If someone grabs the same handle a split second before you save, the database refuses the duplicate and you're told it's taken. (`/api/handles/check`, `handle_available()`)
- **Changing your handle keeps everything else**: your ratings, lists and followers stay, because Reel connects them to your account, not your handle. Old links to your previous handle stop working.
- **Profile stats count fairly.** "Watched" counts every film you've marked watched; the average rating only uses films you've actually rated. The rating chart is grey and white, not yellow, because it's information rather than a rating you're giving.

### Following people and privacy

- **Profiles are public or private.** Following a public account works straight away. Following a private account sends a request that they have to approve. If a private account switches to public, everyone waiting is approved automatically. (`follows` table)
- **What followers can see:** your films, ratings, stats and watchlist. Someone who isn't allowed to see a private profile gets a lock screen, and your films are never even sent to their browser. (`can_view()`)
- **Finding people works like finding films.** On Discover you search by name or `@handle`, and what you type goes into the page address, just like film search.
- **Unfollowing a private account asks you to confirm**, because getting back in would need their approval again.
- **Following twice does nothing extra, and you can't follow yourself.**
- **Other members' account ids never reach your browser.** Pages and responses only ever use handles. All the social features fetch other people's data through special database functions that check permission first and leave the ids out. (`get_profile`, `search_members`, `get_feed`, `friends_who_watched` and the other functions in `supabase/migrations/`)

### Activity feed and "friends who watched"

- **The Feed shows what the people you follow have done**: films they watched (with their stars) and films they added to their watchlist, newest first, 20 at a time with a **Load more** button. Requests that haven't been approved yet show nothing.
- **The feed is built from your friends' actual lists**, not a separate log. So if someone un-marks a film or removes it from their watchlist, it disappears from the feed too, and the two can never disagree. (`get_feed`)
- **Posters show who you follow has watched each film** as a small stack of avatars, and a film's page lists them with their ratings. Each grid of posters asks for this information once, not once per poster, to keep things fast. (`friends_who_watched`)
- **The avatar stack sits in the poster's top-left corner** rather than the design's bottom-right, so it doesn't overlap your star rating on narrow phone screens.

### The AI taste profile

- **The AI only runs when you press Generate or Regenerate**, and the result is saved, so opening the Taste page later is instant. The page also tells you when you've rated more films since it was made. (`POST /api/taste`)
- **You need at least 5 rated films**, and you can regenerate at most once a minute. The limit protects the AI key from being overused.
- **The AI's answer is double-checked before it's used.** It's told exactly what shape of answer to give, and that shape is checked again on Reel's side. If Google's AI is briefly too busy, Reel automatically tries again a few times. (`src/lib/gemini.ts`)
- **Every recommended film is checked against TMDB.** Films the AI made up, repeats, and films you've already watched are dropped, so every pick is a real film you can open.
- **While it's thinking you see a simple message**, not a fake progress bar, because Reel can't actually measure the AI's progress.

### Reels (swipe to discover)

- **One film card at a time, like a dating app.** Swipe right (or tap the bookmark, or press the right arrow) to add a film to your watchlist; swipe left (or tap the cross, or press the left arrow) to skip it. A short or slow drag springs back so you don't decide by accident.
- **Where the films come from:** first your AI taste picks, then films similar to the ones you rated 4 or 5 stars ("Because you loved Past Lives"), or trending films if you haven't rated anything that highly yet. Films you've already watched or saved are left out. (`src/lib/reels.ts`)
- **Skips only last for your current visit.** Skipped films won't come back until you reload the page.
- **The animation uses the Motion library** (the new name for Framer Motion), and it calms down if your device is set to reduce motion.

### When something goes wrong

- **Every change shows up instantly**, before the server has confirmed it. If saving fails, the change quietly undoes itself and you see a short message. This is called "optimistic UI".
- **Buttons that set something take the result you want, not "toggle".** For example "put this on my watchlist" rather than "flip it", so a double tap can't flip it back the wrong way. (`setOnWatchlist`, `setWatched`)
- **Mistakes come back as clear messages, not crashes.** Bad input, an unknown film or handle, rating a film you haven't watched, or following yourself all return a plain message. Only genuine server problems are treated as errors. The API routes answer with "400" for bad input and "401" if you're signed out.
- **Every page that loads data has a loading placeholder and an error screen** with a Try again button.

### Look and feel

- **Colours come from a fixed set of design tokens** (named colours like `surface`, `ink` and `accent`). Tailwind's built-in colours are switched off so nothing off-palette can slip in.
- **One font (Manrope), Lucide icons only, and no emoji anywhere.** The sign-in buttons use the official Google, GitHub and Discord logos.
- **Yellow is saved for things that matter**: buttons when you hover or press them, filled stars, the tab you're on, and focus outlines.
- **One deliberate exception:** a faint dotted background that glows yellow around your mouse, plus letterbox bars on a film's backdrop. They add a bit of cinema feel, against the design system's usual "no decoration" rule.
- **Most pages share a centred column**; the movie page and Reels break out of it so their artwork can fill the screen.
- **On someone else's profile, the Feed tab lights up**, because that's where you'd normally have come from (via Discover). Your own profile lights up the Profile tab.
- **Films without a poster show a film icon** instead of a blank space.
- **Sign out is in Settings**, with a shortcut icon in the desktop top bar.

### Next.js 16 specifics

- **The "proxy" file is what used to be called middleware.** It keeps your login fresh and sends you to sign-in if you're signed out. Next.js 16 renamed it. (`src/proxy.ts`)
- **Error screens use Next 16's `retry()`**, which reloads the data properly, rather than the older `reset()`.

## Known limitations

- **Google's consent screen names the Supabase domain** (`<project-ref>.supabase.co`) rather than the app, because Supabase handles the OAuth exchange. Fixing this needs a Supabase custom domain (paid).
- **Unknown movie ids return HTTP 200** with the 404 page and a `noindex` tag, because `loading.tsx` starts streaming before the id is checked. This is documented Next.js behaviour.
- **Gemini availability**: generation depends on Google's model capacity. Retries cover short spikes; a sustained outage shows an error with "Try again", and the previous profile is kept.
- **No automated test suite.** Behaviour was verified manually and with scripted checks against the live database during development.
