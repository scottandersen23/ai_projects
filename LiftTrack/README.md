# LiftTrack

Next.js workout logging app: add workouts, view the log, track progress, and manage settings. Data is stored in the browser (localStorage) unless you add a backend later.

## Prerequisites

- **Node.js** 20.x or newer (22.x recommended)
- **npm** 10.x or compatible (ships with Node)

Verify versions:

```bash
node -v
npm -v
```

## Install and run locally

From this directory (`LiftTrack/`):

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server uses Turbopack (`next dev --turbo`).

## Production build (verify before deploy)

Always confirm a clean production build locally or in CI:

```bash
npm install
npm run build
npm run start
```

Then open [http://localhost:3000](http://localhost:3000) and smoke-test navigation, posting a workout, and settings. `npm run start` runs the optimized Next.js server (not Turbopack).

## Publish to production

This app has **no required environment variables** for a basic deployment. It does not include a database or auth service; user data lives in **localStorage** in each visitor’s browser.

### Option A: Vercel (recommended for Next.js)

1. Push the `LiftTrack` project to GitHub, GitLab, or Bitbucket (or use the Vercel CLI with a local directory).
2. In [Vercel](https://vercel.com), create a **New Project** and import the repository.
3. Set the **Root Directory** to `LiftTrack` if the repo contains multiple projects (e.g. monorepo); otherwise use the repo root.
4. **Framework Preset:** Next.js (auto-detected).
5. **Build Command:** `npm run build` (default).
6. **Output:** Vercel runs `next start` for you; no custom output directory needed.
7. Deploy. Vercel will assign a production URL and rebuild on every push to your production branch.

Optional: connect a custom domain under Project → Settings → Domains.

### Option B: Any Node host (Docker, VPS, PaaS)

Run the production server with Node:

```bash
npm install
npm run build
NODE_ENV=production npm run start
```

By default the app listens on port **3000**. Set `PORT` if your platform expects another port (e.g. `PORT=8080 npm run start`).

Use a process manager (systemd, PM2, etc.) or your platform’s web process so the Node process restarts on failure. Put HTTPS and reverse proxy (nginx, Caddy, etc.) in front if you expose a VPS directly.

### Option C: Docker (outline)

Use a multi-stage image: stage 1 installs dependencies and runs `npm run build`; stage 2 copies `.next`, `node_modules` (production only), `package.json`, and `public` if present, then `CMD ["npm", "run", "start"]`. Expose the port your host expects (often 3000). Pin the Node version to match development (e.g. `node:22-alpine`).

## Continuous deployment

- **Vercel:** Connect the repo; production deploys from your chosen branch; preview deploys from pull requests.
- **Other CI:** Run `npm ci && npm run build` on each merge to `main`; deploy the artifact or run `npm run start` on your server using the same Node version as local builds.

## Production checklist

- [ ] `npm run build` completes with no errors.
- [ ] `npm run start` serves the app and critical flows work (add workout, post to log, progress, settings).
- [ ] **HTTPS** is enabled on the public URL (handled automatically on Vercel).
- [ ] **Node version** in production matches `.nvmrc` or `engines` if you add them later (avoids subtle build/runtime differences).

## Troubleshooting

| Issue                           | What to try                                                                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Build fails on ESLint/typecheck | Run `npm run build` locally and fix reported errors.                                                                                            |
| Blank or broken UI after deploy | Confirm you are not using `output: 'export'` unless you intentionally moved to static export; this app expects a Node runtime for `next start`. |
| Data missing for users          | Workout log and profile data are per-browser localStorage; they are not synced across devices unless you add a backend.                         |

## Scripts reference

| Command         | Purpose                                        |
| --------------- | ---------------------------------------------- |
| `npm run dev`   | Development server with hot reload             |
| `npm run build` | Production-optimized build                     |
| `npm run start` | Serve the production build (run after `build`) |
| `npm run lint`  | ESLint                                         |
