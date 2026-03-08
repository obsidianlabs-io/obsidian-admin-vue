# Demo

## Current status

There is no permanent public demo instance yet.

That is intentional. This project is optimized for contract accuracy, multi-tenant behavior, and release discipline. A misleading public demo with fake or drifting backend behavior would create more confusion than value.

## Recommended evaluation path

Use the repository locally with the companion backend:

- frontend: ``
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

## Local demo checklist

Before judging the frontend, run the release-grade frontend gate:

```bash
pnpm check:ci
```

If you are pairing with the Laravel backend, also confirm:

- backend release gate is green
- frontend `pnpm typecheck:api` is green
- generated SDK files are in sync with backend OpenAPI

## Why there is no hosted public demo yet

A serious admin template should not hide runtime truth.

This repository currently prioritizes:

- generated API contracts
- reproducible CI gates
- multi-tenant-safe behavior
- testable CRUD and auth flows
- docs that match the actual repository state

A public demo becomes valuable only when it is versioned, resettable, and contract-aligned with the published backend.

## Planned direction

The intended next step is a versioned public preview tied to the compatibility matrix, not an unversioned marketing demo.
