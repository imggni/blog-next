import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";

import matter from "gray-matter";

import type { PostDetail, PostFrontmatter, PostSummary } from "@/types/post";

const postsDirectory = path.join(process.cwd(), "content", "posts");

function isValidFrontmatter(data: unknown): data is PostFrontmatter {
  if (!data || typeof data !== "object") {
    return false;
  }

  const frontmatter = data as Partial<PostFrontmatter>;

  return (
    typeof frontmatter.title === "string" &&
    typeof frontmatter.description === "string" &&
    typeof frontmatter.date === "string" &&
    Array.isArray(frontmatter.tags) &&
    frontmatter.tags.every((tag) => typeof tag === "string")
  );
}

export const getPostSlugs = cache(async () => {
  const fileNames = await fs.readdir(postsDirectory);

  return fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""));
});

async function readPostFile(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = await fs.readFile(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  if (!isValidFrontmatter(data)) {
    throw new Error(`Invalid frontmatter for post: ${slug}`);
  }

  return {
    slug,
    content,
    ...data,
  };
}

function getExcerpt(content: string) {
  const compactContent = content
    .replace(/^#+\s+/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/-\s+/g, "")
    .replace(/\n+/g, " ")
    .trim();

  return compactContent.slice(0, 120).trimEnd() + (compactContent.length > 120 ? "..." : "");
}

export const getAllPosts = cache(async (): Promise<PostSummary[]> => {
  const slugs = await getPostSlugs();
  const posts = await Promise.all(slugs.map(readPostFile));

  return posts
    .map(({ content, ...post }) => ({
      ...post,
      excerpt: getExcerpt(content),
    }))
    .sort((left, right) => right.date.localeCompare(left.date));
});

export const getPostBySlug = cache(async (slug: string): Promise<PostDetail | null> => {
  try {
    const post = await readPostFile(slug);

    return {
      ...post,
      excerpt: getExcerpt(post.content),
    };
  } catch {
    return null;
  }
});
