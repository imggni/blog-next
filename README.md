# blog-next

Next.js App Router（Next 16 + React 19）项目，包含：
- Blog：Markdown 文章渲染与列表/详情页
- Mall：数码配件商城（商品、分类、订单、收藏、地址、后台管理）

## 快速开始

```bash
npm install
npm run dev   # http://localhost:1111
npm run lint
npm run build
```

## 环境变量

- `NEXT_PUBLIC_API_URL`：后端 API Base URL（默认 `http://localhost:3000/api`）

## 目录结构

```bash
app/                    # App Router 路由（默认 Server Components）
  (main)/               # 主站（blog/projects/...）
  (mall)/mall/          # 商城（前台 + 后台）
components/
  ui/                   # shadcn/ui 组件（基础原子组件）
  mall/                 # 商城业务组件（分页、图标、导航等）
lib/
  mall/server/          # API clients（按功能拆分：user/product/order/...）
  mall/order-constants.ts # 订单状态/支付状态/支付方式常量 + 映射
  utils.ts              # cn() + markdown/date 等工具
content/posts/          # Markdown 博客文章
public/                 # 静态资源
types/
  api.ts                # API DTOs + 通用分页类型
  post.ts               # 博客类型
```

## API 约定

- 统一请求封装：`lib/mall/server/request.ts`（`apiRequest()` / `ApiError`）
- 统一导出入口：`lib/api.ts`（re-export `lib/mall/server/*`）
- 列表接口可能返回两种形态：
  - `T[]`
  - `{ data: T[]; pagination: { page; pageSize; total; totalPages } }`
  - 相关类型见 `types/api.ts`：`PaginatedResponse<T>`, `ProductListResponse`, `OrderListResponse`

## Next.js 注意事项

- 需要交互（hooks、事件）时才加 `"use client"`
- Next.js 16 动态参数 `params/searchParams` 在 Client Component 中是 Promise，需要用 `React.use()` 解包后再读字段

## 维护说明

- 详细协作约定见 [AGENTS.md](./AGENTS.md)
