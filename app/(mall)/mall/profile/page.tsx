'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { userApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/hooks/use-auth-store';
import { UserInfoData } from '@/types/api';
import { toast } from 'sonner';

export default function MallProfilePage() {
  const router = useRouter();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const token = useAuthStore((state) => state.token);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setUserFromInfo = useAuthStore((state) => state.setUserFromInfo);
  const [userInfo, setUserInfo] = useState<UserInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!token) {
      router.replace('/mall/login');
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const response = await userApi.getInfo();
        setUserInfo(response.data);
        setUserFromInfo(response.data);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : '获取用户信息失败';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [isHydrated, router, setUserFromInfo, token]);

  const handleLogout = () => {
    clearAuth();
    toast.success('已退出登录');
    router.push('/mall');
  };

  if (!isHydrated || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>获取用户信息失败</CardTitle>
            <CardDescription>{error || '请重新登录'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/mall/login')} className="w-full">
              去登录
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">个人中心</h1>
          <p className="text-sm text-muted-foreground">管理您的账户信息和订单</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/mall">返回商城首页</Link>
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 用户信息卡片 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>用户信息</CardTitle>
            <CardDescription>您的基本信息和账户状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userInfo.avatar} alt={userInfo.username} />
                <AvatarFallback>{userInfo.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{userInfo.username}</h3>
                <p className="text-sm text-muted-foreground">{userInfo.phone}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant={userInfo.isAdmin ? 'default' : 'secondary'}>
                    {userInfo.isAdmin ? '管理员' : '普通用户'}
                  </Badge>
                </div>
              </div>
            </div>
            <Separator />
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">注册时间</span>
                <span>{new Date(userInfo.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">用户ID</span>
                <span>{userInfo.id}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                编辑信息
              </Button>
              <Button variant="outline" size="sm">
                上传头像
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 快捷操作 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/mall/orders">
                  <span>我的订单</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/mall/addresses">
                  <span>地址管理</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/mall/collections">
                  <span>我的收藏</span>
                </Link>
              </Button>
              <Separator />
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                退出登录
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 其他功能模块 */}
      {userInfo.isAdmin ? (
        <Card className="border border-border/70 bg-card">
          <CardHeader>
            <CardTitle>管理员入口</CardTitle>
            <CardDescription>仅管理员可见，进入商城后台进行管理操作</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              当前账号拥有后台管理权限，可管理商品、订单和分类。
            </p>
            <Button asChild className="w-full">
              <Link href="/mall/admin">进入后台管理</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border/70 bg-card">
          <CardHeader>
            <CardTitle>管理员功能</CardTitle>
            <CardDescription>您当前不是管理员，后台入口不可见</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              只有管理员账户才能访问后台管理页面和管理员操作。
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>订单管理</CardTitle>
            <CardDescription>查看和管理您的订单</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/mall/orders">查看订单</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>地址管理</CardTitle>
            <CardDescription>管理收货地址</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/mall/addresses">管理地址</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>收藏夹</CardTitle>
            <CardDescription>查看收藏的商品</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/mall/collections">查看收藏</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
