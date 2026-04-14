import type { Metadata } from "next";

import { ThemeProvider } from "@/lib/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Blog Next",
    template: "%s | Blog Next",
  },
  description: "一个基于 Next.js App Router 的个人博客与项目展示站点。",
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
