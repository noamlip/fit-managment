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

The API reads and writes JSON under `apps/web/public/data/`.

## Projects

Nx project names: `web`, `api`. Targets are defined in each app’s `project.json`.
