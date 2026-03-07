# Release SOP

This document defines the release process for `/Users/zero/Documents/Project/WK/obsidian-admin-vue`.

目标是确保 frontend 每次 release 都和 backend 契约、生成类型、GitHub Release 文案保持一致。

## 1. Pre-Release Rules

发布前先确认以下原则:

- release tag 只指向代码发布提交
- generated API files 必须与当前 backend 契约同步
- `main` 必须是绿色状态
- working tree 必须干净

## 2. Prepare Release Content

在创建 tag 前，先完成这些内容:

- 更新 `/Users/zero/Documents/Project/WK/obsidian-admin-vue/package.json` 版本号
- 更新:
  `/Users/zero/Documents/Project/WK/obsidian-admin-vue/CHANGELOG.md`
- 更新:
  `/Users/zero/Documents/Project/WK/obsidian-admin-vue/CHANGELOG.zh_CN.md`
- 准备当前版本 release note:
  `/Users/zero/Documents/Project/WK/obsidian-admin-vue/docs/releases/vX.Y.Z.md`
- 如有需要，更新:
  `/Users/zero/Documents/Project/WK/obsidian-admin-vue/docs/github/repository-metadata.md`

## 3. Required Release Gates

在 frontend release 之前，必须确认以下命令全部通过:

```bash
pnpm check
pnpm typecheck:api
pnpm test:unit
pnpm build
```

说明:

- `pnpm typecheck:api` 是最关键的 release gate，因为它会校验生成类型是否已提交
- 如果这一步失败，不要跳过，先同步并提交 generated API files

## 4. Contract Synchronization Rule

当 backend 有以下变更时，frontend release 前必须重新同步:

- OpenAPI 变更
- DTO 变更
- Resource 变更
- API contract snapshot 变更

同步命令:

```bash
pnpm api:types
```

需要重点确认的文件:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/typings/api/openapi-generated.d.ts`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/typings/api/backend-generated.d.ts`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/generated`

## 5. Check Repository State

确认当前仓库状态:

```bash
git status --short
git log --oneline -3
git tag --list --sort=version:refname
```

标准:

- `git status --short` 必须为空
- 当前 `HEAD` 必须是要发布的提交

## 6. Push Main First

先推送 `main`，再打 release tag:

```bash
git push origin main
```

原因:

- 让 CI 先对远端 `main` 生效
- 避免 tag 指向一个远端还不存在的提交

## 7. Create Release Tag

创建 annotated tag:

```bash
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z
```

规则:

- 不要用 lightweight tag
- 如果当前 release 包含 contract-sync 修复，tag 必须落在同步后的提交上

## 8. Publish GitHub Release

在 GitHub 上创建 Release 时:

- Tag 选择: `vX.Y.Z`
- Title 使用:
  `/Users/zero/Documents/Project/WK/obsidian-admin-vue/docs/github/repository-metadata.md`
- Body 使用:
  `/Users/zero/Documents/Project/WK/obsidian-admin-vue/docs/releases/vX.Y.Z.md`

## 9. Update Repository Metadata

每次正式 release 前后，确认这些设置没有漂移:

- About
- Description
- Topics
- Branch protection
- Required status checks
- Actions permissions
- `BACKEND_REPO` / `BACKEND_REPO_TOKEN` 配置是否仍正确

参考:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/docs/github/repository-setup-checklist.md`

## 10. Post-Release Check

发布完成后，至少确认:

- `main` 和 tag 都已推送
- GitHub Release 已可见
- `Frontend Contract Gate` 没有因为 backend 契约拉取失败而报错
- 当前 release note、changelog、package version 一致

## 11. Quick Checklist

发布当天只看这一段也够用:

1. 更新 `package.json` 版本
2. 更新 `CHANGELOG.md` 和 `CHANGELOG.zh_CN.md`
3. 准备 `docs/releases/vX.Y.Z.md`
4. 跑 `pnpm check`
5. 跑 `pnpm typecheck:api`
6. 跑 `pnpm test:unit && pnpm build`
7. 确认工作区干净
8. 推 `main`
9. 打 tag 并推
10. 创建 GitHub Release

## 12. Final Sign-Off

For the last pre-release pass, use:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/docs/release-final-checklist.md`
