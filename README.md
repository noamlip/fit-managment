# Anti-Gravity Training Portal

Nx monorepo (npm workspaces) with:

| App   | Path        | Description        |
|-------|-------------|--------------------|
| `web` | `apps/web`  | Vite + React SPA   |
| `api` | `apps/api`  | Express + TypeScript |

## Setup

```bash
npm run install:all
```

(`install:all` runs `npm install` at the repo root and installs every workspace package.)

## Commands (from repository root)

| Command                | Description                               |
|------------------------|-------------------------------------------|
| `npm run install:all`  | Install root + all workspace dependencies |
| `npm run run:all`      | Vite + API dev servers together           |
| `npm run dev:web`      | Vite dev server only                      |
| `npm run dev:api`      | API on port 3001 only                     |
| `npm run build`        | Production build (`web`)                  |
| `npm run lint`         | ESLint for `web`                          |
| `npx nx graph`         | Dependency graph                          |

## Local API data

With `USE_FIRESTORE=false` (default locally), the API reads and writes JSON under `apps/web/public/data/`. In Firebase (Cloud Functions), Firestore is used unless you set `USE_FIRESTORE=false`.

## Firebase (Hosting + Functions + Firestore)

1. Create a Firebase/GCP project, enable **Firestore** and **Cloud Functions**, and turn on **Firebase Hosting**.
2. Set `.firebaserc` `projects.default` to your Firebase project ID (replace the placeholder).
3. Add the GitHub secret **`FIREBASE_SERVICE_ACCOUNT`**: a service-account JSON with permissions to deploy Hosting, Functions, and update Firestore rules (see [Firebase GitHub Action setup](https://github.com/FirebaseExtended/action-hosting-deploy)).
4. **Seed Firestore once** before first deploy (from repo root, with Application Default Credentials or `GOOGLE_APPLICATION_CREDENTIALS` pointing at a key that can write Firestore):

   ```bash
   node scripts/seed-firestore.mjs
   ```

5. Production web builds should use an **empty** `VITE_API_BASE_URL` so the app calls same-origin `/api/...` (Hosting rewrites to the `api` function). Example:

   ```bash
   VITE_API_BASE_URL= npx nx run web:build
   npx firebase-tools deploy --only hosting,functions,firestore:rules
   ```

**CI:** pushes to `main` or `master` run `firebase deploy` (hosting, functions, Firestore rules).

**GitHub Pages previews** (PRs and non-`main`/`master` pushes): the workflow builds the SPA with a subpath base and publishes to the **`gh-pages`** branch under `previews/<slug>/` (`pr-<number>` or a sanitized branch name). Enable **Settings → Pages → Build and deployment → Branch `gh-pages` / (root)**. Add a repository **variable** `FIREBASE_HOSTING_ORIGIN` with your live Firebase Hosting origin (no trailing slash), e.g. `https://your-project.web.app`, so the static site can call the real API (GitHub Pages cannot host `/api`). The job registers the **github-pages-preview** environment with the preview URL; PRs get an auto-updated comment with the link.

**Preview caveat:** Previews use production Firebase API/Firestore unless you point `FIREBASE_HOSTING_ORIGIN` at another deployment.

## Projects

Nx project names: `web`, `api`. Targets are defined in each app’s `project.json`.
