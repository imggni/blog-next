import type { Metadata } from "next";

import { ThemeProvider } from "@/lib/theme-provider";

import "./globals.css";

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
const defaultOgImage = "/images/monograph/hero.png";

export const metadata: Metadata = {
  title: {
    default: "lajBlog",
    template: "%s | lajBlog",
  },
  description: "一个基于 Next.js App Router 的个人博客与项目展示站点。",
  metadataBase: siteOrigin,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "lajBlog",
    description: "一个基于 Next.js App Router 的个人博客与项目展示站点。",
    url: "/",
    siteName: "lajBlog",
    locale: "zh_CN",
    type: "website",
    images: [{ url: defaultOgImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "lajBlog",
    description: "一个基于 Next.js App Router 的个人博客与项目展示站点。",
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: ["Next.js", "React", "TypeScript", "博客", "个人站点"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
