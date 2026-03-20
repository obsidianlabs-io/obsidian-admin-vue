# Backend Pairing

## Recommended backend

The intended companion backend for this project is:

- [Obsidian Admin Laravel](https://github.com/obsidianlabs-io/obsidian-admin-laravel)

This frontend is designed around a contract-driven workflow, not around ad-hoc REST calls. If you want the strongest out-of-the-box experience, use the Laravel repository as the backend source of truth.

## Why the pairing matters

This repository expects a backend that can provide:

- stable OpenAPI artifacts
- DTO and resource shapes that can be regenerated into frontend typings
- tenant-aware auth and menu metadata
- consistent field-level validation errors
- runtime theme, i18n, and schema APIs

That is why the default compatibility target is the Laravel backend.

## Source-of-truth chain

The core contract chain is:

1. backend OpenAPI: `obsidian-admin-laravel/docs/openapi.yaml`
2. frontend generated SDK: `src/service/api/generated`
3. frontend facades: `src/service/api/*`
4. application usage from composables, stores, and views

## Compatibility policy

Read the compatibility matrix before mixing versions:

- `docs/compatibility-matrix.md`
- `obsidian-admin-laravel/docs/compatibility-matrix.md`

Current stable pair:

- frontend `v1.2.0`
- backend `v1.2.1`

Current backend development note:

- backend `main` now tracks Laravel 13
- the next backend release note is prepared as `obsidian-admin-laravel/docs/releases/v1.3.0.md`
- until a new coordinated frontend tag is cut, treat `v1.2.0 + v1.2.1` as the stable published pair

## If you use another backend

You can still use this frontend with a different backend, but you should keep these rules:

- preserve the generated-SDK architecture
- expose a stable OpenAPI document
- keep validation errors field-addressable
- keep auth/session/menu payloads consistent with your route/store model
- treat `src/service/api/*` as the only app-facing API layer

If your backend cannot provide those guarantees, this project will degrade into a hand-maintained admin frontend and you lose most of the long-term value.
