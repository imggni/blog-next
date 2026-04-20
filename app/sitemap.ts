import type { MetadataRoute } from "next";

import { getAllPosts } from "@/lib/posts";

function getSiteOrigin() {
  const value = process.env.NEXT_PUBLIC_SITE_URL;

  if (value) {
    try {
      return new URL(value);
    } catch {}
  }

  return new URL("http://localhost:1111");
}

const siteOrigin = getSiteOrigin();

function withOrigin(pathname: string) {
  return new URL(pathname, siteOrigin).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: withOrigin("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: withOrigin("/blog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: withOrigin("/projects"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: withOrigin("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: withOrigin(`/blog/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
