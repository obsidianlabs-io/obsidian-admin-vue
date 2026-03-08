<div align="center">
	<img src="./public/favicon.svg" width="160" />
	<h1>Obsidian Admin Vue</h1>
	<span><a href="./README.md">English</a> | 中文</span>
</div>

---

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D20.19.0-3c873a.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10.5.0-f69220.svg)](https://pnpm.io/)

## 项目定位

> [!NOTE]
> `Obsidian Admin Vue` 是一个面向企业后台系统与 SaaS 平台的 Vue 3 管理前端基线。它基于 [SoybeanAdmin](https://github.com/soybeanjs/soybean-admin) 深度重构，保留其成熟的界面与布局体系，同时围绕 Obsidian 的多租户、契约驱动 API、运行时配置和长期维护需求，重建了更严格的前端工程边界。

如果你需要的是一个能长期演进、能和严格后端契约协同工作的管理后台前端，而不是只适合演示的模板，这个项目就是为此准备的。

## 为什么使用它

- **契约驱动协作**: 基于 `@hey-api/openapi-ts` 和后端契约快照生成类型与 SDK，降低前后端漂移风险。
- **多租户后台能力**: 原生支持租户上下文、租户切换、租户隔离视图与权限联动。
- **运行时配置友好**: 支持运行时主题、国际化与配置化页面，适合与后端配置中心协同。
- **工程门禁完整**: 集成 lint、typecheck、contract gate、unit test、conditional E2E 和 supply-chain 检查。
- **适合长期维护**: 通过 composable、schema、生成脚本和模块化结构降低页面增长后的维护成本。

## 核心能力

### 基础框架

- `Vue 3`、`Vite 7`、`TypeScript`、`Pinia`、`UnoCSS`
- `pnpm workspace / monorepo` 结构
- 严格 TypeScript 与 ESLint 规范
- 自动化文件路由与权限路由体系
- 响应式布局、主题系统、多语言支持

### Obsidian 增强能力

- 基于 `@hey-api/openapi-ts` 的官方 SDK 生成
- 前后端契约快照与兼容性门禁
- 多租户租户上下文与 Header 切换
- `Organization / Team / User / Role / Permission` 联动管理
- `Laravel Echo / Pusher` 实时消息集成
- Schema 驱动的 CRUD 页面能力
- 运行时主题与语言配置协作

### 工程质量

- `pnpm check`
- `pnpm typecheck:api`
- `pnpm test:unit`
- `pnpm test:e2e`
- GitHub Actions: `Frontend Quality Gate` / `Frontend Contract Gate` / `Frontend Supply Chain`

## 适用场景

- 企业级管理后台
- SaaS 控制台
- 内部运营系统
- 强依赖后端 OpenAPI / DTO 契约的前端项目
- 需要长期演进的 Vue 单体前端

## 快速开始

### 环境要求

- `git`
- `Node.js >= 20.19.0`
- `pnpm >= 10.5.0`

## 关键文档

- 版本兼容矩阵：[`docs/compatibility-matrix.md`](./docs/compatibility-matrix.md)
- 前端架构说明：[`docs/architecture.md`](./docs/architecture.md)
- 发布签发清单：[`docs/release-final-checklist.md`](./docs/release-final-checklist.md)
- API 契约快照：[`docs/api-client-contract.snapshot`](./docs/api-client-contract.snapshot)

### 克隆项目

```bash
git clone https://github.com/obsidianlabs-io/obsidian-admin-vue.git
cd obsidian-admin-vue
```

### 安装依赖

```bash
pnpm install
```

> 项目使用 `pnpm workspace` 管理依赖，不建议使用 `npm` 或 `yarn`。

### 本地开发

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

## 推荐开发流程

### 本地质量检查

```bash
# 生成并校验 i18n 类型
pnpm i18n:types:check

# 本地统一检查入口
pnpm check

# CI 对齐检查
pnpm check:ci

# 自动格式化
pnpm format
```

### API 契约流程

```bash
# 校验前端 API 契约快照
pnpm contract:check

# 更新前端 API 契约快照
pnpm contract:write

# 与 Laravel 后端契约快照做兼容性比对
pnpm contract:backend

# 从 Laravel 后端生成前端类型与官方 Axios SDK
pnpm api:types

# 远程优先生成 API 类型
pnpm generate-api

# 仅生成官方 openapi-ts Axios SDK
pnpm openapi:client:official

# 生成并校验 API 类型是否已提交
pnpm typecheck:api
```

严格契约门禁位于:

- `.github/workflows/contract-gate.yml`

当前规则:

- `BACKEND_REPO` 可选，默认 `obsidianlabs-io/obsidian-admin-laravel`
- `BACKEND_REPO_TOKEN` 仅在后端仓库为私有时需要
- 若后端缺少 `docs/api-contract.snapshot`，工作流会直接失败

## 推荐配套项目

若你希望获得完整的契约驱动开发体验，建议与以下后端配套使用:

- [Obsidian Admin Laravel](https://github.com/obsidianlabs-io/obsidian-admin-laravel)

## 致谢

Obsidian Admin Vue 基于 **[SoybeanAdmin](https://github.com/soybeanjs/soybean-admin)** 的优秀基础继续演进。

我们保留并受益于其成熟的 UI 组件体系、布局能力和 UnoCSS 工程基础。若你认可本项目，也建议为原始的 SoybeanAdmin 仓库点亮一颗 Star。

## 开源协议

本项目基于 [MIT License](./LICENSE) 发布。

_Copyright © 2026 Obsidian Labs & SoybeanJS Contributors._
