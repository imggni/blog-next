'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { userApi, ApiError } from '@/lib/api';
import { UserLoginRequest } from '@/types/api';
import { toast } from 'sonner';
import { setAuthStorage, StoredUser } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserLoginRequest>({
    phone: '',
    code: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await userApi.login(formData);
      const token = response.data.token;
      const isAdmin = response.data.isAdmin;
      const nextUser: StoredUser = {
        username: response.data.username || response.data.phone,
        phone: response.data.phone,
        isAdmin: response.data.isAdmin,
        avatar: response.data.avatar,
      };

      setAuthStorage(token, nextUser);

      toast.success('登录成功，正在跳转...');
      router.push(isAdmin ? '/mall/admin' : '/mall');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '登录失败，请稍后重试';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>请输入手机号和验证码登录</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="请输入手机号"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">验证码</Label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="请输入验证码"
                value={formData.code}
                onChange={handleInputChange}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              还没有账号？
              <a href="/mall/register" className="text-blue-600 hover:underline">
                立即注册
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}