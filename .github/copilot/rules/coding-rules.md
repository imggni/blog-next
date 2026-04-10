---
name: coding-rules
description: 全局编码规范
---

# 编码规范（全局生效）

- 变量名统一使用小驼峰（camelCase）
- 函数必须添加简单注释
- 页面结构保持简洁，组件拆分细致
- 优先使用 shadcn/ui 原生组件
- 不写冗余代码，逻辑简洁高效
- 文件名使用小写 + 短横线分隔（如 product-card.jsx）
- 代码缩进统一 2 空格
- Next.js 组件必须正确区分服务端 / 客户端
- 交互组件必须加 'use client'
- 非交互组件默认不加
- 样式统一使用 Tailwind CSS
- 不使用任何数据库、ORM、后端、Prisma、Supabase
- 只做纯前端开发