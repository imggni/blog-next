---
name: nextjs-code-review
description: Next.js + shadcn/ui 代码审查，检查规范、错误、可优化点
---

# 代码审查规则
1. 检查是否正确区分服务端/客户端组件
   - 交互必须加 'use client'
   - 无交互页面不加
2. 检查是否正确使用 shadcn/ui 组件
3. 检查 Tailwind CSS 类名是否规范
4. 检查代码是否冗余、可简化
5. 检查是否有语法错误、警告
6. 检查导入是否规范
7. 不允许出现数据库、Prisma、Supabase 相关代码
8. 给出可直接复制的优化建议
9. 最终输出：问题 + 优化代码