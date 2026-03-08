# Release Artifacts

This page is the single entrypoint for the frontend release outputs that matter to downstream consumers.

Use it when you need to answer:

- what gets published on a frontend release tag
- which artifacts are downloadable application bundles
- which artifacts belong to supply-chain verification
- how to evaluate a release without rebuilding from source

## 1. GitHub Release

Every `v*` tag triggers the release workflow:

- a GitHub Release is created
- the body prefers `docs/releases/vX.Y.Z.md`
- if that file is missing, the workflow falls back to `CHANGELOG.md`

Recommended source of truth:

- curated release note: `docs/releases/vX.Y.Z.md`
- change log history: `CHANGELOG.md`

## 2. Downloadable Release Bundles

Stable frontend tags upload three downloadable bundles to the GitHub Release page:

- `obsidian-admin-vue-<version>-dist.tar.gz`
- `obsidian-admin-vue-<version>-demo-preview.tar.gz`
- `obsidian-admin-vue-<version>-pages-bundle.tar.gz`

These are application release bundles, not npm package artifacts.

### Production app bundle

Artifact:

- `obsidian-admin-vue-<version>-dist.tar.gz`

Use it when you want:

- the production SPA build output
- to host the app behind your own web server or object storage
- to review the immutable frontend build without rerunning CI

### Demo preview bundle

Artifact:

- `obsidian-admin-vue-<version>-demo-preview.tar.gz`

Use it when you want:

- the static preview runtime only
- a backend-free evaluation build
- a portable demo package for internal review

### Pages bundle

Artifact:

- `obsidian-admin-vue-<version>-pages-bundle.tar.gz`

Use it when you want:

- the exact GitHub Pages payload
- docs site + `/preview/` in one archive
- to mirror the published docs + preview package elsewhere

## 3. Public Docs and Preview

The repository also publishes public static entrypoints:

- Docs: `https://obsidianlabs-io.github.io/obsidian-admin-vue/`
- Preview: `https://obsidianlabs-io.github.io/obsidian-admin-vue/preview/`

Use these when you want a fast evaluation path before downloading release bundles.

## 4. SBOM

The frontend supply-chain workflow publishes a CycloneDX SBOM artifact:

- artifact name: `frontend-sbom-cyclonedx`

Use it when you need:

- runtime dependency inventory
- release compliance review
- downstream software composition tracking

## 5. Attestations

The repository publishes attestations for:

- frontend SBOM artifact provenance
- frontend dist build provenance

Use these to prove:

- the generated frontend bundle came from this repository workflow
- the SBOM belongs to the same supply-chain pipeline

## 6. Recommended Consumer Paths

Choose the artifact based on your goal.

### Runtime evaluation

Use:

- GitHub Pages docs + preview
- `docs/full-stack-evaluation.md`

Best for:

- first product evaluation
- stakeholder walkthroughs
- quick architecture review

### Self-hosted frontend bundle review

Use:

- `obsidian-admin-vue-<version>-dist.tar.gz`
- `docs/deployment.md`

Best for:

- reverse proxy deployment
- CDN/static host rollout
- immutable frontend promotion

### Demo-only sharing

Use:

- `obsidian-admin-vue-<version>-demo-preview.tar.gz`

Best for:

- internal review without backend dependencies
- product walkthroughs
- demo environment mirroring

### Release and provenance review

Use:

- GitHub Release
- `docs/releases/vX.Y.Z.md`
- `frontend-sbom-cyclonedx`
- supply-chain attestations

Best for:

- release sign-off
- compliance review
- audit trail collection

## 7. Post-Tag Verification

After pushing a release tag, verify:

1. the GitHub Release exists
2. the Release body matches `docs/releases/vX.Y.Z.md`
3. the GitHub Release contains:
   - production app bundle
   - demo preview bundle
   - Pages bundle
4. the `frontend-sbom-cyclonedx` artifact exists
5. the frontend SBOM attestation exists
6. the frontend dist attestation exists

## 8. Related Documents

- `docs/full-stack-evaluation.md`
- `docs/demo.md`
- `docs/deployment.md`
- `docs/release-sop.md`
- `docs/release-final-checklist.md`
- `docs/github/repository-setup-checklist.md`
