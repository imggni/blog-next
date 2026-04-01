import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { getAllPosts, getPostBySlug, getPostSlugs } from "@/lib/posts";
import { formatDate, parseMarkdown } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await getPostSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "文章不存在",
    };
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([getPostBySlug(slug), getAllPosts()]);

  if (!post) {
    notFound();
  }

  const blocks = parseMarkdown(post.content);
  const relatedPosts = posts
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3)
    .map((item) => ({
      href: `/blog/${item.slug}`,
      label: item.title,
      description: item.description,
    }));

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <article className="rounded-3xl border border-border/70 bg-card px-6 py-8">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{post.title}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{post.description}</p>

        <div className="mt-8 space-y-6">
          {blocks.map((block, index) => {
            if (block.type === "heading") {
              if (block.level === 1) {
                return (
                  <h2 key={`${block.type}-${index}`} className="text-3xl font-semibold tracking-tight">
                    {block.content}
                  </h2>
                );
              }

              if (block.level === 2) {
                return (
                  <h3 key={`${block.type}-${index}`} className="text-2xl font-semibold tracking-tight">
                    {block.content}
                  </h3>
                );
              }

              return (
                <h4 key={`${block.type}-${index}`} className="text-xl font-semibold tracking-tight">
                  {block.content}
                </h4>
              );
            }

            if (block.type === "list") {
              return (
                <ul key={`${block.type}-${index}`} className="space-y-3 pl-5 text-base leading-7">
                  {block.items.map((item) => (
                    <li key={item} className="list-disc">
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }

            if (block.type === "code") {
              return (
                <pre
                  key={`${block.type}-${index}`}
                  className="overflow-x-auto rounded-2xl bg-accent p-4 text-sm leading-6"
                >
                  <code>{block.content}</code>
                </pre>
              );
            }

            return (
              <p key={`${block.type}-${index}`} className="text-base leading-7">
                {block.content}
              </p>
            );
          })}
        </div>
      </article>

      <Sidebar title="相关文章" items={relatedPosts} />
    </div>
  );
}
