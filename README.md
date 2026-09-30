# Watchlist-Tracker

`Movie watchlist and rating tracker with AI taste profiles and a social feed. Built with Next.js, Supabase and TMDB.`

# Decisions

- Stack: Next.js App Router, TypeScript, Tailwind, Vercel
- Auth: Supabase OAuth only — Google, GitHub, Discord
- Database: Supabase Postgres with RLS on every table
- User IDs: Use auth.users.id UUIDs, never emails or handles
- Movies: TMDB, server-side requests only
- Ratings: 1–5 whole stars; rating a movie marks it as watched
- AI: Gemini, server-side, validated structured JSON
- Handles: Auto-generated from OAuth name, collision suffix if needed, editable later
- Privacy: Public/private profiles; private follows require approval
- Follower visibility: Watched movies, ratings, stats, and watchlist
- Feed: Watched/rated and watchlist activity from accepted follows
- UUID privacy: Other users' UUIDs never reach the client
- Movie snapshots: Store basic movie metadata locally for display and AI prompts, rather than repeatedly calling TMDB
- Design tokens: The design system's names (`line`, `line-strong`, `ink`, `on-accent`, ...); Tailwind's default palette is removed
- Routes: Search is the home page (`/`); profiles live at `/u/<handle>`
- Font: Manrope, loaded with `next/font`
- Missing posters: A film icon on a raised 2:3 block
- Proxy: Session refresh and sign-in redirects live in `src/proxy.ts`, Next 16's replacement for `middleware.ts`
- Sign-in: Official Google (full colour), GitHub and Discord (single colour) logos; the design's poster wall is added once TMDB is wired up
- Sign out: Icon in the desktop top bar and a button on the placeholder profile page, until Settings exists
- Supabase browser client: Not created until a client component needs it; sign-in runs as a server action
- Movie snapshot writes: Signed-in users can only read `movies`; the server writes snapshots with the Supabase service-role key so clients can't plant fake titles
- Profile edits: Column grants limit client updates to `handle` and `is_private`
- Page layout: Standard pages share a padded, centred container via the `(app)/(contained)` route group; the movie page sits outside it so its backdrop can run full width
- TMDB caching: TMDB responses are cached for an hour; images use TMDB sizes (`w342` grids, `w500` detail poster, `w1280` backdrop)
- Not-found films: Bad or unknown ids render the 404 page; because `loading.tsx` streams first, the HTTP status is 200 with a `noindex` tag (documented Next.js behaviour)
- Error retry: `error.tsx` uses Next 16's `retry()` (re-fetches) instead of `reset()`
- Background: A faint dot pattern (24px spacing) sits behind all content (surfaces and posters cover it); on hover-capable devices the dots glow yellow around the pointer, and the movie backdrop has letterbox bars. A deliberate exception to the design system's "no decoration" and "yellow only in four places" rules
