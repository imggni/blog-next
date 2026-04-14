---
name: nextjs-specific
description: Next.js App Router + TypeScript + shadcn/ui + Zustand 项目规范
scope: project
paths:
  - "src/app/**/*.tsx"
  - "src/app/**/*.ts"
  - "src/components/**/*.tsx"
  - "src/hooks/**/*.ts"
  - "src/lib/**/*.ts"
  - "src/types/**/*.ts"
---

# 项目规范（必须严格遵守）

## 技术栈
- Next.js 14+ App Router
- TypeScript
- shadcn/ui（仅通过 CLI 安装）
- Tailwind CSS v3
- Zustand 全局状态管理

## 目录结构（严格遵守）
- src/app/             页面路由
- src/components/      业务组件
  - src/components/ui/ shadcn/ui 组件
- src/hooks/           自定义 Hooks + ZUSTAND STORE
- src/lib/             工具函数
- src/types/           TS 类型定义

## 核心规则（AI 必须 100% 执行）
1. 交互组件、状态组件必须加 'use client'
2. 静态页面优先使用服务端组件
3. **Zustand 必须放在 src/hooks/ 下**
   命名格式：use[Feature]Store.ts
   持久化使用 persist middleware
4. 组件使用命名导出
5. 样式只使用 Tailwind
6. 不允许修改 shadcn/ui 原始文件，只能扩展
7. 组件保持单一职责
8. 导入使用 @ 路径别名

## 代码风格
- 使用箭头函数组件
- 类型定义清晰
- 变量语义化
- 组件结构清晰