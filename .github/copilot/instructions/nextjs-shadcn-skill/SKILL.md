---
name: nextjs-shadcn-skill
description: Next.js + shadcn/ui 前端开发规范
---

# 开发规则
- 技术栈：Next.js 14+ App Router + shadcn/ui + Tailwind CSS
- 页面组件默认是服务端组件
- 只有需要交互（点击、输入、状态）的组件才加 'use client'
- 只使用 shadcn/ui 提供的组件
- 不使用任何数据库、ORM、后端 API
- 不使用 Prisma、Supabase
- 页面结构清晰，响应式设计
- 代码可直接复制运行