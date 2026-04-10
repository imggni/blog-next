import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mallAddresses } from "@/lib/mall-mock";

export const metadata: Metadata = {
  title: "地址管理",
};

export default function MallAddressPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">地址管理</h1>
          <p className="text-sm text-muted-foreground">维护收货地址与默认地址（页面骨架）。</p>
        </div>
        <Button>新增地址</Button>
      </header>

      <section className="grid gap-4">
        {mallAddresses.map((address) => (
          <Card key={address.id} className="rounded-2xl border border-border/70 bg-card">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {address.receiverName} <span className="text-sm text-muted-foreground">{address.phone}</span>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {address.province}
                  {address.city}
                  {address.district}
                  {address.detail}
                </div>
              </div>
              {address.isDefault ? <Badge>默认</Badge> : <Badge variant="secondary">非默认</Badge>}
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                编辑
              </Button>
              <Button variant="outline" size="sm">
                删除
              </Button>
              {!address.isDefault ? (
                <Button size="sm" variant="secondary">
                  设为默认
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
