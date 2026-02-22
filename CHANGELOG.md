# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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
