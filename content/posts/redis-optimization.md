---
title: "Redis 与索引优化落地清单"
description: "基于 Express + Prisma + PostgreSQL + @upstash/redis 的商城/聊天项目，优化数据库索引与 Redis 缓存性能。"
date: "2026-03-20"
tags:
  - "Redis"
  - "Index"
  - "Performance"
---

# Redis 与索引优化落地清单

> 基于 Express + Prisma + PostgreSQL + @upstash/redis 的商城/聊天项目

---

## 一、数据库索引（已落地）

| 表 | 索引 | 覆盖场景 | 备注 |
|---|---|---|---|
| products | (category_id, created_at) | 商品列表分页 + 分类过滤 | 最常用 |
| orders | (user_id, created_at) | 用户订单列表分页 | 高频 |
| addresses | (user_id, is_default, created_at) | 地址列表排序/挑默认 | 用户维度 |
| order_goods | (order_id) | 订单详情/回滚库存 | FK |

> 以上索引已写入 `prisma/schema.prisma`，执行 `npx prisma migrate dev` 即可生效。

---

## 二、Redis 缓存与性能优化（已落地）

### 1. 接入方式
- 依赖：`@upstash/redis@^1`
- 配置模块：`src/config/redis.js`（自动读取 `UPSTASH_REDIS_REST_URL` & `TOKEN`）
- 使用：`const { getRedis } = require("../config/redis")`，无 Redis 时优雅降级。

### 2. 聊天/SSE（多实例必备）
| 功能 | 实现要点 | Key 规范 |
|---|---|---|
| 跨实例消息分发 | SSE Hub 内 `redis.publish(room/user channel, JSON)` + `psubscribe` | `sse:user:{uid}` / `sse:room:{rid}` |
| 在线状态 | `SETEX presence:online:{uid} 60 1` + 30 s 心跳续期 | `presence:online:{uid}` |
| 会话列表 | 缓存最后一条消息摘要 | `conv:lastMessage:room:{rid}` / `conv:lastMessage:private:{a}:{b}` |
| 未读计数 | 发消息 `INCR`，读会话 `DEL` | `unread:room:{rid}:{uid}` / `unread:private:{uid}:{peer}` |
| 成员集合 | 加入/退出房间时维护 | `room:members:{rid}` / `user:rooms:{uid}` / `user:privatePeers:{uid}` |

### 3. 商城读接口缓存
| 接口 | 缓存策略 | TTL | 失效时机 |
|---|---|---|---|
| `GET /category` | 全表缓存 | 30 min | 增删改分类时 `DEL cache:categories` |
| `GET /product/:id` | 单条缓存 | 10 min | 更新/删除商品时 `DEL cache:product:{id}` |

> 商品列表参数组合过多，暂不建议全缓存；可后续针对“首页固定几种”做局部缓存。

---

## 三、落地验证步骤

1. **安装依赖**  
   ```bash
   npm install @upstash/redis@^1
   ```

2. **环境变量**（本地/生产均适用）  
   ```bash
   UPSTASH_REDIS_REST_URL=https://...upstash.io
   UPSTASH_REDIS_REST_TOKEN=...   
   ```
   未配置时自动降级为纯 DB 实现，不影响启动。

3. **生成 Prisma 客户端**  
   ```bash
   npx prisma generate
   ```

4. **应用索引**  
   ```bash
   npx prisma migrate dev --name add_core_indexes --create-only
   ```

5. **启动验证**  
   ```bash
   npm run dev   # 本地
   npm start     # 生产
   ```

6. **观察指标**  
   - 聊天并发时 DB 写 `online/lastSeenAt` 压力消失（已改走 Redis）
   - 会话列表/未读汇总接口 RT 显著下降（由 N+1 改为单次 pipeline）
   - 分类/商品详情重复访问不再打 DB

---

## 四、后续可继续深挖

1. **搜索性能**  
   商品 `title ILIKE %kw%` 如数据量大，需加 `pg_trgm` 扩展 + GIN 索引：  
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   CREATE INDEX idx_products_title_gin ON products USING gin (title gin_trgm_ops);
   ```

2. **限流/验证码**  
   真实登录流程可引入：  
   - `sms:code:{phone}` TTL 5 min  
   - `rate:login:{ip}` / `rate:sms:{phone}` 滑动窗口

3. **首页热点列表**  
   针对无关键词、固定筛选项（`isHot=true` / `isNew=true`）的前几页做缓存，命中率可控。

4. **异步落库**  
   在线状态可改为“仅写 Redis + 定时批量刷 DB”，进一步降低 DB 写峰值。

---

## 五、一键回滚

- **索引**：Prisma migrate 回滚即可。
- **Redis**：去掉环境变量或删除 `src/config/redis.js` 调用，所有代码已做 `if (!redis)` 降级。