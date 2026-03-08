# Evaluator Demo Validation

Use this page right after the first evaluator demo is deployed.

This checklist focuses on the minimum browser-facing proof that the hosted Vue app is truly paired with the real Laravel backend and is safe to show to evaluators.

## 1. Build and pairing checks

Run these before validating the hosted URL.

```bash
pnpm typecheck:api
pnpm test:fullstack
```

Pass conditions:

- generated API files are in sync with the backend
- full-stack pairing smoke is green
- the live-demo build is targeting `VITE_APP_RUNTIME=backend`

## 2. Login and shell boot

Open the hosted evaluator URL and verify:

- login succeeds with the documented seeded account
- the app shell loads without a white screen or console bootstrap error
- the current tenant indicator appears in the header

## 3. Tenant switching

Verify the hosted frontend reflects real backend scope changes.

Pass conditions:

- switching from platform scope to `Main Tenant` succeeds
- switching back succeeds
- route state remains stable after the switch

## 4. High-value list views

At minimum, verify these pages against the hosted backend.

- user
- tenant
- audit log
- feature flag
- organization or team

Pass conditions:

- the page renders using real backend data
- seeded rows are visible
- refresh succeeds without contract or auth errors

## 5. Demo-safe write flows

Use only low-risk write paths during the first evaluator validation.

Recommended first set:

- language create or edit
- organization create or edit
- team create or edit

Pass conditions:

- drawer opens and preloads correctly
- save succeeds
- new or edited data appears in the list
- the behavior matches the documented reset policy

## 6. Static preview vs hosted demo truth

Confirm the hosted evaluator environment is clearly distinguished from the static preview.

Pass conditions:

- docs still describe the GitHub Pages preview as static/demo-backed
- docs still describe the evaluator demo as live-backend-backed
- no public page implies that the preview and the hosted demo are the same thing

## 7. Stop conditions

Do not share the evaluator demo URL if any of these are true.

- login fails
- tenant switching is unstable
- user or audit pages fail to load
- demo-safe save flows fail
- `pnpm test:fullstack` is red
- the hosted frontend is still pointing at the built-in demo runtime instead of the real backend
