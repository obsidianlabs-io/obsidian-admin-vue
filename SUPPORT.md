# Support

This document explains how to get help for `obsidian-admin-vue`.

## Scope

This repository is maintained as an open-source admin frontend baseline.

Support is best-effort for:

- installation and local setup issues
- generated API contract workflow issues
- reproducible bugs in the current `main` branch
- documentation gaps

Support is not intended for:

- private consulting
- project-specific custom feature implementation
- legacy forks that have diverged heavily from `main`
- urgent production incident response

## Before Opening An Issue

Please confirm all of the following first:

1. You are testing against the latest `main` branch or the latest release tag.
2. You have read `README.md`.
3. You have checked `CONTRIBUTING.md`.
4. You ran the local quality gates:

```bash
pnpm check
pnpm typecheck:api
pnpm test:unit
pnpm build
```

5. If your issue is contract-related, confirm generated files are in sync:

```bash
pnpm api:types
```

## Support Channels

- Bug reports:
  [GitHub Issues](https://github.com/obsidianlabs-io/obsidian-admin-vue/issues)
- Security reports:
  See `SECURITY.md`
- Contribution process:
  See `CONTRIBUTING.md`

## How To Ask For Help Well

Include:

- exact command you ran
- full error output
- Node.js version
- pnpm version
- browser/runtime context if relevant
- whether the backend repo is public, private, local, or symlinked
- whether generated files were modified

If the problem involves API contract generation, also include:

- current frontend commit
- backend commit or tag
- whether `docs/openapi.yaml` changed

## Response Expectations

For public issue support:

- triage is best-effort
- reproducible bugs get priority
- incomplete reports may be closed until more details are provided

If you need guaranteed timelines, do not treat GitHub Issues as an SLA-backed support channel.
