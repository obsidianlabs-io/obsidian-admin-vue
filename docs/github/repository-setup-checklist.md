# GitHub Repository Setup Checklist

This checklist is for `obsidian-admin-vue`.

目标不是把 GitHub 选项全部打开，而是把这个前端仓库真正需要的设置一次配对，避免发布前遗漏。

## 1. Repository Profile

在 GitHub 仓库首页右侧点击 `About` -> `Edit repository details`:

- Description:
  `Obsidian Admin Vue is a production-ready Vue 3 admin frontend for enterprise back-office systems and SaaS platforms. It emphasizes generated API contracts, strict type safety, tenant-aware UI behavior, runtime configuration, and long-term maintainability.`
- About:
  `Production-ready Vue 3 admin frontend with Naive UI, Pinia, UnoCSS, generated API contracts, and multi-tenant integration.`
- Topics:
  `admin vue vue3 vite vite7 typescript pinia naive-ui unocss vue-admin admin-template openapi hey-api multi-tenant saas i18n laravel-echo pusher playwright`
- Website:
  留空即可，除非你后面有正式 demo 站或文档站。

来源文案:

- `docs/github/repository-metadata.md`

## 2. Default Branch

在 `Settings` -> `Branches`:

- Default branch:
  `main`

## 3. Branch Protection

在 `Settings` -> `Branches` -> `Add branch protection rule`:

- Branch name pattern:
  `main`
- Require a pull request before merging:
  开启
- Require approvals:
  建议至少 `1`
- Dismiss stale pull request approvals when new commits are pushed:
  开启
- Require review from code owners:
  开启
- Require status checks to pass before merging:
  开启
- Require branches to be up to date before merging:
  开启
- Require conversation resolution before merging:
  开启
- Do not allow bypassing the above settings:
  如果是正式团队仓库，建议开启
- Allow force pushes:
  关闭
- Allow deletions:
  关闭

## 4. Required Status Checks

建议至少勾选以下 checks:

- `Frontend Quality Gate / quality`
- `Frontend Contract Gate / contract-check`

说明:

- `Frontend Quality Gate / quality` 现在包含 `pnpm check`、`pnpm typecheck:strict`、`pnpm test:unit`、`pnpm test:vue`、`pnpm build`
- 它应作为前端主 PR 门禁
- `Frontend Docs Site` 现在会对 Pages artifact 内的 `/preview/` 运行 Playwright smoke，不只是构建成功

建议按需勾选:

- `Frontend Quality Gate / e2e`
- `Frontend Supply Chain / npm-audit`
- `Frontend Supply Chain / sbom`

不建议设为 required:

- `Frontend Supply Chain / dependency-review`
  因为它只在 `pull_request` 时运行，且更适合作为补充风险提示，而不是主门禁
- `Release / release`
  它只在 tag push 时执行，不属于 PR 合并门禁

对应 workflow:

- `.github/workflows/linter.yml`
- `.github/workflows/contract-gate.yml`
- `.github/workflows/supply-chain.yml`
- `.github/workflows/docs-site.yml`

## 4.5. CODEOWNERS

当前仓库已包含：

- `.github/CODEOWNERS`

当前使用维护邮箱作为默认 owner，这样语法有效、不会依赖一个尚未创建的 GitHub team。

如果后面你建立了正式团队，再把 owner 替换成：

- `@obsidianlabs-io/<team-name>`

## 5. Actions Permissions

在 `Settings` -> `Actions` -> `General`:

- Actions permissions:
  `Allow all actions and reusable workflows`
- Workflow permissions:
  `Read and write permissions`

原因:

- `release.yml` 需要使用 `GITHUB_TOKEN` 创建 Release
- `supply-chain.yml` 的 attestation 需要 workflow 权限完整可用
- `supply-chain.yml` 现在还会生成、上传并 attestate `frontend-sbom-cyclonedx` artifact

## 6. Repository Variables And Secrets

当前仓库会在 `Frontend Contract Gate` 里读取 backend 仓库契约。

当前建议:

- Repository variable `BACKEND_REPO`:
  可选，默认值已经写死为 `obsidianlabs-io/obsidian-admin-laravel`
- `BACKEND_REPO_TOKEN`:
  如果 backend 是 public repo，不需要
  如果 backend 改成 private repo，再补

说明:

- 当前 backend 是公开仓库，所以 `contract-gate.yml` 会自动走 public clone 分支

## 7. Security Settings

在 `Settings` -> `Security`:

- Dependency graph:
  开启
- Dependabot alerts:
  开启
- Dependabot security updates:
  开启
- Secret scanning:
  公共仓库建议开启
- Push protection:
  建议开启

## 8. Releases

推荐发布方式:

- tag 指向代码发布提交
- GitHub Release 正文使用:
  `docs/releases/v1.1.1.md`
- CHANGELOG 使用:
  `CHANGELOG.md`
- `release.yml` 会优先读取 `docs/releases/<tag>.md`，缺失时才回退到 `CHANGELOG.md`

当前状态:

- 建议为当前 `main` 创建 `v1.1.1` tag
- release workflow 会在 GitHub Release 中上传：
  - production app bundle
  - demo preview bundle
  - Pages bundle

## 8.5. GitHub Pages / Docs Site

当前仓库已包含：

- `.github/workflows/docs-site.yml`

建议在 `Settings -> Pages` 中确认：

- Source:
  `GitHub Actions`
- Custom domain:
  按需配置，没有正式域名就先留空

说明：

- docs site 使用 `VitePress`
- `pull_request` 会构建 docs site 和 `/preview/` demo bundle
- `push main` / `workflow_dispatch` 会发布到 GitHub Pages
- 发布后的 Pages artifact 包含：
  - docs site 根目录
  - `/preview/` 下的静态 demo runtime

## 9. Organization Profile

如果你要让组织主页显示说明，不应该改业务仓库，而应该在 organization 下创建专门的 `.github` 仓库:

- repo name:
  `.github`
- target file:
  `.github/profile/README.md`

可直接复制这个模板:

- `docs/github/profile/README.md`

## 10. Recommended Cleanup Choices

以下选项建议按“少而稳”原则处理:

- Discussions:
  如果你还没有计划维护社区讨论，先关闭
- Projects:
  如果不用 GitHub Projects，先关闭
- Wiki:
  如果文档都放在仓库里，先关闭
- Packages:
  如果当前不发布 npm package，先隐藏

## 11. Release-Day Quick Checklist

发布当天只检查这些:

- `main` 是绿色
- branch protection 已生效
- required checks 没有漏选
- `CHANGELOG.md` 已更新
- `docs/releases/<version>.md` 已准备好
- contract gate 是绿的
- GitHub Release 正文已贴入
- About / Topics / Description 已更新

## 12. Recommended Next Step

如果你要把这一套真正落地，建议顺序是:

1. 先填 `About / Description / Topics`
2. 再设置 `Branch protection`
3. 再勾 `Required status checks`
4. 再检查 `Actions permissions`
5. 最后创建 GitHub Release

内部发布流程文档:

- `docs/release-sop.md`
