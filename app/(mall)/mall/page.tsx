import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CategoryList } from '@/components/mall/category-list';
import { MallSearch } from "@/components/mall/mall-search";

export const metadata: Metadata = {
  title: "炫酷商城首页",
  description: "数字配件商城首页，展示热门商品、分类推荐与限时优惠。",
};


const highlights = [
  {
    title: "爆款推荐",
    description: "热门爆款，限时折扣，马上抢购。",
    badge: "限时",
  },
  {
    title: "新品首发",
    description: "最新数码配件，潮流设计及时尚体验。",
    badge: "新品",
  },
  {
    title: "快速配送",
    description: "全国极速发货，48小时内到达。",
    badge: "极速",
  },
];

const products = [
  {
    name: "炫彩机械键盘",
    price: "¥399",
    tag: "热销",
    description: "RGB 背光 + 轻量轴体，畅快输入体验。",
  },
  {
    name: "高保真无线耳机",
    price: "¥599",
    tag: "爆款",
    description: "主动降噪，长续航，沉浸音质。",
  },
  {
    name: "迷你游戏手柄",
    price: "¥249",
    tag: "新品",
    description: "掌控手感与响应速度，手游神器。",
  },
];

export default function MallHomePage() {
  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-10 text-white shadow-2xl shadow-slate-950/20 md:px-12 md:py-16">
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <Badge className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm text-white shadow-sm shadow-slate-950/20">
              炫酷大促 · 全站低至 7 折
            </Badge>
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold tracking-tight xl:text-6xl">
                数码配件商城，
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-400">
                  玩转科技潮流
                </span>
              </h1>
              <p className="max-w-2xl text-lg text-slate-300">
                精选热门商品、限时促销、潮流新品。为你的办公、游戏、影音体验带来更酷的升级。
              </p>
            </div>

            <MallSearch inputClassName="bg-white/10 text-white placeholder:text-slate-300" buttonClassName="h-12" />

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <Card key={item.title} className="rounded-3xl border-white/10 bg-white/5 px-5 py-6 text-white shadow-xl shadow-slate-950/20">
                  <CardHeader className="space-y-2 px-0 pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-base font-semibold text-white">{item.title}</CardTitle>
                      <Badge className="rounded-full bg-white/10 text-white">{item.badge}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="px-0 pt-2">
                    <CardDescription className="text-sm text-slate-300">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative isolate rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
            <div className="absolute rounded-[2rem] inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/20 via-transparent to-transparent" />
            <div className="relative space-y-6">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6 shadow-lg shadow-slate-950/20">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-300">新品上架</p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">潮流智能腕表</h2>
                  </div>
                  <Badge className="rounded-full bg-cyan-500/15 text-cyan-300">新品</Badge>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  轻薄外观、运动心率监测、全天续航，陪你开启高阶出行方式。
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5 text-white">
                  <CardTitle className="text-lg font-semibold">超低价</CardTitle>
                  <CardDescription className="mt-2 text-sm text-slate-300">限时折扣、爆款直降，入手更划算。</CardDescription>
                </Card>
                <Card className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5 text-white">
                  <CardTitle className="text-lg font-semibold">极速配送</CardTitle>
                  <CardDescription className="mt-2 text-sm text-slate-300">全国发货，48h 内极速送达。</CardDescription>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.16),transparent_30%)]" />
      </section>

      <section className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">热门分类</h2>
            <p className="mt-2 text-sm text-muted-foreground">直达你的心仪品类，快速找到最潮好物。</p>
          </div>
          <Button variant="link" asChild>
            <Link href="/mall/product">查看全部商品</Link>
          </Button>
        </div>

        <CategoryList />
      </section>

      <Separator />

      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">精选爆款</p>
            <h2 className="text-3xl font-semibold tracking-tight">本周热销推荐</h2>
          </div>
          <Button asChild>
            <Link href="/mall/product">立即前往</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <Card key={product.name} className="group overflow-hidden rounded-[1.75rem] border border-border/70 bg-card p-6 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold">{product.name}</CardTitle>
                  <CardDescription className="mt-2 text-sm text-muted-foreground">{product.description}</CardDescription>
                </div>
                <Badge className="rounded-full bg-emerald-500/10 text-emerald-400">{product.tag}</Badge>
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{product.price}</p>
                  <p className="text-sm text-slate-500">热度持续上升</p>
                </div>
                <Button variant="secondary" size="sm">加入购物车</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
