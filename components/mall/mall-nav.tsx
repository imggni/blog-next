import Link from "next/link";

import { Button } from "@/components/ui/button";

const mallNavigationItems = [
  { href: "/mall", label: "商城首页" },
  { href: "/mall/product", label: "商品" },
  { href: "/mall/order", label: "订单" },
  { href: "/mall/collection", label: "收藏" },
  { href: "/mall/profile", label: "个人中心" },
  { href: "/mall/admin", label: "后台" },
];

export function MallNav() {
  return (
    <header className="border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/mall" className="text-lg font-semibold tracking-tight">
          Mall
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          {mallNavigationItems.map((item) => (
            <Button key={item.href} variant="ghost" size="sm" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/mall/login">登录</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/mall/register">注册</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
