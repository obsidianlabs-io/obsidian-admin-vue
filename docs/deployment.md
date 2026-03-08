# Deployment

## Deployment model

This frontend is a static build distributed from the `dist` output:

```bash
pnpm build
```

The result can be served from:

- Nginx
- CDN + object storage
- GitHub Pages for docs + `/preview/` demo mode
- any static hosting platform that can serve SPA routes correctly

## Environment modes

The project currently uses these environment files:

- `.env`
- `.env.demo`
- `.env.test`
- `.env.prod`

For production deployment, build with:

```bash
pnpm build
```

If you need a local production preview:

```bash
pnpm preview
```

If you want the hosted-preview runtime locally:

```bash
pnpm dev:demo
pnpm build:demo
```

## Backend assumptions

Production deployment assumes the backend is already reachable and stable.

Before shipping a frontend release, confirm:

- backend compatibility matrix is satisfied
- `pnpm typecheck:api` is green
- generated API files are committed
- tenant switching, auth, and menu payloads match the deployed backend

## Release-grade frontend checks

Run this before a production deploy:

```bash
pnpm check
pnpm typecheck:api
pnpm test:unit
pnpm test:vue
pnpm build
```

For release parity, use:

```bash
pnpm check:ci
```

## Static hosting rules

Your host must:

- serve `index.html` for SPA routes
- cache static hashed assets aggressively
- avoid stale HTML during release rollouts
- preserve the frontend base path if you deploy below `/`

If you publish the docs site to GitHub Pages, the workflow already builds:

- docs site at the repository base path
- demo preview at `/preview/`

## Docs site deployment

The docs site is built with VitePress:

```bash
pnpm docs:build
pnpm docs:preview
```

GitHub Pages deployment is handled by:

- `.github/workflows/docs-site.yml`

Repository-side setup is documented in:

- `docs/github/repository-setup-checklist.md`
