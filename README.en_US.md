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

- **Cutting-edge technology application**: using the latest popular technology stack such as Vue3, Vite7, TypeScript, Pinia and UnoCSS.
- **Clear project architecture**: using pnpm monorepo architecture, clear structure, elegant and easy to understand.
- **Strict code specifications**: follow the [SoybeanJS specification](https://docs.soybeanjs.cn/standard), integrate eslint, prettier and simple-git-hooks to ensure the code is standardized.
- **TypeScript**: support strict type checking to improve code maintainability.
- **Rich theme configuration**: built-in a variety of theme configurations, perfectly integrated with UnoCSS.
- **Built-in internationalization solution**: easily realize multi-language support.
- **Automated file routing system**: automatically generate route import, declaration and type. For more details, please refer to [Elegant Router](https://github.com/soybeanjs/elegant-router).
- **Flexible permission routing**: support both front-end static routing and back-end dynamic routing.
- **Rich page components**: built-in a variety of pages and components, including 403, 404, 500 pages, as well as layout components, tag components, theme configuration components, etc.
- **Command line tool**: built-in efficient command line tool, git commit, delete file, release, etc.
- **Mobile adaptation**: perfectly support mobile terminal to realize adaptive layout.



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

# Validate compatibility with Laravel backend snapshot (requires ../obsidian-admin-laravel/docs/api-contract.snapshot)
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

Strict CI contract gate (`.github/workflows/contract-gate.yml`) requires:

- Repository secret: `BACKEND_REPO_TOKEN` (required)
- Repository variable: `BACKEND_REPO` (optional, defaults to `obsidianlabs-io/obsidian-admin-laravel`)
- Missing `docs/api-contract.snapshot` in the backend checkout fails the workflow (no skip path)


## Acknowledgements

Obsidian Admin Vue is deeply grateful to the open-source community, standing on the shoulders of the incredible **[SoybeanAdmin](https://github.com/soybeanjs/soybean-admin)**. 

Our front-end aesthetics, elegant UI components, layout orchestration, and UnoCSS baseline would not have been possible without the meticulous engineering of the original SoybeanJS authors. 
If you find the interface and layout systems of Obsidian Admin Vue beautiful, we highly recommend you also star the original [SoybeanAdmin repository](https://github.com/soybeanjs/soybean-admin) to support their fantastic upstream work!

## License

This project is released under the [MIT License](./LICENSE).

*Copyright © 2026 Obsidian Labs & SoybeanJS Contributors.*
