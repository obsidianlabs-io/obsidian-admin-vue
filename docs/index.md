---
layout: home

hero:
  name: Obsidian Admin Vue
  text: Contract-driven Vue 3 admin baseline
  tagline: Production-ready Vue 3 admin frontend with generated API contracts, multi-tenant flows, runtime configuration, and release-grade quality gates.
  image:
    src: /favicon.svg
    alt: Obsidian Admin Vue
  actions:
    - theme: brand
      text: Quick Start
      link: /getting-started
    - theme: alt
      text: Public Preview
      link: https://obsidianlabs-io.github.io/obsidian-admin-vue/preview/
    - theme: alt
      text: Compatibility Matrix
      link: /compatibility-matrix

features:
  - title: Generated SDK first
    details: OpenAPI artifacts from Obsidian Admin Laravel drive typed frontend SDKs, contract snapshots, and CI drift checks.
  - title: Multi-tenant aware
    details: Tenant context, tenant switching, organization/team flows, and permission-aware route behavior are built into the baseline.
  - title: Release-grade quality gates
    details: Strict typecheck, lint, unit tests, Vue-layer tests, E2E coverage, and supply-chain workflows ship with the template.
  - title: Runtime configuration ready
    details: Theme, i18n, CRUD schema, and backend-driven page behavior are designed for long-lived admin products.
---

## Why this project exists

Most Vue admin templates optimize for quick demos. This project is optimized for long-lived back-office systems where API contracts, multi-tenant behavior, and release discipline matter more than first-run screenshots.

## Recommended stack

Use this frontend with [Obsidian Admin Laravel](https://github.com/obsidianlabs-io/obsidian-admin-laravel) if you want the full generated-SDK, contract-gated workflow.

## What to read next

- Start with [Getting Started](/getting-started)
- Use [Full-Stack Evaluation](/full-stack-evaluation) when you want the shortest path for preview-only, backend-only, or paired local evaluation
- Review [Backend Pairing](/backend-pairing), [Demo](/demo), and [Compatibility Matrix](/compatibility-matrix)
- Try the [Public Preview](https://obsidianlabs-io.github.io/obsidian-admin-vue/preview/) after GitHub Pages is enabled
- Use [Configuration](/configuration), [Deployment](/deployment), and [Auth Flows](/auth-flows) during setup
- Read the [Frontend Architecture](/architecture), [Multi-Tenancy](/multi-tenancy), and [Realtime](/realtime)
- Review [Generated SDK Workflow](/generated-sdk-workflow) and [API Layer Conventions](/api-layer-conventions) before adding new backend calls
- Use the [Release Final Checklist](/release-final-checklist) before publishing
