import Link from "next/link";

interface SidebarProps {
  title?: string;
  items: Array<{
    href: string;
    label: string;
    description?: string;
  }>;
}

export function Sidebar({ title = "快速导航", items }: SidebarProps) {
  return (
    <aside className="rounded-2xl border border-border/70 bg-card p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-xl border border-transparent px-3 py-2 transition-colors hover:border-border hover:bg-accent"
          >
            <p className="font-medium">{item.label}</p>
            {item.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </aside>
  );
}
