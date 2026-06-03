# Deploy CodeCraft

This guide gets **web** (Vercel) and optionally **API + Postgres** (Neon + Render) live. The app works fully offline without the API; the API only adds cross-device progress/streak sync.

**Time:** ~20 minutes for web-only · ~45 minutes for web + API.

---

## Prerequisites

- GitHub account and this repo pushed to GitHub (`main` branch)
- [Vercel](https://vercel.com) account (free tier is fine)
- Optional: [Neon](https://neon.tech) + [Render](https://render.com) for the API

---

## Part 1 — Web (Vercel)

### 1. Push to GitHub

If you have not created a remote yet:

```bash
cd codecraft
git remote add origin https://github.com/YOUR_USER/codecraft.git
git push -u origin main
```

### 2. Import in Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import** your GitHub repo.
2. **Root Directory:** `apps/web` (required for the pnpm workspace).
3. **Framework Preset:** Vite (auto-detected from `vercel.json`).
4. **Important:** open **Root Directory** → enable **“Include source files outside of the Root Directory in the Build Step”**.  
   Without this, workspace packages (`@codecraft/content`, etc.) are missing and the build fails.
5. Leave **Build** / **Install** commands as in `apps/web/vercel.json` (defaults are fine).
6. **Environment variables** (Production):

   | Name           | Value                                      | Required |
   | -------------- | ------------------------------------------ | -------- |
   | `VITE_API_URL` | `https://YOUR-API.onrender.com` (Part 2)   | No       |

   Leave `VITE_API_URL` empty for a fully offline-only deployment.

7. Click **Deploy**.

Your app will be at `https://YOUR-PROJECT.vercel.app`.

### 3. Verify

- Open `/` — onboarding and lessons load.
- Open `/lessons` — five JavaScript lessons.
- On a phone: add to home screen (PWA); code keyboard on Implement/Fix stages.
- Optional: complete a stage, refresh — progress should persist in `localStorage`.

### 4. GitHub Actions deploy (optional)

To auto-deploy on every push to `main`, add these **repository secrets**  
(Settings → Secrets and variables → Actions):

| Secret              | Where to get it                                              |
| ------------------- | ------------------------------------------------------------ |
| `VERCEL_TOKEN`      | Vercel → Account Settings → Tokens                           |
| `VERCEL_ORG_ID`     | `.vercel/project.json` after `vercel link`, field `orgId`    |
| `VERCEL_PROJECT_ID` | `.vercel/project.json`, field `projectId`                    |
| `VITE_API_URL`      | Same as Vercel env (optional)                                |

Link the project locally (once):

```bash
cd apps/web
npx vercel@latest link
```

Workflow: `.github/workflows/deploy-web.yml` (skips if secrets are missing).

---

## Part 2 — API + database (optional)

Skip this if you only need offline/local progress.

### 1. Neon Postgres

1. [console.neon.tech](https://console.neon.tech) → new project.
2. Copy the **connection string** (`postgresql://...`).

### 2. Run migrations (once, from your machine)

```bash
# PowerShell
$env:DATABASE_URL = "postgresql://USER:PASS@HOST/db?sslmode=require"
pnpm --filter @codecraft/api db:migrate
```

You should see tables `users`, `lesson_progress`, `streaks` created.

### 3. Deploy API on Render

**Option A — Blueprint**

1. Push `render.yaml` to GitHub.
2. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint** → connect repo.
3. Set **`DATABASE_URL`** when prompted.
4. Set **`CORS_ORIGINS`** to your Vercel URL, e.g. `https://codecraft.vercel.app`  
   (comma-separate multiple origins; no trailing slash).

**Option B — Docker manually**

- **Dockerfile path:** `apps/api/Dockerfile`
- **Docker context:** repository root (`.`)
- **Health check path:** `/health`
- **Port:** Render sets `PORT` automatically; the app reads `process.env.PORT`.

### 4. Wire web → API

1. Vercel → Project → **Settings** → **Environment Variables**  
   Set `VITE_API_URL` = `https://YOUR-SERVICE.onrender.com` (no trailing slash).
2. **Redeploy** the web app (env vars are baked in at build time).
3. Render → **Environment** → confirm `CORS_ORIGINS` matches your Vercel URL.

### 5. Smoke-test sync

1. Open the deployed site, complete a lesson stage.
2. DevTools → Application → Local Storage — keys `codecraft.progress.*` and `codecraft:engagement:*`.
3. Check API logs on Render for `PUT /v1/progress` (anonymous bearer = device UUID).

---

## Local CLI deploy (alternative to dashboard)

```bash
pnpm install
pnpm --filter @codecraft/web icons
cd apps/web
npx vercel@latest login
npx vercel@latest link          # pick scope, link to new or existing project
npx vercel@latest --prod        # production deploy
```

Set `VITE_API_URL` in the Vercel dashboard or:

```bash
npx vercel@latest env add VITE_API_URL production
```

---

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| Vercel build: cannot find `@codecraft/...` | Enable **Include source files outside Root Directory**; Root Directory must be `apps/web`. |
| PWA install has no icon | Run `pnpm --filter @codecraft/web icons` before build (CI/deploy workflow already does). |
| API CORS errors in browser | Set `CORS_ORIGINS` on Render to exact Vercel origin (scheme + host). |
| Progress not syncing | `VITE_API_URL` must be set **before** build; redeploy web after changing it. |
| `db:migrate` fails | Use Neon connection string with `?sslmode=require`. |

---

## What runs where

| Component | Host | Notes |
| --------- | ---- | ----- |
| Student PWA | Vercel | `apps/web`, SPA rewrites in `vercel.json` |
| Sync API | Render (Docker) | `apps/api/Dockerfile`, optional |
| Postgres | Neon | Drizzle migrations in `apps/api` |

---

## Security notes (v1)

- Auth is anonymous device UUIDs (hashed server-side). Suitable for beta; replace with Clerk (or similar) before public launch at scale.
- Do not commit `.env` files; use host dashboards for secrets.
- Use specific `CORS_ORIGINS` in production, not `*`.
