# 项目 SEO 优化说明

本文档汇总本项目已落地的 SEO 优化项、改动位置与验证方法，便于后续维护与扩展。

## 1. 全局基础 SEO（全站默认值）
文件：app/layout.tsx  
链接：[layout.tsx](file:///Users/lianji/Developer/img/next/blog-next/app/layout.tsx)

已配置内容：
- metadataBase：从环境变量 `NEXT_PUBLIC_SITE_URL` 推导站点根地址，确保所有相对链接（canonical、OG、sitemap 等）能生成正确的绝对 URL；本地默认回退为 `http://localhost:1111`
- 默认页面标题与模板：default + template
- 默认描述：覆盖全站基础描述
- canonical：设为根路径“/”，配合子页面的专属 canonical
- Open Graph（OG）：默认 title/description/url/siteName/locale/type/images
- Twitter Card：summary_large_image
- robots：默认允许索引与跟随
- keywords：全站关键词
- 默认 OG 图片：/images/monograph/hero.png

价值：
- 统一且完整的基础元数据，避免缺省导致的抓取与分享展示不一致
- metadataBase 让所有相对路径安全地转为绝对地址，利于搜索引擎与社交分享抓取

---

## 2. 博客列表页（动态 Metadata）
文件：app/(main)/blog/page.tsx  
链接：[page.tsx](file:///Users/lianji/Developer/img/next/blog-next/app/(main)/blog/page.tsx)

已配置内容：
- generateMetadata 基于 searchParams 生成动态 SEO：
  - 标题：携带搜索词或分页信息（如“博客 - 搜索：xxx”或“博客 - 第 N 页”）
  - 描述：按是否存在搜索词动态生成
  - canonical：分页时为 `/blog?page=N`；包含搜索词时回退 `/blog`
  - Open Graph 与 Twitter：与标题/描述保持一致
  - robots：当存在搜索词（站内搜索页）时自动 `noindex`、`follow`，避免低价值页面被索引

价值：
- 避免站内搜索页被索引引发的抓取冗余与权重稀释
- 明确的分页 canonical，减少重复内容判定

---

## 3. 博客详情页（文章级 SEO）
文件：app/(main)/blog/[slug]/page.tsx  
链接：[page.tsx](file:///Users/lianji/Developer/img/next/blog-next/app/(main)/blog/%5Bslug%5D/page.tsx)

已配置内容：
- generateMetadata：
  - alternates.canonical：/blog/[slug]
  - Open Graph：type 为 article，含 publishedTime、authors、tags、images
  - Twitter Card：summary_large_image
  - robots：index/follow
  - keywords：来自文章 tags
- 注入 JSON-LD 结构化数据（BlogPosting）：
  - headline、description、datePublished、author、mainEntityOfPage、url、image、keywords

价值：
- 更丰富的文章级语义与社交分享卡片，提高 SERP 展示质量
- 结构化数据利于搜索引擎理解页面实体，提升富媒体结果出现概率

---

## 4. robots 与 sitemap
文件：  
- app/robots.ts（动态生成 robots.txt）  
  链接：[robots.ts](file:///Users/lianji/Developer/img/next/blog-next/app/robots.ts)  
- app/sitemap.ts（动态生成 sitemap.xml）  
  链接：[sitemap.ts](file:///Users/lianji/Developer/img/next/blog-next/app/sitemap.ts)

已配置内容：
- robots.txt：
  - 允许全站抓取
  - 屏蔽 `/mall` 与 `/api`
  - 指向 sitemap.xml 的绝对地址（基于 `NEXT_PUBLIC_SITE_URL`）
- sitemap.xml：
  - 包含静态页面：`/`、`/blog`、`/projects`、`/about`
  - 自动包含所有博客详情页 `/blog/[slug]`（由 Markdown 文章生成）
  - 配置 lastModified、changeFrequency、priority

价值：
- 搜索引擎可明确抓取边界与优先入口
- 新文章能自动进入 sitemap，提升抓取时效性

---

## 5. 环境变量与部署要求
- 必填：`NEXT_PUBLIC_SITE_URL`（生产环境），示例：`https://yourdomain.com`
- 用途：用于生成 canonical、OG、robots 中的 sitemap 绝对链接、sitemap 的 URL 拼装等
- 本地开发如未设置，将回退为 `http://localhost:1111`

---

## 6. 验证与自测建议
- 构建与路由检查：
  - `npm run build` 后，确认输出包含 `○ /robots.txt` 与 `○ /sitemap.xml`
- 浏览器验证：
  - 打开 `/robots.txt` 与 `/sitemap.xml` 检查内容正确
  - 查看文章详情页源代码，确认 `<script type="application/ld+json">` 的 BlogPosting JSON-LD
  - 检查 `<head>` 中的 meta、OG、Twitter 标签是否按期望呈现
- 在线工具：
  - Google Rich Results Test 检查 JSON-LD
  - Search Console 提交 `sitemap.xml` 并观察索引
  - 分享至社交平台，查看分享卡片是否正确

---

## 7. 变更文件清单
- 全局默认 SEO：
  - [app/layout.tsx](file:///Users/lianji/Developer/img/next/blog-next/app/layout.tsx)
- 博客列表页（动态 Metadata + 搜索页 noindex）：
  - [app/(main)/blog/page.tsx](file:///Users/lianji/Developer/img/next/blog-next/app/(main)/blog/page.tsx)
- 博客详情页（文章级 OG/Twitter + JSON-LD）：
  - [app/(main)/blog/[slug]/page.tsx](file:///Users/lianji/Developer/img/next/blog-next/app/(main)/blog/%5Bslug%5D/page.tsx)
- robots 与 sitemap：
  - [app/robots.ts](file:///Users/lianji/Developer/img/next/blog-next/app/robots.ts)
  - [app/sitemap.ts](file:///Users/lianji/Developer/img/next/blog-next/app/sitemap.ts)

---

## 8. 后续可选优化（建议）
- 站点级 PWA manifest 与多尺寸 icons（`apple-touch-icon`、`mask-icon` 等）
- 面包屑/站点导航类 JSON-LD
- 文章封面图/摘要字段拓展，用于更优的 OG 展示
- 定期手动或自动化检查 Search Console 的抓取与索引异常