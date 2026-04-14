---
name: nextjs-code-review
description: Next.js + shadcn/ui 代码审查，检查规范、错误、可优化点
---

# 目标
为 `blog-next` 项目提供结构化代码审查，覆盖 App Router 路由、客户端/服务端边界、shadcn/ui 组件使用、Tailwind 样式、类型安全与构建校验。

# 适用范围
- 项目：`blog-next`
- 技术栈：`Next.js App Router`、`TypeScript strict`、`Tailwind CSS`、`shadcn/ui`
- 检查范围：`app/**` 页面与布局、`components/**` 组件、`lib/**` 工具

# 审查流程
1. 确认目标区域
   - 判断当前审查文件属于博客区、商城区、公共布局或 UI 组件
2. 路由与布局检查
   - 确认 `page.tsx`、`layout.tsx` 所在目录与期望 URL 匹配
   - 识别并报告平行路由组冲突，例如 `/(main)/mall` 与 `/(mall)/mall`
   - 检查动态路由 `[param]`、catch-all `[...]` 的正确使用
3. 服务端/客户端边界检查
   - 静态展示页面不允许添加 `use client`
   - 交互、状态、事件、浏览器 API 必须在 `use client` 组件中处理
   - 避免将整个页面标记为客户端组件，只在需要交互的子组件加
4. shadcn/ui 与样式检查
   - 优先使用 `@/components/ui/*` 组件
   - 不直接修改 shadcn 源码
   - Tailwind 类名无冗余、无内联样式、无 `!important`
5. 代码质量与类型检查
   - 禁止 `any` 或隐式 `any`
   - 所有 Promise 必须处理 `.catch()` 或 `try/catch`
   - 变量/函数/Hook：camelCase；组件/类型：PascalCase；常量：UPPER_SNAKE_CASE
   - 列表渲染必须使用稳定 `key`，禁止滥用 index
6. 依赖与用法检查
   - 导入顺序：第三方库 → 内部模块 → 样式 → 类型
   - 不出现 Prisma、Supabase、后端 ORM 代码
   - 不暴露敏感信息或环境变量到客户端
7. 构建与验证建议
   - 运行 `pnpm lint && pnpm typecheck`
   - 路由/页面变更必须执行 `pnpm build` 验证

# 输出规范
- 明确列出问题
- 提供可直接复制的修复代码
- 无问题则返回：**代码符合当前项目规范**
- 优先检查：`route`、`layout`、`use client`、`shadcn/ui`、`Tailwind`

# 常见判断逻辑
- 含按钮、表单、状态、交互 → 需要 `use client`
- 纯静态展示、服务端数据 → 保持服务端组件
- 同一路由存在两个平行组 → 路由冲突，必须合并/删除
- 无用导入、重复类名 → 直接给出简化代码

# 参考检查点
- `app/(main)/mall` 与 `app/(mall)/mall` 禁止同时存在
- 非交互页面禁止加 `use client`
- `Button asChild` 必须配合 `next/link` 正确使用
- 商城页面统一使用 `/mall` 路径与导航
- 公共组件（如 mall-nav）只渲染一次