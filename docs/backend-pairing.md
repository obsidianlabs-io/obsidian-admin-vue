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

1. backend OpenAPI: `/Users/zero/Documents/Project/WK/obsidian-admin-laravel/docs/openapi.yaml`
2. frontend generated SDK: `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/generated`
3. frontend facades: `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/*`
4. application usage from composables, stores, and views

## Compatibility policy

Read the compatibility matrix before mixing versions:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/docs/compatibility-matrix.md`
- `/Users/zero/Documents/Project/WK/obsidian-admin-laravel/docs/compatibility-matrix.md`

Current stable pair:

- frontend `v1.1.1`
- backend `v1.2.0`

## If you use another backend

You can still use this frontend with a different backend, but you should keep these rules:

- preserve the generated-SDK architecture
- expose a stable OpenAPI document
- keep validation errors field-addressable
- keep auth/session/menu payloads consistent with your route/store model
- treat `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/*` as the only app-facing API layer

If your backend cannot provide those guarantees, this project will degrade into a hand-maintained admin frontend and you lose most of the long-term value.
