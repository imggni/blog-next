import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
  description: "了解这个博客项目的结构和构建方式。",
};

const highlights = [
  "使用 App Router 组织页面、布局与接口",
  "通过 Markdown 文件管理博客内容",
  "预留了 layout、blog、lib、types 等常用目录",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="rounded-3xl border border-border/70 bg-card px-6 py-10">
        <h1 className="text-4xl font-semibold tracking-tight">关于这个项目</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          这是一个围绕个人博客场景组织的 Next.js 项目骨架，重点在于把目录结构、可复用组件和内容读取逻辑提前整理清楚。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article key={item} className="rounded-2xl border border-border/70 bg-card p-5">
            <h2 className="font-medium">{item}</h2>
          </article>
        ))}
      </section>
    </div>
  );
}
