import type { Metadata } from "next";

import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "项目",
  description: "展示博客模板中的项目模块示例。",
};

const projects = [
  {
    name: "内容型博客站点",
    description: "文章列表、详情页和分类标签是这个模板的核心内容能力。",
  },
  {
    name: "项目展示页面",
    description: "适合补充作品集、案例介绍和技术栈说明。",
  },
  {
    name: "订阅接口",
    description: "通过 route handler 暴露基础订阅 API，后续可对接邮件服务。",
  },
];

const quickLinks = [
  { href: "/blog", label: "博客列表", description: "查看当前项目预置的文章内容" },
  { href: "/about", label: "项目说明", description: "了解目录结构和模块职责" },
  { href: "/", label: "返回首页", description: "回到博客首页概览" },
];

export default function ProjectsPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <section className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">项目展示</h1>
        <p className="text-base leading-7 text-muted-foreground">
          这里预留给作品集和案例展示。当前用三个模块说明博客模板已经拆好的基础能力。
        </p>
        <div className="grid gap-4">
          {projects.map((project) => (
            <article key={project.name} className="rounded-2xl border border-border/70 bg-card p-6">
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{project.description}</p>
            </article>
          ))}
        </div>
      </section>

      <Sidebar title="继续浏览" items={quickLinks} />
    </div>
  );
}
