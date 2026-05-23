# Skill Registry — habitmaxxing

Generated: 2026-05-22

## User Skills

| Skill | Trigger Contexts |
|-------|-----------------|
| `vercel-react-best-practices` | Writing/reviewing React components, Next.js pages, data fetching, bundle optimization, performance improvements |
| `supabase` | Any task involving Supabase (Auth, Database, Edge Functions, Storage, RLS, migrations) |
| `frontend-design` | Building web components, pages, dashboards, React components, HTML/CSS layouts, or styling/beautifying any web UI |

## Compact Rules

### vercel-react-best-practices
- Eliminate async waterfalls: fetch in parallel with `Promise.all`, not sequentially
- Avoid barrel imports (`index.ts` re-exports) — import directly from source files
- Defer third-party scripts; use `next/script` with `strategy="lazyOnload"` or `"afterInteractive"`
- Use dynamic imports (`next/dynamic`) for heavy components not needed on initial render
- Use `useTransition` for non-urgent state updates to avoid blocking renders
- Derive state from props/existing state — avoid `useEffect` + `setState` for derived data
- Memoize expensive computations with `useMemo`; wrap stable callbacks in `useCallback`
- Never define components inline inside other components — hoist them
- Use functional `setState` (prev => ...) when new state depends on previous state
- Prefer `startTransition` over `useEffect` for async UI state transitions

### frontend-design
- Choose a bold, intentional aesthetic direction before writing any code
- Avoid generic fonts (Arial, Inter) — pick distinctive, characterful typography
- Production-grade: functional AND visually striking, not placeholder UI
- Every detail must be cohesive with the chosen aesthetic POV

### supabase
- Always fetch Supabase changelog before implementing features (APIs change frequently)
- Use `getUser()` server-side (not `getSession()`) — session can be spoofed
- Always enable RLS on tables exposed to the Data API
- After any fix, run a verification query — a fix without verification is incomplete

## Project Conventions

- Global instructions: `~/.claude/CLAUDE.md`
- Project agent skills: `.agents/skills/`
