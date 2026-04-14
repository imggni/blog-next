---
title: "Next.js + Express + Prisma 开发常见问题与解决方案"
description: "在开发数码配件商城项目时遇到的典型技术问题及解决方案，涵盖前后端集成、数据库管理、认证安全等核心内容。"
date: "2026-04-13"
tags:
  - "Next.js"
  - "Express"
  - "Prisma"
  - "全栈开发"
---

# Next.js + Express + Prisma 开发常见问题与解决方案

在开发数码配件商城项目时，我遇到了一些常见的技术问题。本文总结了 Next.js 前端、Express 后端和 Prisma ORM 集成开发中的典型问题及解决方案。

## 1. Next.js 与 Express 后端的 API 集成问题

### 问题描述
在 Next.js 前端调用 Express 后端 API 时，经常遇到跨域（CORS）问题和请求失败的情况。

### 解决方案

**后端配置 CORS：**
```javascript
// src/index.js
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:1111', 'https://your-domain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**前端统一 API 请求封装：**
```typescript
// lib/api.ts
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const url = `${baseUrl}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const token = getStoredToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || data.code !== 200) {
      throw new ApiError(data.code, data.message);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, '网络错误，请稍后重试');
  }
}
```

## 2. Prisma 数据库迁移与类型同步问题

### 问题描述
在修改 Prisma schema 后，经常出现数据库结构与类型定义不同步的问题，导致查询失败。

### 解决方案

**理解 Prisma 命令的区别：**

| 命令 | 作用 | 改数据库 | 保留历史 | 适用场景 |
|------|------|----------|----------|----------|
| `prisma generate` | 生成 Prisma 客户端代码 | ❌ 不改 | ❌ 不保留 | 修改 model 后必须执行 |
| `prisma db push` | 将 schema 同步到数据库 | ✅ 会改 | ❌ 不保留 | 本地快速开发、测试 |
| `prisma migrate dev` | 生成数据库变更版本 | ✅ 会改 | ✅ 保留 | 正式开发、团队协作 |

**最佳实践：**
```bash
# 开发阶段
npx prisma generate          # 生成类型
npx prisma db push           # 快速同步到数据库

# 生产环境
npx prisma migrate dev --name add_user_field  # 创建迁移文件
npx prisma generate          # 生成类型
```

**数据库连接配置：**
```javascript
// src/config/db.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'pretty',
});

// 处理连接池
prisma.$connect()
  .then(() => console.log('数据库连接成功'))
  .catch((error) => console.error('数据库连接失败:', error));

module.exports = prisma;
```

## 3. JWT 认证与 Token 管理问题

### 问题描述
在前后端分离架构中，JWT token 的生成、验证和存储管理容易出现安全漏洞和过期问题。

### 解决方案

**后端 JWT 配置：**
```javascript
// src/config/jwt.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
```

**中间件验证：**
```javascript
// src/middleware/auth.js
const { verifyToken } = require('../config/jwt');
const createError = require('http-errors');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw createError(401, '请先登录');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    throw createError(401, '登录已过期，请重新登录');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });
  if (!user) {
    throw createError(401, '用户不存在');
  }

  req.user = user;
  next();
};
```

**前端 Token 存储：**
```typescript
// lib/auth.ts
const TOKEN_KEY = 'auth_token';

export const setStoredToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const removeStoredToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};
```

## 4. 文件上传与 Supabase Storage 集成

### 问题描述
在实现图片上传功能时，需要处理文件大小限制、格式验证和云存储集成。

### 解决方案

**后端文件上传中间件：**
```javascript
// src/middleware/upload.js
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 JPEG、PNG、WebP 格式的图片'));
    }
  },
});

const uploadToSupabase = async (file, folder = 'products') => {
  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    throw new Error('文件上传失败');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return publicUrl;
};

module.exports = { upload, uploadToSupabase };
```

## 5. TypeScript 类型定义与接口一致性

### 问题描述
前后端类型定义不一致导致运行时错误，维护成本高。

### 解决方案

**统一类型定义：**
```typescript
// types/api.ts
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface User {
  id: string;
  username: string;
  phone: string;
  avatar?: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Product {
  id: number;
  title: string;
  categoryId: number;
  category: Category;
  price: number;
  originalPrice?: number;
  stock: number;
  mainImage: string;
  detailImages?: string[];
  sales: number;
  isOnSale: boolean;
  isHot: boolean;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 6. 环境变量管理

### 问题描述
不同环境（开发、生产）的配置管理混乱，敏感信息泄露风险。

### 解决方案

**环境变量文件结构：**
```bash
# .env.local (本地开发)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# .env.production (生产环境)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# 后端 .env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
JWT_SECRET="..."
PORT=3000
```

**环境变量验证：**
```javascript
// src/config/env.js
const requiredEnvVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'JWT_SECRET',
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`缺少必要的环境变量: ${varName}`);
  }
});

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  jwtSecret: process.env.JWT_SECRET,
};
```

## 总结

在 Next.js + Express + Prisma 的全栈开发中，主要挑战在于：

1. **前后端集成**：正确处理 CORS、API 封装和错误处理
2. **数据库管理**：理解 Prisma 命令的区别，正确使用迁移工具
3. **认证安全**：实现安全的 JWT 认证流程
4. **文件处理**：合理配置文件上传和云存储
5. **类型安全**：保持前后端类型定义的一致性
6. **配置管理**：妥善管理不同环境的配置

通过以上解决方案，可以构建一个稳定、安全、易维护的全栈应用。