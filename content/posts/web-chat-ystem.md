---
title: "在线聊天系统（Next.js+Express+WebSocket）具体设计方案"
description: "本方案基于 Next.js（前端）+ Express（后端）+ Socket.IO（WebSocket 核心）构建在线实时聊天系统，支持一对一私聊、多人群聊、消息持久化、用户在线状态管理等核心功能，兼顾易用性、扩展性和稳定性，适配开发、测试、生产全环境，可直接用于落地开发。"
date: "2026-03-28"
tags:
  - "Next.js"
  - "Express"
  - "WebSocket"
---

# 一、方案概述

本方案基于 Next.js（前端）+ Express（后端）+ Socket.IO（WebSocket 核心）构建在线实时聊天系统，支持一对一私聊、多人群聊、消息持久化、用户在线状态管理等核心功能，兼顾易用性、扩展性和稳定性，适配开发、测试、生产全环境，可直接用于落地开发。

核心设计目标：

- 实时性：WebSocket 双向通信，消息推送延迟 ≤ 500ms

- 稳定性：断网自动重连、心跳保活，避免消息丢失

- 可扩展：支持用户量扩展、功能扩展（如文件发送、消息撤回）

- 易用性：前后端代码模块化、可复用，便于维护和二次开发

# 二、总体架构设计

## 2.1 整体架构图

前端（Next.js） ←→ WebSocket（Socket.IO） ←→ 后端（Express） ←→ Prisma ORM ←→ 数据库（Supabase PostgreSQL）

说明：

- 前端：负责用户交互、消息展示、Socket 客户端连接与事件触发

- WebSocket：基于 Socket.IO 实现双向通信，处理实时消息、房间管理、用户连接/断开事件

- 后端：提供 Express 服务，封装 Socket 事件逻辑、REST 接口，通过 Prisma ORM 对接 Supabase PostgreSQL

- Prisma ORM：作为数据访问层，简化数据库操作，支持类型安全，避免 SQL 注入，适配 Supabase PostgreSQL

- 数据库：Supabase PostgreSQL 存储用户信息、聊天消息、房间信息，利用 Supabase 自带的安全规则和扩展能力提升稳定性

## 2.2 技术栈明细（固定版本，避免兼容性问题）

|模块|技术选型|版本|核心作用|
|---|---|---|---|
|前端框架|Next.js|14.0.3（App Router）|页面渲染、路由管理、客户端状态管理|
|前端状态管理|zustand|-|管理聊天记录、用户状态、房间信息|
|WebSocket 客户端|socket.io-client|4.7.2|与后端 Socket 建立连接，发送/接收消息|
|后端框架|Express.js|4.18.2|提供 HTTP 服务、封装接口、管理 Socket 逻辑|
|WebSocket 服务端|socket.io|4.7.2|处理客户端连接、消息转发、房间管理|
|数据库（主存储）|Supabase PostgreSQL|15+（Supabase 托管版）|存储用户信息、聊天消息、房间信息，自带安全规则|
|ORM 工具|Prisma|5.6.0|数据访问层，简化数据库操作，类型安全，对接 Supabase|
|跨域处理|cors|2.8.5|解决前后端跨域问题|
|数据验证|joi|17.11.0|验证前端传入的用户、消息数据合法性|
# 三、前端（Next.js）具体设计

## 3.1 项目目录结构（App Router）

```plain text
src/
├── app/
│   ├── layout.jsx          # 全局布局（导航、公共样式）
│   ├── page.jsx            # 首页（登录/注册入口）
│   ├── login/              # 登录页面
│   │   └── page.jsx
│   ├── register/           # 注册页面
│   │   └── page.jsx
│   ├── chat/               # 聊天主页面（核心）
│   │   ├── page.jsx        # 聊天页面入口
│   │   ├── components/     # 聊天组件
│   │   │   ├── ChatHeader.jsx  # 聊天头部（房间名称、在线人数）
│   │   │   ├── MessageList.jsx # 消息列表（展示所有消息）
│   │   │   ├── MessageInput.jsx # 消息输入框（发送文本/表情）
│   │   │   ├── RoomList.jsx    # 房间列表（群聊/私聊列表）
│   │   │   └── UserStatus.jsx  # 用户在线状态提示
│   └── api/                # 前端API代理（可选，避免跨域）
│       └── messages/       # 消息相关代理接口
├── context/                # 全局状态管理
│   ├── SocketContext.jsx   # Socket连接上下文
│   └── UserContext.jsx     # 用户信息上下文
├── hooks/                  # 自定义钩子
│   ├── useSocket.js        # Socket连接、事件监听钩子
│   └── useMessage.js       # 消息处理（发送、接收、格式化）钩子
├── lib/                    # 工具函数
│   ├── formatTime.js       # 消息时间格式化
│   └── validate.js         # 表单数据验证
└── styles/                 # 全局样式
    └── globals.css
```

## 3.2 核心模块设计

### 3.2.1 全局状态管理（Context）

核心作用：统一管理用户信息、Socket 实例、聊天消息、房间状态，避免组件间状态传递繁琐，实现全局状态共享。

1. SocketContext.jsx（关键代码片段）：

```jsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // 初始化Socket连接（登录后触发）
  const initSocket = (userId) => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { userId }, // 携带用户ID，用于后端识别用户
      autoConnect: true,
      reconnection: true, // 断网自动重连
      reconnectionAttempts: 5, // 重连次数
      reconnectionDelay: 1000 // 重连间隔
    });

    // 监听连接状态
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket连接成功，ID：', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket断开连接');
    });

    setSocket(newSocket);
    return newSocket;
  };

  // 销毁Socket连接（退出登录时）
  const destroySocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  return (
<SocketContext.Provider value={{ socket, isConnected, initSocket, destroySocket }}>
      {children}
    </SocketContext.Provider>
  );
}

// 自定义钩子，方便组件使用Socket
export const useSocket = () => useContext(SocketContext);
```

2. UserContext.jsx：管理用户ID、用户名、头像等信息，登录后存入localStorage，退出时清除。

### 3.2.2 聊天核心组件设计

重点实现 4 个核心组件，覆盖聊天全流程：

1. **MessageList.jsx**：展示所有聊天消息，区分自己发送、他人发送的消息，支持自动滚动到底部，格式化消息时间。
      

2. 核心逻辑：监听 Socket 的 receive_message 事件，接收新消息并更新消息列表

3. 细节：消息区分样式（自己的消息居右，他人居左）、时间格式化（如“10:30”“今天 14:20”）、空消息提示

4. **MessageInput.jsx**：消息输入框，支持发送文本、表情（可选），禁止发送空消息，发送后清空输入框。

5. 核心逻辑：监听表单提交，通过 Socket 发送 send_message 事件，携带用户信息、消息内容、时间

6. 细节：输入时触发 user_typing 事件（告知对方“正在输入”），输入完成后取消

7. **RoomList.jsx**：展示所有可加入的房间（群聊）、私聊列表，点击切换房间，显示房间未读消息数。
     

8. 核心逻辑：通过 REST 接口获取房间列表，监听 Socket 的 room_message 事件，更新未读消息数

9. 细节：切换房间时，发送 join_room 事件，加载该房间的历史消息

10. **UserStatus.jsx**：显示当前在线用户列表，用户上线/下线时给出提示（如“XXX 已上线”）。
      

11. 核心逻辑：监听 Socket 的 user_connected、user_disconnected 事件，更新在线用户列表

### 3.2.3 路由设计

基于 Next.js App Router，实现路由守卫（未登录无法进入聊天页面）：

- /：首页（登录/注册入口）

- /login：登录页面（账号密码登录，验证通过后跳转至聊天页面）

- /register：注册页面（创建账号，注册成功后跳转至登录页面）

- /chat：聊天主页面（核心页面，未登录时重定向至 /login）

- /chat/[roomId]：指定房间聊天页面（可选，支持直接进入某个群聊/私聊）

### 3.2.4 关键功能实现细节

1. **Socket 重连机制**：通过 socket.io-client 的 reconnection 配置，实现断网后自动重连，重连成功后重新加入房间、加载未读消息。
     

2. **消息自动滚动**：使用 useEffect 监听消息列表变化，每次有新消息时，滚动至消息列表底部（通过 ref 获取列表 DOM 元素）。
      

3. **数据验证**：登录/注册表单、消息输入框均需验证（如用户名不为空、密码长度≥6位、消息不为空），使用 joi 实现验证逻辑。
      

4. **环境变量配置**：在 .env.local 中配置后端 API 地址（NEXT_PUBLIC_API_URL），区分开发、生产环境。
      

# 四、后端（Express）具体设计

## 4.1 项目目录结构

```plain text
server/
├── config/                 # 配置文件
│   ├── prisma/             # Prisma 配置（对接 Supabase PostgreSQL）
│   │   └── schema.prisma   # Prisma 数据模型定义
│   └── env.js              # 环境变量配置（Supabase 连接信息）
├── controllers/            # 控制器（处理业务逻辑）
│   ├── userController.js   # 用户相关（登录、注册）
│   ├── messageController.js # 消息相关（历史消息查询、持久化）
│   └── roomController.js   # 房间相关（创建、查询、加入）
├── middleware/             # 中间件
│   ├── auth.js             # 身份验证（验证用户ID合法性）
│   ├── validate.js         # 数据验证中间件
│   └── errorHandler.js     # 全局错误处理中间件
├── routes/                 # 路由（REST接口）
│   ├── userRoutes.js       # 用户路由（/api/users）
│   ├── messageRoutes.js    # 消息路由（/api/messages）
│   └── roomRoutes.js       # 房间路由（/api/rooms）
├── socket/                 # Socket 逻辑
│   ├── index.js            # Socket 初始化、事件监听
│   ├── messageHandlers.js  # 消息相关事件处理（发送、接收）
│   ├── roomHandlers.js     # 房间相关事件处理（加入、退出）
│   └── userHandlers.js     # 用户相关事件处理（上线、下线）
├── utils/                  # 工具函数
│   ├── formatTime.js       # 时间格式化
│   └── logger.js           # 日志记录（错误、请求日志）
├── server.js               # 后端入口文件（启动 Express、Socket 服务）
└── package.json            # 依赖配置
```

## 4.2 核心模块设计

### 4.2.1 Prisma + Supabase PostgreSQL 配置与数据模型

核心：通过 Prisma ORM 对接 Supabase PostgreSQL，定义数据模型（替代原 MongoDB 模型），实现类型安全的数据操作，Supabase 负责数据库托管、安全规则配置。

#### 1. Supabase 配置（env.js）

```javascript
// 从环境变量中获取 Supabase 连接信息（.env 文件中配置）
module.exports = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY,
  prismaUrl: process.env.DATABASE_URL // Supabase PostgreSQL 连接字符串（从 Supabase 控制台获取）
};

// .env 文件配置示例
// SUPABASE_URL=https://xxxx.supabase.co
// SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
// DATABASE_URL=postgresql://postgres:xxxx@xxxx.supabase.co:5432/postgres?schema=public
```

#### 2. Prisma 配置（schema.prisma）

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

// 连接 Supabase PostgreSQL（DATABASE_URL 从环境变量获取）
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户模型（替代原 MongoDB User 模型）
model User {
  id        String   @id @default(uuid()) // 主键，UUID 格式（Supabase 推荐）
  username  String   @unique @db.VarChar(50) // 用户名，唯一
  password  String   @db.VarChar(100) // 加密后的密码
  avatar    String   @default("https://default-avatar.png") // 默认头像
  online    Boolean  @default(false) // 在线状态
  socketId  String   @default("") // 关联的 Socket ID
  createdAt DateTime @default(now()) // 创建时间
  updatedAt DateTime @updatedAt // 更新时间
  messages  Message[] // 关联消息（一对多）
  rooms     RoomMember[] // 关联房间成员（多对多）

  @@index([socketId]) // 索引，提升 socketId 查询性能
  @@index([online]) // 索引，提升在线用户查询性能
}

// 消息模型（替代原 MongoDB Message 模型）
model Message {
  id        String   @id @default(uuid())
  senderId  String   // 发送者 ID（关联 User）
  receiverId String?  // 私聊接收者 ID（可选，群聊时为 null）
  roomId    String?  // 群聊房间 ID（可选，私聊时为 null）
  content   String   @db.Text // 消息内容，支持长文本
  isRead    Boolean  @default(false) // 已读状态
  sendTime  DateTime @default(now()) // 发送时间
  sender    User     @relation(fields: [senderId], references: [id], onDelete: Cascade) // 关联发送者
  room      Room?    @relation(fields: [roomId], references: [id], onDelete: Cascade) // 关联房间（可选）

  // 索引：提升查询性能
  @@index([senderId, receiverId, sendTime]) // 私聊消息查询索引
  @@index([roomId, sendTime]) // 群聊消息查询索引
  @@index([isRead]) // 未读消息查询索引
}

// 房间模型（替代原 MongoDB Room 模型）
model Room {
  id        String        @id @default(uuid())
  roomName  String        @db.VarChar(100) // 房间名称
  creatorId String        // 房间创建者 ID（关联 User）
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  creator   User          @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  members   RoomMember[]  // 房间成员（多对多关联 User）
  messages  Message[]     // 房间内消息（一对多）

  @@unique([roomName]) // 房间名称唯一
}

// 房间成员关联表（多对多关联 User 和 Room）
model RoomMember {
  id     String @id @default(uuid())
  userId String
  roomId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  room   Room   @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@unique([userId, roomId]) // 一个用户在一个房间中只能有一条记录
}

// 执行 prisma migrate dev 生成数据库表，同步到 Supabase PostgreSQL
// 执行 prisma generate 生成 Prisma Client，用于代码中操作数据库
```

#### 3. Prisma Client 初始化（utils/prisma.js）

```javascript
// 初始化 Prisma Client，全局单例，避免重复创建连接
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
```

### 4.2.2 Socket 核心逻辑设计（socket/index.js）

核心作用：初始化 Socket 服务，注册所有事件处理器，实现消息转发、房间管理、用户状态更新等逻辑，与 Express 共用一个 HTTP 端口，数据操作替换为 Prisma 语法。

```javascript
const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { handleConnection, handleDisconnect } = require('./userHandlers');
const { handleSendMessage, handleRoomMessage } = require('./messageHandlers');
const { handleJoinRoom, handleLeaveRoom } = require('./roomHandlers');

// 初始化Express和HTTP服务
const app = express();
const server = http.createServer(app);

// 跨域配置（允许前端域名访问）
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 初始化Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000, // 心跳超时时间（60秒）
  pingInterval: 25000 // 心跳发送间隔（25秒）
});

// 注册Socket事件
const initSocket = () => {
  // 监听客户端连接
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId; // 获取前端传递的用户ID
    if (!userId) {
      socket.disconnect(); // 无用户ID，拒绝连接
      return;
    }

    // 1. 用户连接事件（更新在线状态、Socket ID）
    handleConnection(socket, userId, io);

    // 2. 消息发送事件（私聊）
    socket.on('send_message', (data) => {
      handleSendMessage(socket, data, io);
    });

    // 3. 加入房间事件
    socket.on('join_room', (roomId) => {
      handleJoinRoom(socket, roomId, userId);
    });

    // 4. 房间内发送消息事件（群聊）
    socket.on('send_room_message', (data) => {
      handleRoomMessage(socket, data, io);
    });

    // 5. 离开房间事件
    socket.on('leave_room', (roomId) => {
      handleLeaveRoom(socket, roomId, userId);
    });

    // 6. 用户正在输入事件
    socket.on('user_typing', (data) => {
      socket.broadcast.emit('user_typing', data);
    });

    // 7. 用户停止输入事件
    socket.on('user_stop_typing', (data) => {
      socket.broadcast.emit('user_stop_typing', data);
    });

    // 8. 客户端断开连接事件
    socket.on('disconnect', () => {
      handleDisconnect(socket, userId, io);
    });
  });

  return { app, server, io };
};

module.exports = { initSocket };
```

### 4.2.3 Socket 事件处理器设计（示例：messageHandlers.js）

将不同类型的 Socket 事件拆分到不同的处理器文件，实现代码模块化，数据操作全部替换为 Prisma 语法（替代原 MongoDB 操作）。

```javascript
const prisma = require('../utils/prisma'); // 引入 Prisma Client

// 处理私聊消息发送
exports.handleSendMessage = async (socket, data, io) => {
  try {
    const { senderId, receiverId, content } = data;
    // 1. 验证数据（非空、合法）
    if (!senderId || !receiverId || !content.trim()) {
      socket.emit('message_error', { message: '消息内容不能为空' });
      return;
    }

    // 2. 保存消息到 Supabase PostgreSQL（通过 Prisma）
    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        sendTime: new Date()
      },
      // 关联查询发送者、接收者信息（替代原 populate）
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    // 3. 转发消息给接收者（通过Socket ID）
    const receiverSocket = io.sockets.sockets.get(receiverId);
    if (receiverSocket) {
      receiverSocket.emit('receive_message', newMessage);
    }

    // 4. 回传给发送者（确认发送成功）
    socket.emit('send_success', newMessage);
  } catch (error) {
    console.error('消息发送失败：', error);
    socket.emit('message_error', { message: '消息发送失败，请重试' });
  }
};

// 处理群聊消息发送
exports.handleRoomMessage = async (socket, data, io) => {
  try {
    const { senderId, roomId, content } = data;
    if (!senderId || !roomId || !content.trim()) {
      socket.emit('message_error', { message: '消息内容不能为空' });
      return;
    }

    // 保存消息到数据库（Prisma 操作）
    const newMessage = await prisma.message.create({
      data: {
        senderId,
        roomId,
        content,
        sendTime: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    // 转发消息到房间内所有成员（除了发送者）
    socket.to(roomId).emit('receive_room_message', newMessage);

    // 回传给发送者
    socket.emit('send_success', newMessage);
  } catch (error) {
    console.error('房间消息发送失败：', error);
    socket.emit('message_error', { message: '消息发送失败，请重试' });
  }
};
```

### 4.2.4 REST 接口设计（Prisma 实现）

提供 REST 接口，用于非实时操作（如登录、注册、查询历史消息、房间列表），数据操作全部基于 Prisma ORM，与 Socket 配合实现完整功能。

|接口路径|请求方法|功能描述|请求参数|返回结果|
|---|---|---|---|---|
|/api/users/register|POST|用户注册|username, password|用户信息（不含密码）、token|
|/api/users/login|POST|用户登录|username, password|用户信息、token|
|/api/messages/history|GET|获取历史消息|senderId, receiverId（私聊）/ roomId（群聊）|消息列表（按时间倒序）|
|/api/messages/read|PUT|标记消息为已读|messageId|更新后的消息信息|
|/api/rooms|GET|获取所有房间列表|无|房间列表（含成员数）|
|/api/rooms|POST|创建房间|roomName, creatorId|创建后的房间信息|
|/api/rooms/[roomId]/members|GET|获取房间成员|roomId|成员列表|
#### 接口实现示例（messageController.js）

```javascript
const prisma = require('../utils/prisma');

// 获取历史消息（私聊/群聊）
exports.getHistoryMessages = async (req, res, next) => {
  try {
    const { senderId, receiverId, roomId } = req.query;
    let messages;

    // 私聊历史消息
    if (senderId && receiverId) {
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId }
          ]
        },
        include: {
          sender: { select: { id: true, username: true, avatar: true } },
          receiver: { select: { id: true, username: true, avatar: true } }
        },
        orderBy: { sendTime: 'asc' }, // 按发送时间升序排列
        take: 100 // 限制获取最近100条消息
      });
    }
    // 群聊历史消息
    else if (roomId) {
      messages = await prisma.message.findMany({
        where: { roomId },
        include: {
          sender: { select: { id: true, username: true, avatar: true } }
        },
        orderBy: { sendTime: 'asc' },
        take: 100
      });
    } else {
      return res.status(400).json({ message: '请提供正确的查询参数' });
    }

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

// 标记消息为已读
exports.markMessageAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const message = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
      include: {
        sender: { select: { id: true, username: true } }
      }
    });

    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
};
```

### 4.2.5 中间件设计

1. **auth.js（身份验证中间件）**：验证用户 token 合法性，用于保护需要登录才能访问的 REST 接口，通过 Prisma 查询用户是否存在。
      

2. **validate.js（数据验证中间件）**：使用 joi 验证前端传入的请求参数，避免非法数据进入业务逻辑。
      

3. **errorHandler.js（全局错误处理中间件）**：统一捕获后端所有错误（包括 Prisma 数据库错误），返回标准化的错误响应（如状态码、错误信息），便于前端处理。

# 五、双向通信协议设计（Socket 事件规范）

前后端 Socket 事件名称、参数格式统一，避免通信异常，以下为核心事件规范（所有事件均需携带必要的用户/房间信息）：

## 5.1 前端 → 后端（发送事件）

|事件名称|参数格式|功能描述|
|---|---|---|
|send_message|{ senderId, receiverId, content }|发送私聊消息|
|join_room|{ roomId, userId }|加入指定房间（群聊）|
|send_room_message|{ senderId, roomId, content }|在房间内发送群聊消息|
|leave_room|{ roomId, userId }|离开指定房间|
|user_typing|{ userId, username, receiverId/roomId }|告知对方“正在输入”|
|user_stop_typing|{ userId, receiverId/roomId }||
> （注：文档部分内容可能由 AI 生成）