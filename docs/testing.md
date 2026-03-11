# Testing

## Testing strategy

This repository uses multiple layers of verification because different failures surface at different levels.

## 1. Contract and architecture gates

Use these first:

```bash
pnpm contract:check
pnpm contract:backend
pnpm typecheck:api
pnpm api:architecture:check
```

These catch:

- frontend/backend contract drift
- generated SDK drift
- forbidden direct API-client usage in business code

## 2. Standard local quality gate

```bash
pnpm check
```

This covers:

- i18n typing sync
- TypeScript
- ESLint
- formatting gate
- contract checks
- API architecture guard

## 3. Release-grade gate

```bash
pnpm check:ci
```

This adds:

- strict TypeScript
- unit tests
- Vue-layer tests
- production build

## 4. Node unit tests

```bash
pnpm test:unit
```

Use this for:

- pure helpers
- generated adapter behavior
- route/auth helper logic
- validation adapter logic

## 5. Vue-layer tests

```bash
pnpm test:vue
```

Use this for:

- composables
- form and drawer interaction flows
- component-level submit and validation behavior

## 6. E2E tests

```bash
pnpm test:e2e
```

These cover golden paths such as:

- login
- register / reset-password flows
- core CRUD behavior
- audit-policy path validation

## 7. Full-stack pairing smoke

```bash
pnpm test:fullstack
```

Use this when you want the real frontend running against a seeded Laravel backend instead of the built-in mock runtime.

It covers:

- login against the real backend
- super-admin tenant switching
- user page access against seeded RBAC data
- drawer and role-option loading over the real API

## 8. Docs site verification

```bash
pnpm docs:build
```

This should stay green whenever docs, VitePress config, or docs workflow files change.

## 9. Preview accessibility and visual baseline

```bash
pnpm test:ui-baseline
```

Use this when you change:

- login or preview bootstrap UI
- high-value list pages
- drawers and modals
- theme tokens or layout chrome that affect the public preview

The baseline intentionally targets the static preview runtime so that:

- accessibility checks stay deterministic
- screenshot comparisons do not depend on a live backend
- docs-site CI verifies the same public bundle that GitHub Pages serves

## Recommended workflow by change type

### If you changed docs only

```bash
pnpm lint:check
pnpm docs:build
```

### If you changed API facades or generated contracts

```bash
pnpm typecheck:api
pnpm check:ci
```

### If you changed pages, drawers, forms, composables, or login/auth flows

```bash
pnpm check:ci
pnpm test:e2e
pnpm test:fullstack
pnpm test:ui-baseline
```

### If you changed release or repository workflows

Run at least:

```bash
pnpm format:check
pnpm check:ci
pnpm docs:build
```

## Rule of thumb

Do not treat `pnpm build` as enough.

This project is contract-driven. The minimum trustworthy gate for real code changes is usually:

```bash
pnpm typecheck:api
pnpm check:ci
```

## Lighthouse baseline and gate

Use the public Pages bundle as the Lighthouse target.

```bash
VITEPRESS_BASE=/obsidian-admin-vue/ pnpm docs:build
VITE_BASE_URL=/obsidian-admin-vue/preview/ pnpm build:demo
pnpm pages:bundle
pnpm test:lighthouse
```

The docs-site workflow uploads the generated filesystem report as `frontend-lighthouse-report`.
Representative scores are computed from the median of three runs per URL to reduce shared-runner noise.

Current gate policy:

- hard gate:
  - docs root accessibility `>= 0.95`
  - docs root best-practices `>= 0.95`
  - preview accessibility `>= 0.90`
  - preview best-practices `>= 0.95`
- ratchet warning:
  - docs root performance floor `>= 0.70`
  - docs root performance target `>= 0.90`
  - preview performance target `>= 0.70`

This keeps Lighthouse useful without turning mobile-throttled CI runs into flaky noise:

- docs root performance remains tracked, but shared-runner variance no longer blocks otherwise healthy releases
- docs root `0.90` remains the aspirational target
- preview performance stays warning-only until the preview runtime is optimized further
