# Open Source Launch Checklist

Use this page when you want to confirm that the frontend and backend are ready to be presented together as a public open-source stack.

This checklist complements the frontend-only release checklist in `docs/release-final-checklist.md`.

## 1. Public Surface

Confirm the public-facing experience is coherent.

- frontend repository README matches current preview and docs behavior
- frontend docs site is publicly reachable
- frontend preview URL is publicly reachable
- backend repository README matches current runtime and release behavior
- backend docs site is publicly reachable

## 2. Required GitHub Settings

### Frontend

- `main` branch protection is enabled
- required checks include `Frontend Quality Gate / quality`
- required checks include `Frontend Contract Gate / contract-check`
- required checks include `Full-Stack Pairing / pairing-smoke`
- Pages source is `GitHub Actions`
- `CODEOWNERS` is active

### Backend

- `main` branch protection is enabled
- required checks include backend quality, test matrix, runtime smokes, and supply-chain workflows
- Pages source is `GitHub Actions`
- GHCR publish permissions are working
- `CODEOWNERS` is active

## 3. Frontend Release Artifacts

Confirm the release is actually consumable.

- `docs/releases/vX.Y.Z.md` exists
- GitHub Release note matches the tag
- production app bundle is attached
- demo preview bundle is attached
- Pages bundle is attached
- `frontend-sbom-cyclonedx` exists
- frontend SBOM attestation exists
- frontend dist attestation exists

## 4. Full-Stack Pairing Truth

Confirm the frontend still pairs with the current backend.

- compatibility matrix is updated in both repositories
- `pnpm typecheck:api` passes
- `pnpm test:fullstack` passes
- frontend preview smoke still passes
- backend OpenAPI examples still reflect real contract shapes for the high-value admin flows that drive generated SDK usage

## 5. Demo and Preview Truth

Confirm the public preview does not overclaim.

- preview clearly indicates that it uses the built-in demo runtime
- docs explain which paths are preview-only and which require a real backend
- placeholder or backend-specific flows are documented truthfully
- README does not imply that the static preview is a full public staging environment

## 6. Support Surface

Before promoting the project publicly, confirm the support layer is current.

- `CONTRIBUTING.md` is current
- `SECURITY.md` is current
- `SUPPORT.md` is current
- issue templates still match current maintainer expectations
- release docs still point to the right artifact names and workflow names

## 7. Launch Order

Use this order when promoting a new paired version.

1. push backend `main`
2. wait for backend CI, supply-chain, docs, and runtime smokes
3. push frontend `main`
4. wait for frontend quality, contract, preview, and full-stack pairing workflows
5. publish backend release
6. publish frontend release
7. confirm docs, preview, and release artifacts are all accessible before external announcement

## 8. Hard Stop Conditions

Do not promote the stack publicly if any of these are true.

- backend docs site is unavailable
- frontend docs site or preview is unavailable
- `pnpm test:fullstack` is red
- generated API files are out of sync
- release artifacts are missing from GitHub Release
- docs claim a public full-stack demo exists when only the static preview is available
