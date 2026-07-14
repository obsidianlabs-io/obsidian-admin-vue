# Frontend / Backend Compatibility Matrix

This repository is versioned independently from `obsidian-admin-laravel`.

## Supported pairs

| Frontend | Backend | Status | Notes |
| --- | --- | --- | --- |
| `main` | `main` | Active development | CI assumes both repositories evolve together and regenerates API types from backend OpenAPI artifacts. |
| `v1.2.2` | `v1.3.2` | Stable | Current documented release pair. Frontend refactor that merges monorepo packages, syncs generated types with backend DTO removals, redesigns tenant switcher, and expands component test coverage. |
| `v1.2.1` | `v1.3.1` | Stable | Previous stable release pair. Frontend patch release that aligns auth contract updates, request/runtime hardening, and Laravel 13 backend pairing. |
| `v1.2.0` | `v1.3.1` | Stable | Previous stable release pair. Backend patch release with security and contract-alignment fixes before the coordinated frontend patch release. |
| `v1.2.0` | `v1.3.0` | Stable | Previous stable release pair. Backend-only Laravel 13 minor release with no required frontend tag bump. |
| `v1.2.0` | `v1.2.1` | Stable | Previous stable release pair. |

## Current coordinated backend lane

- Backend `main` now runs on the Laravel 13 baseline.
- The current stable published pair is frontend `v1.2.2` with backend `v1.3.2`.
- Frontend `v1.2.1` remains deployable with backend `v1.3.1`, but `v1.2.2` is the release tag to prefer for the current frontend lane.

## Source of truth

- Backend API contract: `obsidian-admin-laravel/docs/openapi.yaml`
- Frontend generated SDK: `src/service/api/generated`
- Frontend API contract snapshot: `docs/api-client-contract.snapshot`

## Upgrade rule

When backend API contract changes:

1. update backend OpenAPI in `obsidian-admin-laravel`
2. regenerate frontend API types and SDK in `obsidian-admin-vue`
3. run:
   - `pnpm contract:check`
   - `pnpm typecheck:api`
   - `pnpm check:ci`

If a backend change is not backward-compatible for the published frontend release pair, publish a new frontend release and update this matrix.
