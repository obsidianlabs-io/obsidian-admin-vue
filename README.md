<div align="center">
	<img src="./public/favicon.svg" width="160" />
	<h1>Obsidian Admin Vue</h1>
	<span>English | <a href="./README.zh_CN.md">中文</a></span>
</div>

---

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D20.19.0-3c873a.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10.5.0-f69220.svg)](https://pnpm.io/)

## Project Positioning

> [!NOTE]
> `Obsidian Admin Vue` is a Vue 3 admin frontend baseline for enterprise back-office systems and SaaS platforms. It is deeply rebuilt on top of [SoybeanAdmin](https://github.com/soybeanjs/soybean-admin), preserving its mature UI and layout foundation while redefining the frontend architecture around multi-tenancy, contract-driven APIs, runtime configuration, and long-term maintainability.

If you need an admin frontend that can evolve with a serious backend contract, rather than a demo-first template, this project is built for that use case.

## Why Use It

- **Contract-driven collaboration**: generates SDKs and typings from backend OpenAPI and contract snapshots to reduce frontend/backend drift.
- **Multi-tenant admin behavior**: supports tenant context, tenant switching, tenant-isolated views, and permission-aware routing.
- **Runtime-configuration friendly**: designed for runtime theme, i18n, and schema/config-driven page behavior.
- **Complete engineering gates**: includes lint, typecheck, contract gates, unit tests, conditional E2E, and supply-chain checks.
- **Maintainable at scale**: relies on composables, schema-driven patterns, and generation scripts to reduce repeated page-level boilerplate.

## Core Capabilities

### Foundation

- `Vue 3`, `Vite 8`, `TypeScript`, `Pinia`, `UnoCSS`
- `pnpm workspace / monorepo` structure
- strict TypeScript and ESLint conventions
- automated file routing and permission routing
- responsive layout, theme system, and i18n support

### Obsidian Enhancements

- official SDK generation with `@hey-api/openapi-ts`
- frontend/backend contract snapshot and compatibility gates
- multi-tenant tenant context and header switching
- linked `Organization / Team / User / Role / Permission` management flows
- real-time integration with `Laravel Echo / Pusher`
- schema-driven CRUD capabilities
- runtime theme and language configuration collaboration

### Engineering Quality

- `pnpm check`
- `pnpm typecheck:api`
- `pnpm test:unit`
- `pnpm test:e2e`
- GitHub Actions: `Frontend Quality Gate` / `Frontend Contract Gate` / `Frontend Supply Chain`
- CycloneDX SBOM artifact + attestation for release-grade dependency inventory

## Use Cases

- enterprise admin platforms
- SaaS control panels
- internal operations systems
- frontend projects that depend on backend OpenAPI and DTO contracts
- long-lived Vue admin applications

## Quick Start

### Requirements

- `git`
- `Node.js >= 20.19.0`
- `pnpm >= 10.5.0`

## Key Docs

- Compatibility matrix: [`docs/compatibility-matrix.md`](./docs/compatibility-matrix.md)
- Support policy: [`docs/support-policy.md`](./docs/support-policy.md)
- Frontend architecture: [`docs/architecture.md`](./docs/architecture.md)
- Full-stack evaluation: [`docs/full-stack-evaluation.md`](./docs/full-stack-evaluation.md)
- Public preview guide: [`docs/demo.md`](./docs/demo.md)
- Release artifacts: [`docs/release-artifacts.md`](./docs/release-artifacts.md)
- Release sign-off checklist: [`docs/release-final-checklist.md`](./docs/release-final-checklist.md)
- API contract snapshot: [`docs/api-client-contract.snapshot`](./docs/api-client-contract.snapshot)

## Public Docs

- Docs URL: [https://obsidianlabs-io.github.io/obsidian-admin-vue/](https://obsidianlabs-io.github.io/obsidian-admin-vue/)

## Public Preview

- Preview URL: [https://obsidianlabs-io.github.io/obsidian-admin-vue/preview/](https://obsidianlabs-io.github.io/obsidian-admin-vue/preview/)

> The preview is published through GitHub Pages. If Pages has not been enabled for the repository yet, this URL will return `404` until the first Pages deployment finishes.

### Clone

```bash
git clone https://github.com/obsidianlabs-io/obsidian-admin-vue.git
cd obsidian-admin-vue
```

### Install

```bash
pnpm install
```

> This repository uses `pnpm workspace`. Avoid `npm` or `yarn` for dependency installation.

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Release Artifacts

Stable release tags now publish downloadable frontend artifacts on the GitHub Release page:

- production app bundle
- demo preview bundle
- Pages bundle (`docs + /preview/`)

Supply-chain outputs are published separately through GitHub Actions:

- `frontend-sbom-cyclonedx`
- frontend SBOM attestation
- frontend dist attestation

These are intended for evaluation, static preview hosting, and release verification. This repository remains an application template, not an npm-distributed UI package.

## Recommended Developer Workflow

### Local Quality Checks

```bash
# Generate and verify i18n typings
pnpm i18n:types:check

# Unified local quality entrypoint
pnpm check

# CI-parity local checks
pnpm check:ci

# Auto-format supported files
pnpm format
```

### API Contract Workflow

```bash
# Validate frontend API contract snapshot
pnpm contract:check

# Regenerate frontend API contract snapshot
pnpm contract:write

# Validate compatibility with the Laravel backend snapshot
pnpm contract:backend

# Generate frontend typings and official Axios SDK from Laravel backend artifacts
pnpm api:types

# Remote-first API generation
pnpm generate-api

# Generate official openapi-ts Axios SDK only
pnpm openapi:client:official

# Generate and verify committed API typings
pnpm typecheck:api
```

Strict contract gating lives in:

- `.github/workflows/contract-gate.yml`

Current rules:

- `BACKEND_REPO` is optional and defaults to `obsidianlabs-io/obsidian-admin-laravel`
- `BACKEND_REPO_TOKEN` is only needed when the backend repository is private
- missing `docs/api-contract.snapshot` in the backend checkout fails the workflow

## Recommended Companion Backend

For the full contract-driven workflow, pair this frontend with:

- [Obsidian Admin Laravel](https://github.com/obsidianlabs-io/obsidian-admin-laravel)

## Acknowledgements

Obsidian Admin Vue continues to build on the strong foundation of **[SoybeanAdmin](https://github.com/soybeanjs/soybean-admin)**.

Its UI components, layout system, and UnoCSS baseline provided the upstream foundation that made this project possible. If this project is useful to you, consider starring the original SoybeanAdmin repository as well.

## License

Released under the [MIT License](./LICENSE).

_Copyright © 2026 Obsidian Labs & SoybeanJS Contributors._
