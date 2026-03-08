# Support Policy

This page defines the practical support expectations for `obsidian-admin-vue` as an open-source admin frontend baseline.

## Scope

This repository is maintained for:

- enterprise admin frontends
- contract-driven pairing with `obsidian-admin-laravel`
- generated SDK workflows
- multi-tenant back-office applications built on the documented architecture

This repository is not maintained as:

- a private consulting channel
- an SLA-backed production support desk
- a compatibility layer for legacy forks that have diverged from the published contract model
- a promise that every historical backend/frontend version pair will stay supported forever

## Supported Release Lanes

The source of truth for supported frontend/backend combinations is:

- [`Compatibility Matrix`](./compatibility-matrix.md)

Current policy:

- the documented stable release pair receives best-effort bug triage and security fixes
- `main` paired with `main` is the active development lane and may change without backward-compatibility guarantees
- prerelease tags, stale forks, and unsupported version pairs may be asked to upgrade before issues are triaged

## Support Window

Best-effort support is focused on:

- the latest documented stable release pair
- the current `main` branch when the issue is reproducible there

Older release tags may still receive guidance, but they should not be treated as an actively maintained support target unless they remain the current stable pair in the compatibility matrix.

## Security Fix Policy

Security issues should follow [`SECURITY.md`](https://github.com/obsidianlabs-io/obsidian-admin-vue/blob/main/SECURITY.md), not public issues.

For public releases:

- critical security fixes take priority over feature requests
- fixes are expected to land on the active support lane first
- backport decisions are case-by-case and depend on maintenance cost and risk

## Preview and Hosted Demo Policy

This project currently exposes two public consumption modes:

- GitHub Pages static preview
- hosted full-stack evaluator demo (when a live backend environment is provided)

These are evaluation environments, not a support SLA.

They do not guarantee:

- production-grade uptime
- persistent seeded data
- stable write behavior across demo resets
- backend-specific guarantees outside the documented compatibility pair

## What Maintainers Need From Reporters

Before opening an issue, reporters should:

1. confirm the problem on the latest stable pair or current `main`
2. include the exact frontend tag or commit
3. include the paired backend tag or commit when relevant
4. state the runtime path used:
   - local dev server
   - GitHub Pages preview
   - hosted full-stack demo
   - custom deployment
5. include the relevant gate output:
   - `pnpm check`
   - `pnpm typecheck:api`
   - `pnpm test:vue`
   - `pnpm test:preview`
   - `pnpm test:fullstack` when the issue involves a real backend

## Response Expectations

Maintainer response is best-effort.

In practice:

- reproducible bugs on active support lanes get priority
- security reports go through the private channel in `SECURITY.md`
- incomplete reports may be closed until more context is provided
- downstream product-specific customization requests are out of scope

## Rule of Thumb

If you need guaranteed timelines, operational support, or bespoke delivery, do not treat GitHub Issues as an SLA-backed support channel.
