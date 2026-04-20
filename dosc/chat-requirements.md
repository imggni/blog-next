# 实时聊天系统（后端补充需求）

现状：`/dosc/openapi.json` 已包含基础 Chat API（房间、加入、历史消息、发送、私聊已读）。为了让“私聊 + 群聊 + 实时推送 + 未读角标 + 桌面通知 + 在线状态”达到生产可用，还需要补齐以下能力。

## 1. 必需能力清单（生产可用）

### 1.1 私聊会话列表（缺失）

目的：左侧“私聊列表”不能靠用户手动输入 receiverId；需要服务端给出最近会话 + 最后一条消息 + 未读数。

建议新增：

- `GET /chat/conversations`
  - 入参（query，可选）：`type=private|room`、`cursor`、`take`
  - 返回：会话列表（按最后消息时间倒序）
  - 字段建议：
    - `id`（会话ID，roomId 或 private:<minUserId>:<maxUserId>）
    - `type`：`room`/`private`
    - `room?: { id, roomName }`
    - `peer?: { id, username, avatar }`（私聊对方）
    - `lastMessage?: { id, content, sendTime, senderId }`
    - `unreadCount`

### 1.2 未读计数（缺失：服务端权威）

目的：多端一致、刷新不丢、支持 Nav 角标、支持每会话 badge。

建议新增：

- `GET /chat/unread/summary`
  - 返回：`{ total: number, byRoomId: Record<string, number>, byPeerId: Record<string, number> }`

以及批量清零：

- `POST /chat/unread/clear`
  - body：`{ roomId?: string, peerId?: string }`

或以已读游标方式：

- `PUT /chat/conversations/{conversationId}/read`
  - body：`{ lastReadMessageId: string }`

### 1.3 已读批量接口（建议）

现有：

- `PUT /chat/messages/{messageId}/read`（逐条）

建议补充：

- `PUT /chat/messages/read/batch`
  - body：`{ messageIds: string[] }`

### 1.4 用户搜索 / 用户列表（缺失）

目的：发起私聊、@人、展示用户信息、按用户名搜索。

建议新增：

- `GET /chat/users/search?keyword=xxx&take=20`
  - 返回：`ChatUserSummary[]`

或直接复用业务用户：

- `GET /user/list`（需要鉴权与脱敏）

### 1.5 在线状态（缺失：全局在线）

当前前端实现使用 Realtime Presence，仅能体现“当前房间页面在线”。

若要提供“全站在线/离线状态、最后在线时间”，建议新增：

- `GET /chat/presence`
  - query：`userIds=...`
  - 返回：`{ [userId]: { online: boolean, lastSeenAt?: string } }`

同时后端应在连接建立/断开时维护用户 online 状态（Redis/内存 + 定时落库）。

## 2. Realtime 推送策略（高性能）

### 2.1 订阅范围

当前前端可订阅：

- 私聊：`receiver_id=eq.<me>`
- 群聊：已加入房间 `room_id=eq.<roomId>`（每房间一个 channel）

当房间数量很多时，频道数量会爆炸。建议后端提供“聚合推送”策略：

- 后端维护用户的“已加入房间列表”
- 通过单一 WebSocket/SSE 向客户端推送（推荐）
- 或将 `chat_messages` 复制到一张“user_inbox”表（按 userId 预计算），Realtime 只订阅 `user_id=eq.<me>`（推荐）

### 2.2 消息幂等

要求：

- `ChatMessage.id` 全局唯一
- 客户端去重应基于 `id`，并保证发送回显与 Realtime 回推不会重复

## 3. 数据与安全（Supabase / RLS）

若使用 Supabase Realtime + RLS：

- `chat_messages` 必须开启 Realtime replication
- RLS policy 至少需要允许：
  - 私聊：receiver 或 sender 可 `SELECT`（Realtime 读取也需要）
  - 群聊：room member 可 `SELECT`

注意：如果前端使用的是自有 JWT（非 Supabase Auth JWT），需要后端签发可被 Supabase 验证的 JWT 或改为 Supabase Auth。

## 4. 现有 OpenAPI 已覆盖的能力（无需新增）

`/dosc/openapi.json` 已存在：

- 房间列表/创建/加入/退出/成员
- 私聊/群聊发送（REST 兜底）
- 历史消息查询（roomId / senderId+receiverId）
- 单条私聊已读

## 5. 建议补充字段（可选）

为了更好的会话列表体验（last message preview/时间/置顶/免打扰）：

- `chat_rooms`：`last_message_id` / `last_message_at`
- `room_members`：`mute_until` / `role`
- `private_conversations`：`user_a_id` / `user_b_id` / `last_message_id` / `last_message_at`
- `message_receipts`：`message_id` / `user_id` / `read_at`
