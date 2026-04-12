'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { userApi, ApiError } from '@/lib/api';
import { clearAuthStorage, getStoredUser, setAuthStorage, StoredUser } from '@/lib/auth';

const mallNavigationItems = [
  { href: '/mall', label: '商城首页' },
  { href: '/mall/product', label: '商品' },
  { href: '/mall/order', label: '订单' },
  { href: '/mall/collection', label: '收藏' },
  { href: '/mall/profile', label: '个人中心' },
  { href: '/mall/admin', label: '后台' },
];

export function MallNav() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      return;
    }

    userApi
      .getInfo()
      .then((response) => {
        const nextUser: StoredUser = {
          username: response.data.username || response.data.phone,
          phone: response.data.phone,
          isAdmin: response.data.isAdmin,
          avatar: response.data.avatar,
        };
        setAuthStorage(window.localStorage.getItem('mall_token') ?? '', nextUser);
        setUser(nextUser);
      })
      .catch(() => {
        clearAuthStorage();
        setUser(null);
      });
  }, []);

  const handleLogout = () => {
    clearAuthStorage();
    setUser(null);
    setMenuOpen(false);
    router.push('/mall/login');
  };

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
          {user ? (
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <div
                onMouseEnter={() => setMenuOpen(true)}
                onMouseLeave={() => setMenuOpen(false)}
                className="relative"
              >
                <DropdownMenuTrigger asChild>
                  <Button className="inline-flex items-center gap-2 rounded-full px-3" variant="ghost" size="sm">
                    <Avatar size="sm">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden min-w-24 truncate sm:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/mall/profile">个人中心</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mall/order">我的订单</Link>
                  </DropdownMenuItem>
                  {user.isAdmin ? (
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
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/mall/login">登录</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/mall/register">注册</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
