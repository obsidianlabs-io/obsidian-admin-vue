# Release Final Checklist

This is the final release gate for `/Users/zero/Documents/Project/WK/obsidian-admin-vue`.

Use this checklist after implementation is complete and before tagging or publishing a GitHub Release.

## 1. Working Tree

- `git status --short` is empty
- `HEAD` is the intended release commit
- generated files are already committed, not only present locally

## 2. Release Content

- `package.json` version is correct
- `CHANGELOG.md` is updated
- `CHANGELOG.zh_CN.md` is updated
- the release note exists:
  - `/Users/zero/Documents/Project/WK/obsidian-admin-vue/docs/releases/vX.Y.Z.md`
- repository metadata still matches the current project positioning:
  - `/Users/zero/Documents/Project/WK/obsidian-admin-vue/docs/github/repository-metadata.md`

## 3. Frontend Quality Gates

All of these must pass on the release commit:

```bash
pnpm check
pnpm typecheck:api
pnpm test:unit
pnpm build
```

If login, table behavior, or contract-driven page flows changed, also run:

```bash
pnpm test:e2e
```

## 4. Contract Truth

Confirm the frontend still matches backend reality:

- generated API types are in sync
- contract snapshot is updated if API facade signatures changed
- placeholder auth modules are still documented truthfully
- no Laravel-only coupling leaked into shared frontend layers

## 5. GitHub Repository Settings

Confirm there is no drift in:

- About / Description / Topics
- branch protection on `main`
- required status checks
- Actions permissions
- backend repo variable / secret assumptions
- `CODEOWNERS`

Reference:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/docs/github/repository-setup-checklist.md`

## 6. Push Order

Always use this order:

1. push `main`
2. confirm remote checks are green
3. create annotated tag
4. push tag
5. publish GitHub Release

## 7. Tag Rules

- use annotated tags only
- tag must point to the code release commit
- do not tag a commit that still needs generated-file sync

## 8. GitHub Release

Before pressing publish:

- selected tag is correct
- release title matches repository metadata guidance
- release body comes from the prepared release note
- release version matches `package.json` and both changelogs

## 9. Post-Release Check

After publishing, confirm:

- tag exists remotely
- GitHub Release is visible
- `main` is still green
- contract gate is still green

## 10. Hard Stop Conditions

Do not release if any of these are true:

- working tree is dirty
- generated API files differ from current scripts output
- `pnpm typecheck:api` is red
- release note, changelog, and package version disagree
- auth/documentation truth is ahead of actual implementation
