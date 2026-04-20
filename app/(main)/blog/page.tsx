import type { Metadata } from "next";

import { Pagination } from "@/components/blog/pagination";
import { PostCard } from "@/components/blog/post-card";
import { Search } from "@/components/blog/search";
import { getAllPosts } from "@/lib/posts";

const pageSize = 10;

function toSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; query?: string | string[] }>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = toSingleValue(resolvedSearchParams.query).trim();
  const requestedPage = Number(toSingleValue(resolvedSearchParams.page) || "1");
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const normalizedQuery = query.toLowerCase();
  const titleParts = ["博客"];

  if (normalizedQuery) {
    titleParts.push(`搜索：${normalizedQuery}`);
  } else if (currentPage > 1) {
    titleParts.push(`第 ${currentPage} 页`);
  }

  const title = titleParts.join(" - ");
  const description = normalizedQuery
    ? `“${normalizedQuery}” 的搜索结果。`
    : "浏览博客文章列表，支持基础搜索与分页。";
  const canonical = normalizedQuery ? "/blog" : currentPage > 1 ? `/blog?page=${currentPage}` : "/blog";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: normalizedQuery
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; query?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = toSingleValue(resolvedSearchParams.query).trim().toLowerCase();
  const requestedPage = Number(toSingleValue(resolvedSearchParams.page) || "1");
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const posts = await getAllPosts();

  const filteredPosts = posts.filter((post) => {
    const searchableText = [post.title, post.description, post.excerpt, ...post.tags]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = filteredPosts.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">博客文章</h1>
        <p className="text-base leading-7 text-muted-foreground">
          当前文章内容来自 content/posts 目录中的 Markdown 文件。
        </p>
      </section>

      <Search defaultValue={query} />

      <section className="space-y-4">
        {paginatedPosts.length > 0 ? (
          paginatedPosts.map((post) => <PostCard key={post.slug} post={post} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            没有找到匹配的文章。
          </div>
        )}
      </section>

      <Pagination currentPage={safePage} totalPages={totalPages} query={query} />
    </div>
  );
}
