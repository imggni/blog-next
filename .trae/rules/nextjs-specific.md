---
name: nextjs-specific
description: Next.js（App Router）规则（精简）
scope: project
paths:
  - "app/**/*.tsx"
  - "app/**/*.ts"
  - "components/**/*.tsx"
  - "lib/**/*.ts"
  - "lib/**/*.tsx"
---

# 一、通用强制规范（所有前端代码必须遵守）
- TS 严格模式；禁止 any，绕过时必须注释原因
- const 优先；async/await + try/catch；生产无 console.log
- 命名：组件/类型 PascalCase，变量/函数/Hooks camelCase
- 结构：单文件精简；复杂逻辑拆 hooks/utils；禁止魔法值
- 导入顺序：第三方 → 内部模块 → 样式
- 样式：CSS Modules/Tailwind；禁止全局污染、内联样式
- 请求：统一封装；页面不直连接口
- 安全：避免 dangerouslySetInnerHTML；用户输入校验
- 性能：列表 key 用稳定 id；按需优化；懒加载

# 二、Next.js(App Router) 专属规范
- 严格区分服务端/客户端组件；仅必要时加 "use client"
- 遵循 App Router 约定：page/layout/route；动态路由参数显式类型
- 数据获取：服务端优先；客户端请求统一封装 loading/error
- 环境变量：严格区分客户端(NEXT_PUBLIC_)与服务端变量
- API 接口必须做参数校验；敏感逻辑仅放在服务端

