---
name: nextjs-shadcn
description: Next.js + shadcn/ui 前端开发规范
---

# 目标
为 `Next.js 14+ App Router` + `shadcn/ui` 项目提供一致的开发标准，帮助团队在路由、组件、数据、样式和构建验证上保持可维护性和稳定性。

# 适用范围
- 工作区：`blog-next`
- 技术栈：`Next.js App Router`、`TypeScript strict`、`Tailwind CSS`、`shadcn/ui`
- 仅包含前端页面与组件，不涉及数据库、Prisma、Supabase、后端 ORM

# 核心规则
1. 服务端组件优先
   - 默认页面与布局为服务端组件
   - 只有需要浏览器交互时，才在最顶部添加 `"use client"`
   - 保持客户端代码尽可能小，避免将整个页面标记为客户端组件
2. 客户端/服务端边界
   - 浏览器 API、事件处理、表单输入、路由跳转、状态管理必须在 `use client` 组件中处理
   - 静态展示、SEO 内容、数据加载应在服务端组件中完成
3. 路由结构与命名
   - 遵循 App Router 约定：`app/**/page.tsx`, `app/**/layout.tsx`
   - 动态路由使用 `[param]`, catch-all 使用 `[...]`
   - 路由组 `(group)` 仅用于代码分组，不影响最终 URL
   - 避免两个不同平行组解析到同一路径，例如 `app/(main)/mall/page.tsx` 与 `app/(mall)/mall/page.tsx` 不能共存
4. shadcn/ui 使用规范
   - 组件统一从 `@/components/ui/*` 导入
   - 不直接修改 shadcn 源码，必要样式通过 `className` 扩展
   - 避免内联样式与 `!important`
5. 代码质量与类型安全
   - 禁止 `any` 与隐式 `any`
   - 所有 Promise 必须显式处理
   - 变量/函数/Hook 使用 camelCase；组件/类型使用 PascalCase；常量使用 UPPER_SNAKE_CASE
   - 导入顺序：第三方库 → 内部模块 → 样式 → 类型
6. 列表与 key
   - 渲染数组时必须使用稳定 `key`
   - 禁止使用 `index` 作为 key，除非列表完全不会变更
7. 构建与验证
   - 提交前执行 `pnpm lint && pnpm typecheck`
   - 通过 `pnpm build` 或 `npm run build` 验证路由、构建与生产配置

# 常见工作流
1. 确定页面归属
   - 判断该页面属于主博客、商城、个人中心等分区
2. 选择目录结构
   - 将页面放入正确的 `app/(...)/**` 分区
   - 如果是商城页面，确保只有一个 `/mall` 入口
3. 编写页面逻辑
   - 服务端组件负责数据获取与结构
   - 客户端组件负责交互、表单、导航、状态
4. 复用 shadcn/ui 组件
   - 先查看 `@/components/ui` 是否已有可用组件
   - 不要在页面中重复造轮子
5. 路由冲突检查
   - 确认没有两个平行组解析到同一路径
   - 发生 `You cannot have two parallel pages that resolve to the same path` 时，重命名、合并或删除冲突目录
6. 构建验证
   - 运行 `pnpm build`，确认 `Route (app)` 输出符合预期

# 关键提醒
- `app/(group)` 目录不会出现在 URL 中，URL 只由实际路由路径决定
- `page.tsx` 和 `layout.tsx` 命名必须准确
- `next/link` 与 `Button asChild` 组合时保持语义正确
- 所有商城相关页面应统一使用 `/mall` 路径分区，避免重复入口

# 示例检查点
- 是否存在 `app/(main)/mall` 与 `app/(mall)/mall` 两个目录？若有，删除或合并其中一个
- 是否有页面在不需要交互时加了 `use client`？如果是，考虑改为服务端组件
- 是否使用 `next/image` 和 `next/link` 进行资源与链接管理？
- 是否在布局中提供 `ThemeProvider`、`Toaster` 或全局 UI 组件？