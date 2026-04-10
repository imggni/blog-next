---
name: nextjs-code-review
description: Next.js + shadcn/ui 代码审查，检查规范、错误、可优化点
---

# 目标
为 `blog-next` 项目提供一个结构化的代码审查流程，覆盖 App Router 路由、客户端/服务端边界、shadcn/ui 组件使用、Tailwind 样式、类型安全与构建校验。

# 适用范围
- 项目：`blog-next`
- 技术栈：`Next.js App Router`、`TypeScript strict`、`Tailwind CSS`、`shadcn/ui`
- 检查范围：`app/**` 页面与布局、`components/**` 组件、`lib/**` 工具

# 审查流程
1. 确认目标区域
   - 判断当前审查文件是否属于博客区、商城区、公共布局或 UI 组件
2. 路由与布局检查
   - 确认 `page.tsx`、`layout.tsx` 的所在目录与期望 URL 匹配
   - 识别并报告平行路由组冲突，例如 `/(main)/mall` 与 `/(mall)/mall`
   - 检查动态路由 `[param]`、catch-all `[...]` 的正确使用
3. 服务端/客户端边界检查
   - 静态展示页面不应添加 `use client`
   - 交互、状态、事件、浏览器 API 必须在 `use client` 组件中处理
   - 避免将整个页面标记为客户端组件，若只部分子组件需要交互则拆分组件
4. shadcn/ui 与样式检查
   - 优先使用 `@/components/ui/*` 组件
   - 不直接修改 shadcn 源码
   - Tailwind 类名应清晰、无冗余、避免内联样式和 `!important`
5. 代码质量与类型检查
   - 禁止出现 `any` 或隐式 `any`
   - 所有 Promise 必须处理 `.catch()` 或 `try/catch`
   - 变量、函数、Hook 使用 camelCase；组件/类型使用 PascalCase；常量使用 UPPER_SNAKE_CASE
   - 列表渲染必须使用稳定 `key`，避免 `index` 作为 key
6. 依赖与用法检查
   - 导入顺序：第三方库 → 内部模块 → 样式 → 类型
   - 不能出现数据库、Prisma、Supabase、后端 ORM 相关代码
   - 不能直接在客户端暴露敏感信息或环境变量
7. 构建与验证建议
   - 建议运行 `pnpm lint && pnpm typecheck`
   - 对路由或页面变更，建议执行 `pnpm build` 或 `npm run build`

# 输出规范
- 明确列出发现的问题
- 提供可直接复制的修复建议或代码片段
- 如果无问题，说明“代码符合当前项目规范”
- 对 `route`、`layout`、`use client`、`shadcn/ui`、`Tailwind` 这几类问题优先给出结论

# 常见判断逻辑
- 如果页面包含按钮、表单、状态、事件处理，返回“需要 `use client`”
- 如果页面只有静态内容和服务器数据，则返回“应该保持服务端组件”
- 如果发现两个平行组同一路径，返回“存在平行路由冲突，删除或合并其中一个”
- 如果发现无用导入或重复样式，返回“可简化为…”

# 参考检查点
- `app/(main)/mall` 与 `app/(mall)/mall` 是否同时存在？
- `page.tsx` 是否包含不必要的 `use client`？
- 是否使用 `Button asChild` 时保持 `next/link` 语义正确？
- `product`、`order`、`profile` 等商城页面是否共享统一导航？
- `mall-nav` 组件是否只渲染一次且不会重复导入无用组件？
