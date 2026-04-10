import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "登录",
};

export default function MallLoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>手机号验证码登录</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input id="phone" name="phone" placeholder="请输入手机号" inputMode="tel" autoComplete="tel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">验证码</Label>
              <div className="flex gap-2">
                <Input id="code" name="code" placeholder="请输入验证码" inputMode="numeric" autoComplete="one-time-code" />
                <Button type="button" variant="outline">
                  获取验证码
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full">
              登录
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            还没有账号？{" "}
            <Link href="/mall/register" className="text-primary hover:underline">
              去注册
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
