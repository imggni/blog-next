import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">商城后台</h1>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/mall/admin/category">分类管理</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/mall/admin/product">商品管理</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/mall">返回商城</Link>
          </Button>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
