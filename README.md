# Next.js 项目

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

```bash
src/
├── app/                # App Router 核心（路由=文件夹）
│   ├── (main)/         # 路由分组（不影响 URL）
│   │   ├── layout.tsx  # 主布局（Header/Footer）
│   │   ├── page.tsx    # 首页 /
│   │   ├── about/page.tsx # 关于页 /about
│   │   ├── blog/
│   │   │   ├── page.tsx # 博客列表 /blog
│   │   │   └── [slug]/page.tsx # 文章详情 /blog/xxx
│   │   └── projects/page.tsx # 项目页 /projects
│   ├── api/            # API 路由（后端接口）
│   │   └── subscribe/route.ts # 订阅接口
│   ├── globals.css     # 全局样式（Tailwind）
│   └── layout.tsx      # 根布局（html/body、主题）
├── components/         # 可复用组件
│   ├── ui/             # shadcn/ui 基础组件
│   ├── layout/         # 布局组件（Header、Footer、Sidebar）
│   └── blog/           # 博客专用组件（PostCard、Search、Pagination）
├── lib/                # 工具/配置
│   ├── utils.ts        # 工具函数（日期、slug、markdown）
│   ├── posts.ts        # 文章数据读取（Markdown）
│   └── theme-provider.tsx # 暗黑模式 Provider
├── content/            # Markdown 文章（静态数据）
│   └── posts/
│       ├── nextjs-guide.md
│       └── trae-figma-mcp.md
├── public/             # 静态资源（图片、favicon）
└── types/              # TypeScript 类型定义
    └── post.ts
```