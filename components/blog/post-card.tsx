import Link from "next/link";

import { formatDate } from "@/lib/utils";
import type { PostSummary } from "@/types/post";

interface PostCardProps {
  post: PostSummary;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card p-6 transition-transform hover:-translate-y-0.5">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground">
            {tag}
          </span>
        ))}
      </div>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight">
        <Link href={`/blog/${post.slug}`} className="hover:text-primary">
          {post.title}
        </Link>
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{post.description}</p>
      <p className="mt-4 text-sm leading-6">{post.excerpt}</p>
      <Link
        href={`/blog/${post.slug}`}
        className="mt-5 inline-flex items-center text-sm font-medium text-primary"
      >
        阅读全文
      </Link>
    </article>
  );
}
