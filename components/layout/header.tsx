import Link from "next/link";

const navigationItems = [
  { href: "/", label: "首页" },
  { href: "/about", label: "关于" },
  { href: "/blog", label: "博客" },
  { href: "/projects", label: "项目" },
  { href: "/mall", label: "商城", target: "_blank" },
];

export function Header() {
  return (
    <header className="border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          lajBlog
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.target || "_self"}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
