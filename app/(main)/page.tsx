import Link from "next/link";

import { PostCard } from "@/components/blog/post-card";
import { getAllPosts } from "@/lib/posts";

const featuredProjects = [
  {
    name: "Blog Next",
    description: "基于 App Router 的博客模板，适合文章、项目与个人主页展示。",
  },
  {
    name: "Design Workflow",
    description: "围绕设计稿、资源与组件生成构建统一的前端交付流程。",
  },
];

export default async function HomePage() {
  const posts = await getAllPosts();
  const featuredPosts = posts.slice(0, 2);

  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-border/70 bg-card px-6 py-10">
        <span className="rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">
          Next.js 博客模板
        </span>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          按页面、组件、内容与工具分层的博客项目骨架
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          首页、关于、博客、项目页和订阅接口都已经拆分完成，适合继续扩展文章系统、主题切换和项目展示。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/blog"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            查看博客
          </Link>
          <Link
            href="/projects"
            className="rounded-xl border border-border px-5 py-3 text-sm font-medium"
          >
            浏览项目
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">最新文章</h2>
              <p className="mt-2 text-sm text-muted-foreground">预置两篇 Markdown 文章作为内容示例。</p>
            </div>
            <Link href="/blog" className="text-sm font-medium text-primary">
              查看全部
            </Link>
          </div>
          <div className="space-y-4">
            {featuredPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-6">
          <h2 className="text-xl font-semibold tracking-tight">项目预览</h2>
          <div className="mt-5 space-y-4">
            {featuredProjects.map((project) => (
              <article key={project.name} className="rounded-2xl bg-accent p-4">
                <h3 className="font-medium">{project.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{project.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
