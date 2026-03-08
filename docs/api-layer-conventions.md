# API Layer Conventions

## Goal

The API layer exists to keep business code away from transport details.

The app-facing contract should be:

1. generated SDK from backend OpenAPI
2. generated adapter / caller normalization
3. domain facades in `src/service/api/*`
4. usage from stores, composables, and views

## Canonical layers

### Generated SDK

Generated files live in:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/generated`

These are machine-owned files. Do not hand-edit them.

### Generated adapter

Normalization happens in:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/generated-adapter.ts`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/generated-caller.ts`

This layer exists so generated SDK usage can fit the existing flat request flow without leaking generated-client details into business code.

### Domain facades

Application code should call:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/auth.ts`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/user.ts`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/role.ts`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/tenant.ts`
- and other files under `src/service/api/*`

These files are the stable app-facing API layer.

## Forbidden patterns

Business code must not:

- import the request entrypoint directly
- import generated SDK files directly
- create new ad-hoc REST calls inside views, stores, or composables

These rules are enforced by:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/scripts/api-architecture-check.mjs`

## Allowed exception

The current intentional exception is:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/route.ts`

This file targets template-local route data rather than the Laravel backend contract.

## Contract workflow

When backend OpenAPI changes:

```bash
pnpm api:types
pnpm openapi:client:official
pnpm typecheck:api
```

For release-grade validation:

```bash
pnpm check:ci
```

## Form behavior rule

If an API-backed form submits to the backend, it should use the shared server-validation path:

- request config `handleValidationErrorLocally: true`
- `useNaiveForm()`
- `applyServerValidation(error)` when the submit request fails with field errors

## Design rule

Facades may adapt backend responses for the frontend, but they should not become a second backend.

Keep them thin:

- select the generated operation
- pass normalized options
- return stable app-facing data
- avoid embedding page-only business logic

If a facade starts carrying page-specific rules, move that logic back into a composable or store.
