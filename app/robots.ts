import type { MetadataRoute } from "next";

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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/mall", "/api"],
      },
    ],
    sitemap: new URL("/sitemap.xml", siteOrigin).toString(),
  };
}
