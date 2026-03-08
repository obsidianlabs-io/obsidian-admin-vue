# Demo Deployment Runbook

Use this page when you want the shortest executable path to turn the current frontend preview into a real hosted full-stack demo.

This runbook assumes:

- backend runtime uses `docker-compose.demo.yml`
- backend config starts from `.env.demo.example`
- frontend build starts from `.env.demo-live.example`
- the hosted demo points to a real Laravel backend, not the built-in demo runtime

## 1. Prepare the backend first

In the backend repository:

```bash
cp .env.demo.example .env.demo
docker compose -f docker-compose.demo.yml up -d
docker compose -f docker-compose.demo.yml exec app php artisan key:generate --force
docker compose -f docker-compose.demo.yml exec app php artisan migrate:fresh --seed --force
```

Do not build the live frontend bundle until the backend URL and health probes are stable.

## 2. Prepare the frontend live-demo environment

Create a dedicated env file:

```bash
cp .env.demo-live.example .env.demo-live
```

Replace these values:

- `VITE_SERVICE_BASE_URL`
- `VITE_OTHER_SERVICE_BASE_URL`
- `VITE_REVERB_SCHEME`
- `VITE_REVERB_HOST`
- `VITE_REVERB_PORT`
- `VITE_REVERB_APP_KEY`

Keep:

- `VITE_APP_RUNTIME=backend`

Do not use `VITE_APP_RUNTIME=demo` for a hosted full-stack environment.

## 3. Build the live demo frontend

```bash
pnpm install
pnpm build --mode demo-live
```

Deploy the generated `dist` directory to your static host.

Recommended first targets:

- Vercel
- Netlify
- object storage + CDN
- any Nginx-based static host

## 4. Verify frontend pairing

Before sharing the demo URL, run:

```bash
pnpm typecheck:api
pnpm test:fullstack
```

This confirms the generated SDK still matches the backend and that the frontend can log in and interact with the real seeded backend.

## 5. Manual smoke checks

Confirm these flows in the hosted environment:

- login succeeds
- tenant switching succeeds
- user page loads
- audit list loads
- selected demo-safe drawers such as language, organization, or team still save correctly

The public static preview is not enough to validate these flows. Use the hosted live-demo bundle instead.

## 6. Rollback

Frontend rollback should always be artifact-based.

Use this order:

1. redeploy the previous static frontend bundle
2. if the problem is contract drift, roll backend and frontend together according to the compatibility matrix
3. rerun `pnpm typecheck:api` and the pairing smoke before re-promoting

## 7. First public promotion checklist

Do not share the hosted demo URL until all of these are true:

- backend health endpoints are green
- frontend live-demo build is deployed successfully
- `pnpm test:fullstack` is green
- compatibility matrix is current
- seeded credentials and reset policy are documented
- docs clearly distinguish:
  - static preview
  - hosted full-stack demo
