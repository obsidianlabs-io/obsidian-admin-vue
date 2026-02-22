# 更新日志

本项目所有的重要变更将会记录在此文件中。

日志格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本号 (Semantic Versioning)](https://semver.org/spec/v2.0.0.html)。

---

## [1.0.0] - 2026-02-23

### 🎉 首次公开发布 (Obsidian Admin Vue)

欢迎使用 **Obsidian Admin Vue** 的首个正式版本。本系统是在原生 SoybeanAdmin 优秀的UI基础上，深度重构和增强的企业级单体(Modular Monolith)前端管理模板。此版本引入了严格的架构约束、端到端的类型安全、以及与 Laravel 12 后端的无缝深度整合。

### ✨ 特性 (Features)
- **底层架构**：基于前沿技术栈 Vue 3, Vite 7, TypeScript, Pinia, 与 UnoCSS 搭建。
- **端到端类型安全 (E2E Types)**：引入 `@hey-api/openapi-ts`，直接读取后端 Scramble 自动生成的 OpenAPI 规范文件，一键反向生成全自动带有 TypeScript 强类型的 Axios 客户端。从此告别手写 `interface`！
- **严苛的 API 契约校验 (Contract Check)**：新增 GitHub Actions CI 设置（`contract-gate.yml`），在合并 PR 时，自动比对前后的 API 契约快照。如后端字段发生破坏性变更，前端 CI 将立刻报错，物理阻断生产环境发版。
- **真正的多租户设计 (Multi-Tenancy)**：从全局状态库到页面组件，已原生支持 SaaS 多租户架构。支持超级管理员与普通租户无缝切换数据上下文（全局 Header 租户切换器）。
- **企业级权限设计 (RBAC)**：支持前端静态与后端动态双路由解析，直接对接后端的严格角色和原子化权限。
- **实时通信集成 (Real-Time WebSockets)**：前端集成 `laravel-echo` 与 `pusher-js`，自动对接后端的 RoadRunner/Reverb 服务。当全局配置、功能开关(Feature Flags) 等在其他浏览器中发生变更时，无需刷新，当前端页面直接触发局部更新与通知。
- **动态 Schema 表单 (Schema-Driven UI)**：通过直接请求后端的 `CrudSchemaController` 自动驱动 Vue 页面的列表与表单，极高缩减重复 CRUD 页面代码。
- **数据库驱动的动态国际化 (Dynamic i18n)**：重构了 `vue-i18n` 的读取机制。摒弃本地冗余的 JSON 硬编码，当应用加载时直接通过 API 拉去服务端已启用的多语言包，借助 sha1 Hash 对比与持久化缓存机制大幅提升加载性能。
- **极致的开发者体验 (DX)**：自带编写精良的 `plop.js` 快速生成宏。只需输入所需模块名，3秒钟内即可自动生成完整的 Vue 页面文件、自动注册多语言路由键、自动占位 API 接口函数。 
- **专属美学呈现**：专属深色模式、全局阴影调优，以及全新的 Obsidian 黑曜石主题水晶 Logo。

### 🧹 移除或重构项 (Removals)
- 移除了原基础模板中本地的 Mock 测试服务器集成 (ApiFox)。现要求开发者严格按照 DDD 规范连接并依赖 `obsidian-admin-laravel` 以保证数据类型的真实与严谨。

*这是属于企业级全栈开发者的梦幻开局。*
