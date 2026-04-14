---
title: "Express 部署到 Vercel：关键点与踩坑细节"
description: "把 Express 当作 Vercel Serverless Function 部署：目录结构、路由改写、环境变量、超时与冷启动、文件上传与长连接限制。"
date: "2026-04-14"
tags:
  - "Express"
  - "Vercel"
  - "Serverless"
  - "Deployment"
---

# Express 部署到 Vercel：关键点与踩坑细节

把 Express 部署到 Vercel，本质是把它跑在“无状态、短生命周期”的 Serverless Function 里。你不是在“启动一个常驻 Node 进程”，而是在“每次请求触发一次函数执行”。

这篇文章按“能跑起来”和“长期稳定”两个维度，把关键配置和常见坑一次讲清楚。

## 1. 先搞清楚：Vercel 上的 Express 是什么形态

- **不是** `app.listen(3000)` 这种常驻监听
- **是**导出一个 handler（`(req, res) => void`），Vercel 在请求到来时调用它
- **无状态**：不要依赖本地内存保存用户会话、队列状态、缓存内容
- **短连接**：WebSocket、SSE 长连接、后台常驻任务不适合（需要用别的方案）

## 2. 推荐目录结构（最通用）

Vercel 默认把 `api/` 下的文件当成 Serverless Functions。

```
api/
  index.ts
src/
  app.ts
  routes/
package.json
vercel.json
```

其中：

- `src/app.ts` 负责创建并配置 Express app（中间件、路由、错误处理）
- `api/index.ts` 作为 Vercel 的入口导出 handler

## 3. 最小可用实现：把 Express 导出给 Vercel

### 3.1 `src/app.ts`

```ts
import express from "express";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.get("/api/hello", (_req, res) => {
    res.status(200).json({ message: "hello from express on vercel" });
  });

  return app;
}
```

### 3.2 `api/index.ts`

```ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../src/app";

const app = createApp();

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}
```

说明：

- 这里用 `app(req, res)` 直接把请求交给 Express 处理
- 不要在 Vercel 环境里调用 `app.listen`

## 4. 让根路径也走 Express：vercel.json 重写规则

如果你希望 `https://your-domain.com/health` 这种路径也能命中 Express（而不仅是 `/api/*`），需要加 rewrite。

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/api/index" }
  ]
}
```

注意：

- 有 Next.js 的项目要谨慎使用全量 rewrite，否则会把页面路由都拦到 API 上
- 更安全的做法是只改写某个前缀，比如 `/api/(.*)` 或 `/backend/(.*)`

## 5. 中间件与 Body 解析：最常见的线上 400/413

### 5.1 JSON Body 解析必须显式配置

```ts
app.use(express.json({ limit: "1mb" }));
```

如果不配：

- `req.body` 可能是 `undefined`
- 某些客户端会触发 400（格式不对）或 413（体积过大）

### 5.2 上传文件不要走“本地落盘”

Serverless 的本地文件系统是临时的，不适合持久化存储。建议：

- 直接上传到对象存储（S3/R2/OSS）
- 或用第三方存储（Cloudinary、Supabase Storage 等）

## 6. 连接与性能：冷启动、数据库与连接池

### 6.1 冷启动

Serverless 可能会冷启动，导致首个请求变慢。可以做：

- 避免在请求路径里做重型初始化
- 把“可复用对象”放到模块顶层（例如 `const app = createApp()`）

### 6.2 数据库连接池

常见坑是“每次请求都 new 一个 client”，会在并发下把数据库打爆。

建议：

- 把数据库 client 缓存在模块顶层（同一个实例尽量复用）
- 使用适合 Serverless 的连接方式（例如 PostgreSQL 使用 pgbouncer 或者 provider 的 serverless 连接）

## 7. 运行时限制：你需要在设计上避开的点

- **WebSocket**：Serverless 不支持常驻连接（用专门的 ws 服务或托管平台）
- **SSE/长轮询**：容易超时或被回收
- **后台任务**：不要在请求里启动无限循环；用队列/定时任务平台替代
- **本地缓存**：不可靠（实例随时回收），必须用 Redis/Upstash 等外部缓存

## 8. 环境变量与配置：本地能跑，线上 500 的原因

### 8.1 环境变量从哪里来

- 本地：`.env` / `.env.local`（取决于你的加载方式）
- 线上：Vercel Dashboard 配置 Environment Variables

### 8.2 约定：不要把 secret 打到日志

线上排错建议输出：

- 请求 id、路径、耗时、关键状态码

不要输出：

- token、密码、完整用户信息、数据库连接串

## 9. 本地调试建议（贴近线上）

- 使用 `vercel dev` 本地模拟 serverless 行为
- 不要只用 `node src/index.ts` 这种常驻模式来判断线上表现

## 10. 上线前 Checklist

- `api/index.*` 入口只导出 handler，不调用 `listen`
- 路由是否需要 `vercel.json` rewrites（避免误拦截 Next.js 页面）
- `express.json()` 与上传策略是否合理（体积、格式、错误处理）
- 数据库连接是否复用、是否具备 serverless 友好策略
- 没有依赖本地持久化文件/内存状态
- 线上环境变量都配置齐全

## 小结

Express 部署到 Vercel，最关键的不是“怎么 build”，而是“怎么把你的 Express 设计成 serverless-friendly”：无状态、短生命周期、外部化存储与缓存、控制初始化成本。把这套思路贯彻到目录、入口与中间件上，基本就能稳定运行。
