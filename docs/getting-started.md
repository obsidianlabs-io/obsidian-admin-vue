# Getting Started

## Requirements

- `Node.js >= 20.19.0`
- `pnpm >= 10.5.0`
- `git`

## Install

```bash
pnpm install
```

## Local development

```bash
pnpm dev
```

## Production build

```bash
pnpm build
```

## Docs site

```bash
pnpm docs:dev
pnpm docs:build
pnpm docs:preview
```

## Recommended local quality flow

```bash
pnpm check
pnpm typecheck:api
pnpm check:ci
```

## Contract-driven workflow

```bash
pnpm contract:check
pnpm contract:backend
pnpm api:types
pnpm typecheck:api
```

## Companion backend

For the full contract-driven workflow, use:

- [Obsidian Admin Laravel](https://github.com/obsidianlabs-io/obsidian-admin-laravel)
