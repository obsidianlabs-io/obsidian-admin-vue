<div align="center">
	<img src="./public/favicon.svg" width="160" />
	<h1>Obsidian Admin Vue</h1>
  <span>中文 | <a href="./README.en_US.md">English</a></span>
</div>

---

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

## 简介

> [!NOTE]
> 本项目（`Obsidian Admin Vue`）是基于开源项目 [SoybeanAdmin](https://github.com/soybeanjs/soybean-admin) 深度重构的企业级单体前端框架。我们保留了其极其优秀的 UI 组件库、布局编排和 UnoCSS 完美配置，并在其之上彻底重写了底层的数据交互架构，专门服务于 Obsidian 生态的 SaaS 多租户隔离、严苛的 RBAC 权限体系，以及基于后端 Laravel 12 的强制类型安全 (API Contracts)。

## 创始愿景

Obsidian 由 **Boss · Beyond · Black** 创立 —— 三股独特的力量因同一个愿景而凝聚在一起。

**Boss** 象征着卓越的领导力与严谨的体系架构。
**Beyond** 代表着无尽的创新与打破界限的勇气。
**Black** 意味着极致的深度、精准与战略性的清晰度。

尽管征途各自展开，我们共同铸就的基石恒久如初。

Obsidian 持续进化 —— 扎根韧性与秩序，坚定迈向长期价值。

## 特性

### 基础框架能力

- **前沿技术栈**：采用 `Vue 3`、`Vite 7`、`TypeScript`、`Pinia` 和 `UnoCSS` 等现代化技术栈。
- **清晰的项目架构**：采用 `pnpm workspace / monorepo` 架构，结构清晰，便于长期维护与扩展。
- **严格的代码规范**：遵循 [SoybeanJS 规范](https://docs.soybeanjs.cn/zh/standard)，集成 `ESLint`、`Prettier` 与 `simple-git-hooks`。
- **严格 TypeScript**：支持严格类型检查，提升代码可维护性与重构安全性。
- **丰富主题配置**：内置多样主题配置，与 `UnoCSS` 深度结合。
- **内置国际化方案**：轻松实现多语言支持。
- **自动化文件路由系统**：自动生成路由导入、声明和类型。更多细节请查看 [Elegant Router](https://github.com/soybeanjs/elegant-router)。
- **灵活的权限路由**：同时支持前端静态路由和后端动态路由。
- **丰富的页面组件**：内置多样页面与组件，包括 `403`、`404`、`500` 页面，以及布局组件、标签组件、主题配置组件等。
- **命令行工具**：内置高效命令行工具，支持 git 提交、删除文件、发布等操作。
- **移动端适配**：支持响应式布局与移动端显示。

### Obsidian 增强能力（核心差异化）

- **端到端类型安全**：基于 `@hey-api/openapi-ts` 生成 SDK，强化前后端协作的类型一致性。
- **前后端契约门禁**：内置 `Contract Gate` 与 `Compatibility Gate`，降低 API Schema 变更带来的破坏性风险。
- **SaaS 多租户能力**：支持租户上下文、租户 Header 切换、租户维度访问控制与视图隔离。
- **实时更新能力**：基于 `Laravel Echo / Pusher` 的实时消息与状态同步能力。
- **Schema 驱动界面能力**：支持 Schema 驱动的动态表单与表格，适配配置化 CRUD 场景。
- **路由访问控制增强**：支持角色 / 权限 / 租户范围联合校验。
- **运行时配置协作**：支持主题与国际化运行时配置，便于与后端配置中心联动。
- **契约驱动开发体验**：推荐与 `Obsidian Admin Laravel` 后端配套使用，获得完整的契约驱动开发流程。

### 工程质量与交付能力

- **类型检查与静态质量门禁**：`vue-tsc`、`ESLint`
- **测试能力**：单元测试（Node test runner + `tsx`）与 E2E 测试（Playwright）
- **供应链安全检查**：`pnpm audit`、Dependency Review
- **CI 工作流**：GitHub Actions（`Lint` / `Contract Gate`（含 `Compatibility Gate`）/ `Supply Chain`）


## 使用

**环境准备**

确保你的环境满足以下要求：

- **git**: 你需要git来克隆和管理项目版本。
- **NodeJS**: >=20.19.0，推荐 20.19.0 或更高。
- **pnpm**: >= 10.5.0，推荐 10.5.0 或更高。

**克隆项目**

```bash
git clone https://github.com/obsidianlabs-io/obsidian-admin-vue.git
```

**安装依赖**

```bash
pnpm i
```
> 由于本项目采用了 pnpm monorepo 的管理方式，因此请不要使用 npm 或 yarn 来安装依赖。

**启动项目**

```bash
pnpm dev
```

**构建项目**

```bash
pnpm build
```

**接口契约检查（推荐）**

```bash
# 检查前端 API 契约快照是否与当前代码一致
pnpm contract:check

# 更新前端 API 契约快照
pnpm contract:write

# 与 Laravel 后端契约快照做兼容性比对（Compatibility Gate，需要 ../obsidian-admin-laravel/docs/api-contract.snapshot）
pnpm contract:backend

# 从 Laravel 后端（OpenAPI + 契约快照 + DTO + Resource）生成前端类型与官方 Axios SDK
pnpm api:types

# 一键优先远程生成（优先读取 http://localhost:8080/docs/api.json，失败时回退本地 OpenAPI 文件）
npm run generate-api

# 仅使用官方 openapi-ts 生成 Axios SDK（输出到 src/service/api/generated）
pnpm openapi:client:official

# 生成并校验类型文件是否已提交（CI 建议）
pnpm typecheck:api

# 前端单元测试（Node test runner + tsx）
pnpm test:unit
```

CI 严格契约门禁（`.github/workflows/contract-gate.yml`，包含 `Contract Gate` 与 `Compatibility Gate`）会要求：

- 仓库 Secret：`BACKEND_REPO_TOKEN`（私有后端仓库时必需；公有仓库可选）
- 可选配置仓库 Variable：`BACKEND_REPO`（默认 `obsidianlabs-io/obsidian-admin-laravel`）
- 若后端仓库缺少 `docs/api-contract.snapshot` 会直接失败（不再跳过）


## 鸣谢

Obsidian Admin Vue 的诞生离不开开源社区的无私奉献，我们是站在 **[SoybeanAdmin](https://github.com/soybeanjs/soybean-admin)** 巨人的肩膀上成长起来的。

我们之所以能拥有如此清新优雅的 UI 交互、顺滑的布局以及完美的 UnoCSS 基础库，全部归功于原 SoybeanJS 作者们精心打磨的开源代码。
如果您觉得 Obsidian Admin Vue 的界面赏心悦目，我们强烈建议您前往支持并为原滋原味的 [SoybeanAdmin 仓库](https://github.com/soybeanjs/soybean-admin) 点亮一颗 ⭐️！

## 开源协议

本项目基于开源 [MIT License](./LICENSE) 协议发布。

*Copyright © 2026 Obsidian Labs & SoybeanJS Contributors.*
