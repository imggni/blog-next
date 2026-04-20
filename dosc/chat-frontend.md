# 实时聊天（前端实现说明）

目标：在商城内提供生产可用的实时聊天体验，前端仅做两类事情：

1. 连接 Supabase Realtime，接收实时消息（监听 `INSERT`）。
2. 调用自有后端 API 发送消息（不通过 Supabase 直接 `insert`）。

本项目实现入口：`/mall/chat`。

## 1. 页面与入口

- 路由：`/app/(mall)/mall/chat/page.tsx`
- 导航：`/components/mall/mall-nav.tsx` 增加“聊天”，并显示未读角标（本地缓存未读）。

## 2. UI 结构（shadcn/ui）

页面采用左右布局：

- 左侧：会话列表
  - 群聊（房间列表）：房间名、成员数、加入状态、未读角标、加入按钮
  - 私聊（本地维护最近私聊用户）：对方 ID、未读角标
- 右侧：消息线程
  - 消息列表：气泡 + 时间
  - 发送框：回车发送
  - 通知开关：控制桌面通知
  - 在线人数：房间 Presence 在线计数

对应组件：

- 房间列表：`/components/mall/chat/chat-room-list.tsx`
- 消息气泡：`/components/mall/chat/chat-message-bubble.tsx`
- 发送框：`/components/mall/chat/chat-composer.tsx`

## 3. 后端 API（读取/写入）

前端通过 `chatApi` 访问后端接口（带 Bearer Token）：

- `GET /chat/rooms`：房间列表（包含 joined/memberCount/creator 等）
- `POST /chat/rooms`：创建房间
- `POST /chat/rooms/{roomId}/join`：加入房间
- `GET /chat/rooms/{roomId}/members`：获取成员（用于展示头像/昵称）
- `GET /chat/messages/history`：加载历史消息（room/私聊）
- `POST /chat/messages/room`：发送群聊消息
- `POST /chat/messages/private`：发送私聊消息
- `PUT /chat/messages/{messageId}/read`：标记私聊消息已读

实现位置：

- API client：`/lib/mall/server/chat.ts`
- 导出：`/lib/mall/server/index.ts`，以及 `@/lib/api` 统一出口
- DTO：`/types/api.ts`（ChatRoom/ChatMessage 等）

## 4. Realtime（只做接收）

前端仅使用 Supabase Realtime 的 `postgres_changes` 订阅 `chat_messages` 的 `INSERT`：

- 私聊推送：订阅 `receiver_id=eq.<当前用户ID>`
- 群聊推送：对已加入房间逐个订阅 `room_id=eq.<roomId>`（限制最多 25 个，避免频道爆炸）

收到事件后前端只做 UI 层动作：

- 若当前正在打开对应会话：将消息追加到线程；私聊额外调用后端 `markRead`（单条）
- 否则：增加本地未读计数；若启用桌面通知且页面不在前台，弹出系统通知

注意：

- Realtime payload 来自数据库行（snake_case 字段），因此前端做了最小映射：`sender_id/room_id/send_time/is_read` -> `UiMessage`
- 不通过 Supabase `select/insert/update` 访问业务数据（列表、历史、发送、已读都走后端 API）

## 5. 未读角标

未读在前端用 Zustand 持久化（localStorage）维护：

- 房间未读：`unreadByRoomId`
- 私聊未读：`unreadByPeerId`
- 最近私聊对象列表：`privatePeers`

实现位置：

- `/hooks/use-chat-store.ts`

这套实现可以做到：

- 用户刷新页面后未读不会立刻丢失（本地缓存）
- 收到 Realtime 消息后即时更新 MallNav 角标

生产建议（后端增强见需求文档）：未读应以服务端为准，前端未读仅做展示缓存，避免多端不同步。

## 6. 桌面通知

逻辑：

- 页面处于后台（`document.visibilityState !== "visible"`）
- 通知开关开启
- 浏览器已授权（`Notification.permission === "granted"`）

此时收到新消息会调用 `new Notification(title, { body })`。

点击通知会跳转：

- 群聊：`/mall/chat?roomId=<id>`
- 私聊：`/mall/chat?peerId=<id>`

## 7. 在线状态（Presence）

在线状态采用 Realtime Presence（不是数据库 `online` 字段）：

- 仅在当前打开的房间创建 presence channel：`presence:room:<roomId>`
- `track()` 上报当前用户
- 使用 `presenceState()` 统计在线人数并展示

生产建议：

- Presence 仅代表“正在打开此房间页面并保持连接”的在线
- 若需要全局在线（App/多端），应由后端统一维护并提供 API

## 8. 性能与稳定性建议

- 频道数量：群聊订阅数量做上限（当前 25），更大规模建议由后端做 fanout（WebSocket/SSE）或按“有未读/置顶”的会话订阅。
- 去重：消息追加前基于 `id` 去重，避免“发送回显 + Realtime 回推”导致重复。
- 历史加载：默认拉取 100 条；建议后端支持分页游标（before/after）以支持无限滚动。
- 已读：当前逐条 `markRead`，建议后端提供批量已读接口。
