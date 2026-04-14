'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/hooks/use-auth-store';

const mallNavigationItems = [
  { href: '/mall', label: '商城首页' },
  { href: '/mall/product', label: '商品' },
  { href: '/mall/order', label: '订单' },
  { href: '/mall/collections', label: '收藏' },
  { href: '/mall/profile', label: '个人中心' },
  { href: '/mall/admin', label: '后台', adminOnly: true },
];

export function MallNav() {
  const router = useRouter();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setUserFromInfo = useAuthStore((state) => state.setUserFromInfo);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isHydrated || !token || user) {
      return;
    }

    userApi
      .getInfo()
      .then((response) => {
        setUserFromInfo(response.data);
      })
      .catch(() => {
        clearAuth();
      });
  }, [clearAuth, isHydrated, setUserFromInfo, token, user]);

  const handleLogout = () => {
    clearAuth();
    setMenuOpen(false);
    router.push('/mall/login');
  };

  const isAuthenticated = Boolean(token);
  const initials = user?.username
    ? user.username
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <header className="border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/mall" className="text-lg font-semibold tracking-tight">
          lajMall
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {mallNavigationItems
            .filter((item) => !item.adminOnly || user?.isAdmin)
            .map((item) => (
              <Button key={item.href} variant="ghost" size="sm" asChild>
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          {isHydrated && isAuthenticated ? (
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <div
                onMouseEnter={() => setMenuOpen(true)}
                onMouseLeave={() => setMenuOpen(false)}
                className="relative"
              >
                <DropdownMenuTrigger asChild>   
                  <Button className="inline-flex items-center gap-2 rounded-full px-3" variant="ghost" size="sm">
                    <Avatar size="sm">
                      <AvatarImage src="https://avatars.githubusercontent.com/u/124599?v=4" alt="shadcn" />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    {user?.username ?? '账户'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/mall/profile">个人中心</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mall/order">我的订单</Link>
                  </DropdownMenuItem>
                  {user?.isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link href="/mall/admin">后台管理</Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </div>
            </DropdownMenu>
          ) : isHydrated ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/mall/login">登录</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/mall/register">注册</Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
