---
title: "商城聊天功能开发文档（SSE 实时推送版）"
description: "基于 Next.js（前端）+ Express/Prisma（后端）实现群聊/私聊聊天系统：实时推送使用 SSE，发送消息走后端 Chat API，并包含未读、通知、在线状态与常见排障。"
date: "2026-04-20"
tags:
  - "Next.js"
  - "Express"
  - "Prisma"
  - "SSE"
  - "Chat"
  - "实时推送"
---

# 商城聊天功能开发文档（SSE 实时推送版）

本文描述商城聊天模块的完整实现思路与落地细节。当前版本遵循两条原则：

1. **实时推送只用 SSE（Server-Sent Events）**：服务器 → 客户端单向流式推送。
2. **发送消息只走后端 Chat API**：不在前端直接写数据库。

---

## 1. 功能范围

- 群聊
  - 房间列表
  - 加入/退出房间
  - 历史消息加载
  - SSE 实时接收新消息
- 私聊
  - 发起私聊（从群聊成员/消息发起）
  - 历史消息加载
  - SSE 实时接收新消息
  - 私聊会话本地删除（只删前端会话入口，不删后端数据）
- 体验能力
  - 未读角标（本地持久化）
  - 桌面通知（可开关）
  - 在线状态（presence：可选，需后端推送或查询）

---

## 2. 前端实现（Next.js）

### 2.1 路由入口

- 页面：`/app/(mall)/mall/chat/page.tsx`
- 导航入口：`/components/mall/mall-nav.tsx`

### 2.2 API 客户端

Chat API 统一封装在：

- `lib/mall/server/chat.ts`（导出 `chatApi`）

常用接口（以 `/api` 为前缀）：

- `GET /chat/rooms`
- `POST /chat/rooms`
- `POST /chat/rooms/{roomId}/join`
- `GET /chat/rooms/{roomId}/members`
- `GET /chat/messages/history`
- `POST /chat/messages/room`
- `POST /chat/messages/private`
- `PUT /chat/messages/{messageId}/read`
- `GET /chat/presence?userIds=...`

### 2.3 SSE 接收：/chat/stream

聊天页会建立 SSE 长连接：

- URL：`GET ${NEXT_PUBLIC_API_URL}/chat/stream?rooms=<roomId|roomId|...>`
- Header：`Authorization: Bearer <token>`
- `rooms` 参数是 “已加入房间 id” 的 `|` 分隔字符串（客户端会限制最多 25 个房间）

前端实现要点：

- 采用 `fetch()` + `ReadableStream` 解析 SSE 帧（event/data）
- 断线重连：失败时按退避策略重新连接
- 事件处理：
  - 收到 `message`：追加到当前线程或累加未读
  - 收到 `presence`（可选）：更新在线成员 id 列表

SSE 帧格式约定：

- 默认消息（event 省略或 `event: message`）：
  - `data: <json>\n\n`
- 心跳：
  - `event: ping`（或 keep-alive），前端忽略即可
- 在线：
  - `event: presence`
  - `data: {"roomId":"...","userIds":["..."]}\n\n`

消息 JSON 建议使用“API DTO”风格字段：

```json
{
  "id": "uuid",
  "senderId": "uuid",
  "receiverId": "uuid|null",
  "roomId": "uuid|null",
  "content": "text",
  "isRead": false,
  "sendTime": "2026-04-20T10:00:00.000Z",
  "sender": { "id": "uuid", "username": "张三", "avatar": null },
  "receiver": { "id": "uuid", "username": "李四", "avatar": null }
}
```

兼容：如果服务端推的是 snake_case（如 `sender_id`/`room_id`/`send_time`），前端也能解析，但建议统一到 DTO 形态。

### 2.4 未读与私聊会话删除（前端）

未读与私聊列表用 Zustand 本地持久化：

- `hooks/use-chat-store.ts`
  - `unreadByRoomId`
  - `unreadByPeerId`
  - `privatePeers`（最近私聊对象列表）
  - `removePrivatePeer(peerId)`：删除私聊会话入口 + 清掉该 peer 未读

说明：这是纯前端会话入口管理，不涉及删除后端消息。

### 2.5 用户名显示策略（避免显示 UUID）

如果后端返回的 `username` 本身是 UUID / “未登录” / 空：

- 前端不再显示用户 id
- 统一兜底显示：`未设置昵称`

如果想正确显示用户名，需要确保后端 `users.username` 真实可用，或提供 `displayName`。

---

## 3. 后端实现（Express + Prisma）

### 3.1 新增 SSE 接口：GET /chat/stream

后端需要实现 SSE 输出：

- `Content-Type: text/event-stream`
- `Cache-Control: no-cache, no-transform`
- `Connection: keep-alive`
- `X-Accel-Buffering: no`（避免 Nginx 缓冲导致前端收不到“实时”）

并在连接期间：

- 定时发送心跳 `ping`，避免中间设备断开 idle 连接
- 在 `req.close` 时清理连接

### 3.2 SSE Hub（连接管理与广播）

后端需要一个“连接中心”（内存）：

- 用户维度：`userId -> Set(res)`
- 房间维度：`roomId -> Set(res)`

当消息落库后：

- 私聊：推送给 senderId 与 receiverId
- 群聊：推送给房间内订阅者

提示：如果你的后端是多实例部署（PM2/多 Pod），内存 Hub 不够，需要 Redis Pub/Sub 或消息队列做跨实例广播。

### 3.3 消息发送接口：落库后推送 SSE

- `POST /chat/messages/private`：
  - 落库后 `publishPrivateMessage(...)`
- `POST /chat/messages/room`：
  - 落库后 `publishRoomMessage(...)`

### 3.4 /chat/presence 用于补齐头像/昵称（推荐）

为了让前端私聊列表显示用户名，而不是 UUID：

- `GET /chat/presence?userIds=...`
- 建议返回：

```json
{
  "code": 200,
  "message": "获取在线状态成功",
  "data": {
    "uuid1": { "online": true, "lastSeenAt": null, "username": "张三", "avatar": null },
    "uuid2": { "online": false, "lastSeenAt": "2026-04-20T10:00:00.000Z", "username": "李四", "avatar": null }
  }
}
```

---

## 4. 调试与排障清单

### 4.1 SSE 是否连接成功

浏览器 DevTools → Network：

- 找到 `/api/chat/stream?...`
- **必须是 pending（长时间不结束）**
- Response/Preview 会持续出现 `event:` / `data:` 输出（或在 Response 中增长）

若连接会立刻结束，常见原因：

- 没设置 `text/event-stream`
- 中间层缓存/缓冲（Nginx 没关 buffering）
- 没有心跳，连接被代理/浏览器断开

### 4.2 为什么我发消息，另一端不实时

按顺序排查：

1. 对方是否成功连上 SSE（是否有 pending 的 stream 请求）
2. 服务端是否在落库后执行了 publish（是否真的 `res.write(...)` 了）
3. 订阅范围是否包含对应 roomId（rooms 参数是否包含当前房间）
4. 私聊是否 receiverId 写对（推送是否投递给正确 userId）
5. 反向代理是否缓存 SSE（必须关 buffering）

---

## 5. 生产建议（强烈建议）

- 断线补偿：SSE 重连后，客户端按 lastSendTime/lastMessageId 补拉一次历史差量，避免空窗漏消息。
- 限流与防刷：发送消息接口必须做频率限制、内容长度限制、审计记录。
- 多实例广播：Redis Pub/Sub 或 MQ，避免单实例 Hub 的局限。
- 安全：SSE 必须鉴权（Bearer token），避免匿名订阅。
- 日志：服务端记录连接数、推送失败数、平均推送延迟，方便排障。

---

## 6. 文件清单（快速索引）

前端：

- `app/(mall)/mall/chat/page.tsx`
- `components/mall/chat/*`
- `hooks/use-chat-store.ts`
- `lib/mall/server/chat.ts`
- `types/api.ts`

后端（建议）：

- `src/controllers/chatStreamController.js`
- `src/sse/chatSseHub.js`
- `src/routes/chatRoutes.js`
- `src/controllers/chatMessageController.js`
- `src/controllers/chatExtraController.js`
