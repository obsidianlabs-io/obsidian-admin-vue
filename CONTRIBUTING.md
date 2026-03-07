# Contributing

Thanks for contributing to Obsidian Admin Vue.

This repository is intended to be a production-ready Vue 3 admin frontend baseline. Contributions should preserve strong type safety, generated-contract discipline, multi-tenant correctness, and backend-neutral frontend architecture.

## Before You Start

- Use Node `20.19+`
- Use pnpm `10.5+`
- Read `/Users/zero/Documents/Project/WK/obsidian-admin-vue/docs/architecture.md`
- Read `/Users/zero/Documents/Project/WK/obsidian-admin-vue/docs/release-sop.md` if your change affects release gates

## Local Setup

```bash
git clone https://github.com/obsidianlabs-io/obsidian-admin-vue.git
cd obsidian-admin-vue
pnpm install
pnpm dev
```

## Development Rules

- Keep the frontend contract-first
- Prefer generated API types over handwritten duplicate DTO interfaces
- Keep shared client abstractions backend-neutral; do not add Laravel-only coupling into generic frontend layers
- Prefer composables for reusable page logic
- Keep route, permission, tenant, and table behavior deterministic across page modules
- API-backed forms should use the shared server-validation path: `useNaiveForm()`, request config `handleValidationErrorLocally: true`, and `naiveForm.applyServerValidation(error)`
- Avoid editing generated API files by hand unless the workflow explicitly requires format-only normalization

## Generated Files Policy

The following files are generated artifacts and should normally be updated through scripts, not manual edits:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/typings/api/openapi-generated.d.ts`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/typings/api/backend-generated.d.ts`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/generated`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/typings/i18n-generated.d.ts`

If backend API contracts change, regenerate them with:

```bash
pnpm api:types
```

If i18n typings change, regenerate them with:

```bash
pnpm i18n:types
```

## Validation Checklist

Run the relevant frontend gates before opening a pull request.

### Minimum frontend gate

```bash
pnpm check
pnpm typecheck:api
pnpm test:unit
pnpm build
```

### E2E

If your change affects login, user management, table rendering, or contract-driven page behavior, also run:

```bash
pnpm test:e2e
```

## Pull Request Expectations

A good pull request should:

- have a narrow scope
- explain any API contract impact clearly
- note whether generated files changed intentionally
- include screenshots or recordings if UI behavior changed materially
- avoid mixing unrelated cleanup with functional changes

## What We Usually Reject

We are unlikely to accept pull requests that:

- hand-maintain generated API surfaces without updating the generation pipeline
- couple shared frontend abstractions tightly to a single backend framework
- weaken CI gates or type checks
- add visual churn without product or maintainability value
- introduce broad abstractions without proven reuse value

## Auth Module Truth

The current built-in auth pages are intentionally mixed in maturity:

- `pwd-login` is wired to the real backend login contract
- `code-login`, `register`, and `reset-pwd` are still template-level placeholder modules

Do not force those placeholder modules onto backend APIs unless the frontend field model and backend contract are aligned first.
