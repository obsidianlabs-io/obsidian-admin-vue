# Demo

## Public preview

This repository now supports a static public preview mode.

When GitHub Pages is enabled for the repository, the preview is published under:

- `/preview/`

The preview runs the real Vue application shell against an in-app demo backend. That means:

- no live Laravel backend is required
- auth, tenant switching, CRUD drawers, feature flags, audit pages, theme config, and i18n still behave like a real app
- data is intentionally ephemeral and only meant for evaluation

## Recommended evaluation path

Choose one of these two paths.

### 1. Public preview

Use the hosted preview when you want to evaluate UX, flows, and runtime behavior quickly.

### 2. Full stack local pairing

Use the repository locally with the companion backend when you want contract-accurate backend integration:

- frontend: `obsidian-admin-vue`
- backend: `obsidian-admin-laravel`

Start with:

```bash
pnpm install
pnpm dev
```

Pair it with the Laravel backend described in:

- `docs/backend-pairing.md`
- `obsidian-admin-laravel/docs/compatibility-matrix.md`

## What to inspect first

If you are evaluating whether this project is suitable as an open-source admin baseline, check these flows first:

- login and 2FA behavior
- tenant switching and menu changes
- user, role, tenant, organization, and team CRUD drawers
- audit policy and feature flag pages
- runtime theme and i18n behavior

## Local preview mode

Run the built-in preview runtime locally:

```bash
pnpm install
pnpm dev:demo
```

For a production-style static build:

```bash
pnpm build:demo
```

## Local evaluation checklist

Before judging the preview, run the release-grade frontend gate:

```bash
pnpm check:ci
```

If you are pairing with the Laravel backend instead of demo mode, also confirm:

- backend release gate is green
- frontend `pnpm typecheck:api` is green
- generated SDK files are in sync with backend OpenAPI

## Design constraints

The preview intentionally avoids pretending to be production.

It prioritizes:

- generated API contracts
- reproducible CI gates
- multi-tenant-safe behavior
- testable CRUD and auth flows
- docs that match the actual repository state

That is why the preview is:

- versioned through the repository itself
- resettable by rebuild
- clearly separated from the Laravel-backed runtime
