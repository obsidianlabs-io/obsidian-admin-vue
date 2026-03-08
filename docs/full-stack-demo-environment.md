# Full-Stack Demo Environment

Use this page when you want to evolve from the current static preview into a real hosted full-stack demo.

The repository already provides:

- a public static preview on GitHub Pages
- a built-in demo runtime for UI evaluation
- a full-stack pairing smoke against the real Laravel backend

This guide describes the next operational step: a public or evaluator-only full-stack demo environment.

## Goal

Provide a live environment where a visitor can:

- sign in against a real backend
- switch tenant scope
- load real lists for users, roles, tenants, organizations, teams, feature flags, and audit logs
- open real create and edit drawers
- observe contract-driven behavior backed by seeded Laravel data

## What the current preview does not provide

The public preview is intentionally not a real backend deployment.

It does not guarantee:

- real persistence
- real queue, websocket, or Redis behavior
- real auth token lifecycle
- true backend policy enforcement for destructive flows

That distinction must remain explicit until a real demo environment exists.

## Recommended Architecture

Use this split.

- frontend: static deployment of the production app bundle
- backend: deployed runtime image from the backend GHCR release
- database: managed MySQL or PostgreSQL
- cache / websocket / queue: managed Redis
- edge: one public ingress for frontend and API

Keep the frontend build pointed at the real backend API URL. Do not use the built-in demo runtime for the hosted full-stack demo.

## Access Model

Recommended first production-like demo model:

- one documented super demo account
- one documented tenant admin account
- optional read-mostly permissions for public traffic
- write-enabled flows limited to low-risk modules

If you need open public access, prefer read-mostly mode plus scheduled resets.

## Data Strategy

Use deterministic seeded data.

- stable tenant names
- stable role codes
- stable organization and team fixtures
- stable audit records that make preview smoke and docs examples believable

Avoid random or per-deploy data drift. It will make docs, screenshots, and smoke tests brittle.

## Safe Write Scope

Recommended first public write scope:

- language demo records
- organization demo records
- team demo records

Keep high-risk actions private or blocked in the public demo:

- destructive user deletion
- tenant deletion
- global role rewiring
- infrastructure-affecting theme or system toggles

## Reset Policy

A hosted demo must reset itself.

Recommended baseline:

- nightly database reset and reseed
- optional hourly cleanup of known writable demo rows
- clear docs note that the environment is reset automatically

This keeps the public environment predictable and prevents long-term data drift.

## Validation Before Rollout

Use all of these before promoting the demo URL.

- frontend quality gate
- frontend preview smoke
- frontend full-stack pairing smoke
- backend runtime smoke
- backend release image scan
- backend health endpoints

The full-stack demo should only be promoted after the existing pairing smoke is green against the same backend version.

## Suggested Rollout

### Phase 1

- keep the current public static preview
- keep the real backend private for maintainers and evaluators

### Phase 2

- launch a private full-stack evaluator environment
- document demo credentials and reset schedule
- gather the smallest stable set of writable flows

### Phase 3

- publish a public full-stack demo URL
- keep destructive flows restricted
- publish a short note that the environment resets automatically

This sequence is safer than trying to expose a writable public admin stack immediately.
