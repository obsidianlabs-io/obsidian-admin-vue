# Release Final Checklist

This is the last sign-off checklist for `obsidian-admin-vue`.

Use it after implementation is complete and before tagging or publishing a release.

## 1. Working Tree

- `git status --short` is empty
- `HEAD` is the intended release commit
- generated files are already committed, not only present locally

## 2. Release Content

- `package.json` version is correct
- `CHANGELOG.md` is updated
- `CHANGELOG.zh_CN.md` is updated
- the release note exists:
  - `docs/releases/vX.Y.Z.md`
- repository metadata still matches current positioning:
  - `docs/github/repository-metadata.md`

## 3. Required Frontend Gates

All of these must pass on the release commit:

```bash
pnpm check
pnpm typecheck:api
pnpm test:unit
pnpm test:vue
pnpm build
pnpm test:preview
```

- `Frontend Supply Chain` is green
- the `frontend-sbom-cyclonedx` artifact exists for the release commit
- the SBOM artifact has an attestation on the push workflow
- the frontend dist attestation exists on the push workflow
- the Pages preview smoke is green if demo/docs runtime changed

If login, table behavior, or contract-driven flows changed, also run:

```bash
pnpm test:e2e
```

## 4. Contract Truth

Confirm the frontend still matches backend reality:

- generated API types are in sync
- contract snapshot is updated if API facade signatures changed
- placeholder auth modules are documented truthfully
- no backend-specific coupling leaked into shared generic frontend layers

## 5. GitHub Settings

Confirm there is no drift in:

- About / Description / Topics
- branch protection on `main`
- required status checks
- Actions permissions
- backend repo variable / secret assumptions
- `CODEOWNERS`

Reference:

- `docs/github/repository-setup-checklist.md`

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

Before publishing:

- selected tag is correct
- release title matches repository metadata guidance
- release body comes from the prepared release note
- release version matches `package.json` and both changelogs
- `docs/releases/vX.Y.Z.md` exists if you want the release workflow to publish the exact curated note

## 9. Post-Release Check

After publishing, confirm:

- tag exists remotely
- GitHub Release is visible
- GitHub Release contains:
  - production app bundle
  - demo preview bundle
  - Pages bundle
- the `frontend-sbom-cyclonedx` artifact exists
- the frontend SBOM attestation exists
- the frontend dist attestation exists
- `main` is still green
- contract gate is still green

## 10. Hard Stop Conditions

Do not release if any of these are true:

- working tree is dirty
- generated API files differ from current script output
- `pnpm typecheck:api` is red
- release note, changelog, and package version disagree
- docs are ahead of actual implementation
