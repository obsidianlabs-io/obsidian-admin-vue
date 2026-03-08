# Frontend / Backend Compatibility Matrix

This repository is versioned independently from `obsidian-admin-laravel`.

## Supported pairs

| Frontend | Backend | Status | Notes |
| --- | --- | --- | --- |
| `main` | `main` | Active development | CI assumes both repositories evolve together and regenerates API types from backend OpenAPI artifacts. |
| `v1.1.1` | `v1.2.0` | Stable | Current documented release pair. |

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
