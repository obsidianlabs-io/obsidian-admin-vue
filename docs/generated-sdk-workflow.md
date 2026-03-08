# Generated SDK Workflow

## Goal

This frontend is contract-driven.

The generated SDK is not an optional convenience layer. It is the canonical transport contract between this repository and the paired Laravel backend.

## Source of truth chain

The intended chain is:

1. backend OpenAPI document
2. generated frontend typings
3. generated frontend SDK
4. app-facing API facades in `src/service/api/*`
5. usage from stores, composables, and views

Canonical files:

- `/Users/zero/Documents/Project/WK/obsidian-admin-laravel/docs/openapi.yaml`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/generated`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/generated-adapter.ts`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/generated-caller.ts`

## Commands

Regenerate frontend contract artifacts with:

```bash
pnpm api:types
pnpm openapi:client:official
pnpm typecheck:api
```

For release-grade verification:

```bash
pnpm check:ci
```

## What is generated

This repository generates:

- backend contract typings
- backend DTO/resource typings
- official SDK client code from `@hey-api/openapi-ts`

Generated outputs include:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/typings/api/openapi-generated.d.ts`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/typings/api/backend-generated.d.ts`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/generated`

These files are machine-owned and should not be hand-edited.

## Facade rule

Business code should not import the generated SDK directly.

Instead, route usage through:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/*`

Those facades are the stable app-facing API layer. They adapt generated operations into frontend-friendly behavior without leaking transport details into stores, composables, or views.

## Architecture gate

The repository already enforces the main rule:

- business code must not import the request entrypoint directly
- business code must not import generated SDK files directly

Gate:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/scripts/api-architecture-check.mjs`

## When to regenerate

Regenerate whenever:

- backend OpenAPI changes
- backend DTO/resource shapes change in ways that affect generated typings
- a new backend endpoint should become part of the canonical frontend contract

Do not delay regeneration until release day. Generated drift should be fixed as part of the same change set.
