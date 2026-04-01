---
title: "Next.js App Router 实战指南"
description: "从目录设计到路由拆分，快速搭建一个清晰可维护的博客项目。"
date: "2026-03-20"
tags:
  - "Next.js"
  - "App Router"
  - "Blog"
---

# 为什么选择 App Router

App Router 让页面、布局和接口都围绕文件系统组织，项目结构更直观，也更适合按业务拆分。

## 适合博客项目的原因

- 路由和页面天然对应
- layout 可以复用导航和页脚
- route handler 适合做订阅、搜索等轻接口

## 推荐目录思路

把页面、组件、内容和工具函数按职责拆开，后续新增文章、项目页或者接口都更容易维护。

```tsx
app/
components/
content/
lib/
types/
```

## 小结

一个好的目录结构不是越复杂越好，而是要让“页面在哪里、数据从哪里来、组件放哪里”一眼就能看懂。
