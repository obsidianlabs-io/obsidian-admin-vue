<div align="center">
	<img src="./public/favicon.svg" width="160" />
	<h1>Obsidian Admin Vue</h1>
  <span><a href="./README.md">中文</a> | English</span>
</div>

---

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

## Introduction

> [!NOTE]
> This project (`Obsidian Admin Vue`) is a deeply customized, **enterprise-grade modular monolith frontend**, derived from the open-source [SoybeanAdmin](https://github.com/soybeanjs/soybean-admin). While retaining its exceptional core UI features, layout orchestration, and UnoCSS configuration, the architecture has been rewritten to natively support the Obsidian ecosystem's exact Multi-Tenancy rules, RBAC, and strict Type-Safe Laravel 12 API Contracts.

## The Vision

Obsidian was founded by **Boss · Beyond · Black** — three distinct forces united by one vision.

**Boss** embodied leadership and structure.
**Beyond** represented innovation and the courage to challenge limits.
**Black** stood for depth, precision, and strategic clarity.

Though our journeys unfold apart, the foundation we forged remains eternal.

Obsidian continues to evolve — rooted in resilience and order, marching steadfast toward enduring value.


## Features

### Foundation Capabilities

- **Modern tech stack**: built with `Vue 3`, `Vite 7`, `TypeScript`, `Pinia`, and `UnoCSS`.
- **Clear project architecture**: organized as a `pnpm workspace / monorepo` for long-term maintainability and extension.
- **Strict code standards**: follows the [SoybeanJS specification](https://docs.soybeanjs.cn/standard), with `ESLint`, `Prettier`, and `simple-git-hooks` integrated.
- **Strict TypeScript**: supports strict type checking for safer refactoring and better maintainability.
- **Rich theme configuration**: built-in theme options deeply integrated with `UnoCSS`.
- **Built-in i18n solution**: easy multi-language support.
- **Automated file routing system**: automatically generates route imports, declarations, and types. See [Elegant Router](https://github.com/soybeanjs/elegant-router) for details.
- **Flexible permission routing**: supports both frontend static routes and backend dynamic routes.
- **Rich page components**: includes multiple pages and components, such as `403`, `404`, `500`, layout components, tabs/tag components, and theme configuration components.
- **Command-line tooling**: built-in tools for common workflows such as git commit, file cleanup, and release tasks.
- **Mobile adaptation**: responsive layout support for mobile devices.

### Obsidian Enhancements (Core Differentiators)

- **End-to-end type safety**: SDK generation via `@hey-api/openapi-ts` improves frontend/backend type consistency.
- **Frontend/backend contract gates**: built-in `Contract Gate` and `Compatibility Gate` checks reduce the risk of breaking API schema changes.
- **SaaS multi-tenant support**: tenant context, tenant header switching, tenant-scoped access control, and view isolation.
- **Real-time updates**: powered by `Laravel Echo / Pusher`.
- **Schema-driven UI capabilities**: dynamic forms and tables for configurable CRUD interfaces.
- **Enhanced route access control**: combined role / permission / tenant-scope checks.
- **Runtime configuration collaboration**: supports runtime theme and i18n configuration, designed to work with backend config services.
- **Contract-driven workflow**: recommended to be used together with `Obsidian Admin Laravel` for a complete contract-driven development experience.

### Engineering Quality & Delivery

- **Type and static quality gates**: `vue-tsc`, `ESLint`
- **Testing capabilities**: unit tests (Node test runner + `tsx`) and E2E testing (Playwright)
- **Supply-chain security checks**: `pnpm audit`, Dependency Review
- **CI workflows**: GitHub Actions (`Lint` / `Contract Gate` (including `Compatibility Gate`) / `Supply Chain`)


## Usage

**Environment Preparation**

Make sure your environment meets the following requirements:

- **git**: you need git to clone and manage project versions.
- **NodeJS**: >=20.19.0, recommended 20.19.0 or higher.
- **pnpm**: >= 10.5.0, recommended 10.5.0 or higher.

**Clone Project**

```bash
git clone https://github.com/obsidianlabs-io/obsidian-admin-vue.git
```

**Install Dependencies**

```bash
pnpm i
```
> Since this project uses the pnpm monorepo management method, please do not use npm or yarn to install dependencies.

**Start Project**

```bash
pnpm dev
```

**Build Project**

```bash
pnpm build
```

**API Contract Checks (Recommended)**

```bash
# Ensure frontend API contract snapshot matches current code
pnpm contract:check

# Regenerate frontend API contract snapshot
pnpm contract:write

# Validate compatibility with the Laravel backend snapshot (Compatibility Gate; requires ../obsidian-admin-laravel/docs/api-contract.snapshot)
pnpm contract:backend

# Generate frontend API typings and official Axios SDK from backend (OpenAPI + contract snapshot + DTO + Resource)
pnpm api:types

# One-command remote-first generation (tries http://localhost:8080/docs/api.json, falls back to local OpenAPI file)
npm run generate-api

# Generate official openapi-ts Axios SDK only (output: src/service/api/generated)
pnpm openapi:client:official

# Generate and verify typings are committed (recommended for CI)
pnpm typecheck:api

# Frontend unit tests (Node test runner + tsx)
pnpm test:unit
```

Strict CI contract gate (`.github/workflows/contract-gate.yml`, including `Contract Gate` and `Compatibility Gate`) requires:

- Repository secret: `BACKEND_REPO_TOKEN` (required for private backend repos; optional for public backend repos)
- Repository variable: `BACKEND_REPO` (optional, defaults to `obsidianlabs-io/obsidian-admin-laravel`)
- Missing `docs/api-contract.snapshot` in the backend checkout fails the workflow (no skip path)


## Acknowledgements

Obsidian Admin Vue is deeply grateful to the open-source community, standing on the shoulders of the incredible **[SoybeanAdmin](https://github.com/soybeanjs/soybean-admin)**. 

Our front-end aesthetics, elegant UI components, layout orchestration, and UnoCSS baseline would not have been possible without the meticulous engineering of the original SoybeanJS authors. 
If you find the interface and layout systems of Obsidian Admin Vue beautiful, we highly recommend you also star the original [SoybeanAdmin repository](https://github.com/soybeanjs/soybean-admin) to support their fantastic upstream work!

## License

This project is released under the [MIT License](./LICENSE).

*Copyright © 2026 Obsidian Labs & SoybeanJS Contributors.*
