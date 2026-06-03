# CodeCraft

A coding education platform for ages 9-18, teaching JavaScript, TypeScript, Python, and C# through a five-stage interactive pedagogy: Hook → Animated Walkthrough → Mini-Quiz → Fix-the-Bug → Free Implementation.

Built as a responsive PWA so it works on phones, tablets, and desktops. Includes a custom on-screen Code Keyboard that makes real typing viable on mobile.

## Status

**v1 feature-complete** for JavaScript:

- 5 interactive stages per lesson (Hook → Animated Walkthrough → Quiz → Fix-the-bug → Implement)
- 5 lessons live (variables, conditionals, functions, arrays + iteration, objects mini-project)
- Dual-themed UI (Kids / Teens) with first-run onboarding age-gate
- Monaco-powered code editor, custom on-screen Code Keyboard for mobile, Web-Worker test runner
- Offline-first PWA with installable manifest, branded icons, and an install prompt
- Optional Postgres-backed sync API (Hono + Drizzle) — the app stays fully usable without it
- CI runs typecheck, content validation, format check, and full builds on every PR

## Tech stack

- **Monorepo:** pnpm workspaces
- **Web:** React 19 + TypeScript + Vite + Tailwind + PWA
- **API:** Hono + Drizzle + Postgres (Neon)
- **Editor:** Monaco
- **Runtimes:** Web Worker (JS/TS lessons), WebContainers (full-stack capstone)
- **Content:** MDX + typed manifests (content-as-code)

## Repo layout

```
apps/
  web/         React PWA - the student-facing app
  api/         Hono backend - auth, progress, streaks
packages/
  schema/      Shared Zod schemas + TypeScript types for lessons
  content/     All lesson content (MDX + manifests)
  runtime/     Web Worker test runner, WebContainers wrapper
  ui/          Shared UI primitives + Kids/Teens themes
```

## Prerequisites

- Node.js >= 22 (LTS)
- pnpm >= 11
- Git

## Getting started

```bash
pnpm install
pnpm dev
```

## Scripts

| Command                                     | Description                                            |
| ------------------------------------------- | ------------------------------------------------------ |
| `pnpm dev`                                  | Run the web app in dev mode                            |
| `pnpm dev:api`                              | Run the backend API in dev mode                        |
| `pnpm build`                                | Build all packages and apps                            |
| `pnpm typecheck`                            | Typecheck all packages                                 |
| `pnpm lint`                                 | Lint all packages                                      |
| `pnpm format`                               | Format the entire repo with Prettier                   |
| `pnpm --filter @codecraft/content validate` | Re-validate every lesson manifest + canonical solution |
| `pnpm --filter @codecraft/web icons`        | Re-generate PWA icons from `public/favicon.svg`        |
| `pnpm --filter @codecraft/api db:migrate`   | Apply Drizzle migrations (requires `DATABASE_URL`)     |

## Deployment

- **Web → Vercel** (or Cloudflare Pages / Netlify — `_redirects` is set up for SPA fallback). `apps/web/vercel.json` ships ready-to-go. CI in `.github/workflows/deploy-web.yml` is gated on `VERCEL_*` secrets being present so forks don't get noisy failures.
- **API → any Node host** via `apps/api/Dockerfile` (Fly.io, Railway, Render). Set `DATABASE_URL` to a Neon/Supabase URL and run `pnpm --filter @codecraft/api db:migrate` once. Without `DATABASE_URL`, the API falls back to an in-memory repo (great for local dev and ephemeral previews).
- **Continuous integration** (`.github/workflows/ci.yml`) runs typecheck, content validation, format check, and full builds on every push to `main` and on PRs.

## License

UNLICENSED (private / WIP)
