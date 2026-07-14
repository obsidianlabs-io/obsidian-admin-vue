# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.2] - 2026-07-15

### ✨ Added
- Added `feature-flag-page.spec.ts` and `audit-policy-page.spec.ts` component tests covering page mount, API calls, and error handling.
- Redesigned the tenant switcher as a Spotlight-style modal with improved UX, keyboard navigation, and visual hierarchy.

### 🔧 Changed
- Moved the built-in demo backend out of `src/` and behind runtime-only imports so production builds keep a clearer boundary from mock infrastructure.
- Extracted authentication side effects into a bootstrap layer and standardized CRUD drawer form logic through a shared operate-form composable.
- Removed the unused `packages/alova` workspace package and refreshed frontend dependency metadata for the release lane.
- Merged `@sa/uno-preset`, `@sa/utils`, and `@sa/hooks` packages into `src/` to eliminate over-fragmented monorepo workspace packages.
- Moved storage utilities and hooks into `src/utils/` and `src/hooks/common/` respectively, updating all import paths across the application.
- Added `skipLibCheck: true` to `tsconfig.json` to skip third-party `.d.ts` type checking and resolve node_modules type conflicts.
- Fixed `SearchParams` type in `feature-flag.d.ts` to avoid conflicting `current` property types between `Partial<ListFeatureFlagsDTO>` and `CommonSearchParams`.
- Synced generated backend type definitions (`backend-generated.d.ts`) to reflect backend v1.3.2 DTO removals across Auth, FeatureFlag, Language, Role, and User domains.
- Updated compatibility matrix to pair frontend `v1.2.2` with backend `v1.3.2`.

### 🐞 Fixed
- Fixed operate-drawer async submit tests by waiting for pending promise work before assertions.
- Fixed package-level ESLint `no-shadow` failures in the Axios and hook request factories.
- Fixed unhandled promise rejection in `audit-policy-page.spec.ts` by replacing `mockRejectedValue` with a resolved error-shape response.
- Marked CI-only flaky tenant switch preview test as `test.fixme` after consistent local passing (5/5) with both 1 and 2 workers.

## [1.2.1] - 2026-05-16

### ✨ Added
- Added a shared Naive UI provider access layer for programmatic dialog, message, notification, and loading-bar usage outside component setup boundaries.

### 🔧 Changed
- Aligned the generated auth client and auth facade with the backend kebab-case auth contract for `refresh-token` and `user-info`.
- Promoted the Laravel 13 backend lane to the coordinated stable release pair for frontend `v1.2.1` and backend `v1.3.1`.

### 🐞 Fixed
- Fixed request-layer error normalization and JSON response handling so frontend adapters behave consistently against the current Laravel backend responses.
- Fixed Naive UI form mocks and validation-related tests after upstream dependency updates.

## [1.2.0] - 2026-03-12

### ✨ Added
- Added a public docs site, public preview runtime, full-stack pairing smoke, visual baselines, accessibility baselines, and Lighthouse preview quality checks.
- Added release artifact publishing for production bundles, preview bundles, Pages bundles, SBOM artifacts, and release-pairing validation.
- Added developer scaffolding for new page modules and richer open-source governance, support policy, and launch/demo guidance.

### 🔧 Changed
- Migrated core and system API facades onto the generated SDK adapter flow and documented the API-layer contract model.
- Tightened frontend quality gates to zero-warning linting, strict typechecking, Vue component tests, preview smoke coverage, and release-grade docs/preview validation.
- Split preview runtime bootstrap, app shells, and demo backend domains to reduce coupling and improve preview/runtime maintainability.

### 🐞 Fixed
- Fixed preview/runtime navigation, generated typing drift, contract alignment, and multiple CI/release workflow consistency issues.
- Fixed form validation UX by standardizing server-side field error handling across high-value admin forms.
- Fixed Pages preview assembly and visual baseline instability across the public preview pipeline.

## [1.1.1] - 2026-03-07

### ✨ Added
- Added GitHub release metadata, repository setup checklist, and release notes documentation for open-source project operations.

### 🔧 Changed
- Refined the Chinese and English README homepage structure to better fit open-source repository visitors.
- Updated frontend package metadata (`description`, `keywords`) to better match the current project positioning.

### 🐞 Fixed
- Synced generated frontend backend typings with the latest `obsidian-admin-laravel` DTO surface.
- Excluded generated typing files from ESLint checks to remove persistent release-gate noise on generated artifacts.

## [1.1.0] - 2026-03-03

### ✨ Added
- Added tenant-scoped **Organization** and **Team** management pages, search panels, operation drawers, API clients, and typings.
- Added organization/team fields in user create/edit flows, including team-to-organization auto-constrain behavior.
- Added route/i18n/api registrations for the new organization/team modules.

### 🔧 Changed
- Updated role option API usage to support `manageableOnly` query behavior in user operation flows.
- Updated frontend API contract snapshot for new organization/team endpoints and auth session/role API shape changes.

### 🐞 Fixed
- Resolved frontend-backend contract drift detected by `pnpm contract:check`.
- Refined form and lint/type constraints around new user organization/team bindings.

## [1.0.0] - 2026-02-23

### 🎉 Initial Public Release (Obsidian Admin Vue)

Welcome to the first official release of **Obsidian Admin Vue**, an enterprise-grade administration template built on top of the excellent SoybeanAdmin foundation. This major release introduces a strict Model-Driven approach, deep integration with Laravel 12 backend APIs, and end-to-end type safety.

### ✨ Features
- **Frontend Architecture**: Built with Vue 3, Vite 7, TypeScript, Pinia, and UnoCSS.
- **End-to-End Type Safety**: Integrated `@hey-api/openapi-ts` to auto-generate fully typed Axios clients and TypeScript interfaces directly from the Backend's Scramble OpenAPI specifications. 
- **Strict Contract Constraints**: Included automated CI/CD pipeline (`contract-gate.yml`) to perform strict type validation between backend Swagger snapshots and frontend typings before allowing PR merges.
- **Multi-Tenant Support**: Native UI components and State Management designed specifically for isolated SaaS Tenancy operations, including tenant switchers in the global header.
- **RBAC & Page Rendering**: Client-side implementation of Role-Based Access Control and Dynamic Route matching linked directly to backend permissions.
- **Real-Time WebSockets**: Integrated `laravel-echo` and `pusher-js` to listen for global Domain Events (via RoadRunner / Reverb) such as live Feature Flag toggling and system broadcast updates.
- **Schema-Driven UI generation**: Base implementations for Dynamic CRUD lists and Forms powered by the Backend `CrudSchemaController`.
- **Database-Driven Localization**: Deep integration with `vue-i18n` to pull runtime translations securely from the API backend (with built-in Redis caching and Version hash checks) instead of hardcoding JSONs.
- **Developer Experience (DX)**: Developed robust `plop.js` CLI generators allowing developers to scaffold new Vue pages, register Router indices, mock translation entries, and assign new API SDK placeholders in 3 seconds.
- **Refined Aesthetics**: Dark Mode adjustments, Glassmorphism, tailored gradients, and a bespoke Obsidian Crystal brand SVG asset.

### 🧹 Deprecations / Removals
- Removed the legacy `mock` server (ApiFox) from the underlying Soybean template in favor of real, strictly-typed integration with `obsidian-admin-laravel` out of the box.

*This repository represents a monumental step forward in monolithic Vue/Laravel engineering.*
