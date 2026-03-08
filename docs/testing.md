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

## 7. Docs site verification

```bash
pnpm docs:build
```

This should stay green whenever docs, VitePress config, or docs workflow files change.

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

### If you changed pages, drawers, forms, or composables

```bash
pnpm check:ci
pnpm test:e2e
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
