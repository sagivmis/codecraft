# CodeCraft

A coding education platform for ages 9-18, teaching JavaScript, TypeScript, Python, and C# through a five-stage interactive pedagogy: Hook → Animated Walkthrough → Mini-Quiz → Fix-the-Bug → Free Implementation.

Built as a responsive PWA so it works on phones, tablets, and desktops. Includes a custom on-screen Code Keyboard that makes real typing viable on mobile.

## Status

Early scaffolding. See [docs/plan.md](docs/plan.md) (coming soon) for the full roadmap.

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

| Command | Description |
| --- | --- |
| `pnpm dev` | Run the web app in dev mode |
| `pnpm dev:api` | Run the backend API in dev mode |
| `pnpm build` | Build all packages and apps |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format the entire repo with Prettier |
| `pnpm test` | Run all tests |

## License

UNLICENSED (private / WIP)
