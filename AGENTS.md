# AGENTS.md - Next.js + shadcn 项目通用开发规范
## 一、项目核心信息
- 框架：Next.js 14+ App Router（app/目录）
- 语言：TypeScript 严格模式（strict: true），严禁 any，必须显式类型
- UI：shadcn/ui + Tailwind CSS，禁止内联样式、全局CSS污染
- 构建：pnpm dev / pnpm build / pnpm start
- 代码规范：ESLint + Prettier，提交前必须 pnpm lint && pnpm typecheck

## 二、目录与路由（App Router 强制）
- 页面：app/**/page.tsx（唯一页面入口）
- 布局：app/**/layout.tsx（根布局必须包含 html/body、Toaster、ThemeProvider）
- 路由：动态路由 [param]/page.tsx，catch-all [...params]，并行/拦截路由按官方规范
- 组件：@/components/ui/（shadcn）、@/components/（业务）、@/hooks/、@/lib/、@/app/
- 禁止：pages/目录、自定义路由文件、非约定式路由

## 三、代码风格强制规则
1. 命名：组件/类型 PascalCase，变量/函数/Hooks camelCase，常量 UPPER_SNAKE_CASE
2. 导入顺序：第三方库 → 内部模块 → 样式 → 类型，禁止循环导入
3. 服务端/客户端边界：默认服务端组件，仅用浏览器API时加 "use client" 并注释
4. 数据获取：服务端优先（async page），客户端用SWR/React Query，统一loading/error
5. 列表渲染：key必须用稳定ID，严禁index；禁止魔法值，抽常量
6. 环境变量：NEXT_PUBLIC_* 仅客户端，敏感变量仅服务端使用

## 四、shadcn/ui 规范
- 统一导入：@/components/ui/xxx
- 全局配置：根layout包裹 Toaster、TooltipProvider、ThemeProvider
- 禁止：直接修改shadcn源码，用className扩展样式；禁用废弃组件
- 表单：用react-hook-form + zod，统一校验逻辑

## 五、安全与性能
- 禁止客户端暴露API密钥、敏感逻辑
- 图片用next/image，开启lazy-loading、优化格式
- 服务端组件优先，减少客户端JS体积
- 禁止console.log生产代码，仅用debug/logger

## 六、禁止项（红线）
- 严禁 any、隐式any、未处理的Promise
- 严禁全局CSS、内联style、!important
- 严禁在page.tsx写复杂业务逻辑，必须抽离
- 严禁直接操作DOM，用React ref/状态管理