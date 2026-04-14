"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { categoryApi, ApiError } from '@/lib/api';
import { CategoryIcon } from "@/components/mall/category-icon";

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  sort?: number;
}

export default function CategoryAdminClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await categoryApi.getList();

        const maybe = res as unknown as Record<string, unknown>;
        let data: unknown;
        if (Array.isArray(maybe?.data)) {
          data = maybe.data;
        } else if (Array.isArray(res)) {
          data = res;
        } else {
          data = [];
        }

        if (Array.isArray(data)) {
          if (mounted) setCategories(data as Category[]);
        } else {
          if (mounted) setCategories([]);
        }
      } catch (err) {
        if (err instanceof ApiError) setError(err.message);
        else setError('获取分类失败');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) => {
        const keyword = search.trim().toLowerCase();
        return (
          !keyword ||
          category.name.toLowerCase().includes(keyword) ||
          (category.icon ?? '').toLowerCase().includes(keyword)
        );
      }),
    [categories, search]
  );

  const total = categories.length;
  const withIcon = categories.filter((category) => !!category.icon).length;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-linear-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 p-6 shadow-2xl shadow-slate-950/20">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70 shadow-sm shadow-slate-950/20">
              后台 · 分类管理
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight">分类管理控制台</h1>
              <p className="max-w-2xl text-sm text-slate-300">
                以可视化方式管理商城分类，支持搜索、快速跳转和状态预览。让后台体验更顺滑、更有质感。
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <Link href="/mall/admin/category/new" className="w-full sm:w-auto">
              <Button size="sm">新增分类</Button>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{total} 条分类</Badge>
              <Badge variant="secondary">{withIcon} 个图标</Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Card className="rounded-[1.75rem] border border-border/70 bg-card/90 shadow-xl shadow-slate-950/10">
          <CardHeader className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>分类一览</CardTitle>
                <CardDescription>搜索并查看当前分类，快速进入编辑或删除操作。</CardDescription>
              </div>
              <Badge variant="outline">{filteredCategories.length} 条结果</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <Label htmlFor="category-search">快速搜索</Label>
                <Input
                  id="category-search"
                  placeholder="输入分类名称或图标关键字"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
                  <div className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-500">总分类</div>
                  <div className="mt-2 text-3xl font-semibold text-white">{total}</div>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
                  <div className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-500">带图标</div>
                  <div className="mt-2 text-3xl font-semibold text-white">{withIcon}</div>
                </div>
              </div>
            </div>

            {loading && (
              <div className="rounded-3xl border border-dashed border-slate-500/40 bg-slate-950/70 p-6 text-center text-sm text-slate-300">
                加载中，请稍候…
              </div>
            )}

            {error && (
              <div className="rounded-3xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {!loading && filteredCategories.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-500/40 bg-slate-950/70 p-8 text-center text-sm text-slate-300">
                暂无匹配分类，试试更换关键字或新增分类。
              </div>
            )}

            <div className="grid gap-3">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="group rounded-[1.5rem] border border-border/70 bg-background/80 p-4 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_20px_50px_-30px_rgba(14,165,233,0.45)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary/10 text-3xl text-primary shadow-sm shadow-primary/10">
                        <CategoryIcon icon={category.icon} name={category.name} size={24} />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{category.name}</div>
                        <div className="text-sm text-muted-foreground">排序：{category.sort ?? 0}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* <Badge variant="outline">{category.icon || '未设置图标'}</Badge> */}
                      <Button size="sm">编辑</Button>
                      <Button variant="destructive" size="sm">删除</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border border-border/70 bg-linear-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 p-6 text-white shadow-xl shadow-slate-950/15">
          <CardHeader>
            <CardTitle>分类洞察</CardTitle>
            <CardDescription>当前分类管理的视觉概况与优化建议</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[1.5rem] bg-white/5 p-4 text-sm text-slate-300">
              <div className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-500">推荐方案</div>
              <p className="mt-3 leading-6">
                将常用分类置顶，并保持图标风格统一。后续还可以补充排序拖拽、批量操作和图标预览。
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/5 p-4 text-sm text-slate-300">
              <div className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-500">开发提示</div>
              <p className="mt-3 leading-6">
                当前列表基于 shadcn 组件展示，后续可接入真实管理 API、权限校验和批量操作接口。
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-between gap-2">
            <Link href="/mall/admin/product" className="w-full sm:w-auto">
              <Button size="sm">前往商品管理</Button>
            </Link>
            <Link href="/mall/admin/order" className="w-full sm:w-auto">
              <Button size="sm">查看订单</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
