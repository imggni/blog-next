'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/hooks/use-auth-store';
import { addressApi, collectionApi, orderApi, productApi, ApiError } from '@/lib/api';
import { Address, Product } from '@/types/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const isHydrated = useAuthStore((state) => state.isHydrated);
  const token = useAuthStore((state) => state.token);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isCollected, setIsCollected] = useState(false);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [payType, setPayType] = useState<'wechat' | 'alipay'>('wechat');
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setLoading(true);
      setError('');

      try {
        const response = await productApi.getDetail(Number(id));
        setProduct(response.data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('获取商品详情失败');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!isHydrated || !token || !product) {
      return;
    }

    collectionApi
      .getList()
      .then((response) => {
        setIsCollected(response.data.some((item) => item.productId === product.id));
      })
      .catch(() => {
        setIsCollected(false);
      });
  }, [isHydrated, product, token]);

  useEffect(() => {
    if (!product?.specs) {
      return;
    }

    const initialSelected: Record<string, string> = {};
    for (const [key, value] of Object.entries(product.specs)) {
      if (Array.isArray(value) && value.length > 0) {
        initialSelected[key] = String(value[0]);
      }
    }
    setSelectedSpecs(initialSelected);
  }, [product?.specs]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || '商品不存在'}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/mall/product">返回商品列表</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleToggleCollection = async () => {
    if (!isHydrated) {
      return;
    }

    if (!token) {
      router.push('/mall/login');
      return;
    }

    setCollectionLoading(true);
    try {
      if (isCollected) {
        await collectionApi.remove(product.id);
        setIsCollected(false);
        toast.success('已取消收藏');
      } else {
        await collectionApi.add({ productId: product.id });
        setIsCollected(true);
        toast.success('已加入收藏');
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '操作失败，请稍后重试';
      toast.error(message);
    } finally {
      setCollectionLoading(false);
    }
  };

  const fetchAddresses = async () => {
    if (!token) {
      setAddresses([]);
      setSelectedAddressId(null);
      return;
    }

    setAddressesLoading(true);
    try {
      const response = await addressApi.getList();
      setAddresses(response.data);
      const defaultAddress = response.data.find((address) => address.isDefault) ?? response.data[0] ?? null;
      setSelectedAddressId(defaultAddress ? defaultAddress.id : null);
    } catch {
      setAddresses([]);
      setSelectedAddressId(null);
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleOpenBuy = async () => {
    if (!isHydrated) {
      return;
    }

    if (!token) {
      router.push('/mall/login');
      return;
    }

    setBuyDialogOpen(true);
    await fetchAddresses();
  };

  const handleCreateOrder = async () => {
    if (!token) {
      router.push('/mall/login');
      return;
    }

    if (!selectedAddressId) {
      toast.error('请选择收货地址');
      return;
    }

    const safeQuantity = Math.min(Math.max(1, quantity), Math.max(1, product.stock));
    setOrderLoading(true);
    try {
      const specsString =
        product.specs && Object.keys(selectedSpecs).length > 0 ? JSON.stringify(selectedSpecs) : undefined;

      const response = await orderApi.create({
        addressId: selectedAddressId,
        payType,
        items: [
          {
            productId: product.id,
            quantity: safeQuantity,
            specs: specsString,
          },
        ],
      });

      toast.success('下单成功');
      setBuyDialogOpen(false);
      router.push(`/mall/order/${response.data.id}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '下单失败，请稍后重试';
      toast.error(message);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/mall/product">← 返回商品列表</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 商品图片 */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src={product.mainImage}
              alt={product.title}
              fill
              className="object-cover"
            />
            {product.isHot && (
              <Badge className="absolute top-4 left-4 bg-red-500">热销</Badge>
            )}
            {product.isNew && (
              <Badge className="absolute top-4 right-4 bg-green-500">新品</Badge>
            )}
          </div>

          {/* 详情图片 */}
          {product.detailImages && product.detailImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {product.detailImages.map((image, index) => (
                <div key={`${image}-${index}`} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`${product.title} 详情图 ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 商品信息 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <p className="text-gray-600 mb-4">分类: {product.category.name}</p>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-red-600">
                ¥{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ¥{product.originalPrice}
                </span>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>销量: {product.sales}</span>
              <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock > 0 ? `库存: ${product.stock}` : '缺货'}
              </span>
            </div>
          </div>

          <Separator />

          {/* 商品描述 */}
          {product.description && (
            <Card>
              <CardHeader>
                <CardTitle>商品描述</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </CardContent>
            </Card>
          )}

          {/* 规格信息 */}
          {product.specs && (
            <Card>
              <CardContent className="space-y-4">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {key === 'colors' ? '颜色' : '型号'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(value) ? (
                        value.map((item) => {
                          const itemValue = String(item);
                          const isSelected = selectedSpecs[key] === itemValue;

                          return (
                            <Button
                              key={`${key}-${itemValue}`}
                              type="button"
                              size="xs"
                              variant={isSelected ? 'default' : 'outline'}
                              onClick={() => setSelectedSpecs((prev) => ({ ...prev, [key]: itemValue }))}
                            >
                              {itemValue}
                            </Button>
                          );
                        })
                      ) : (
                        <Badge variant="secondary" className="px-3 py-1">
                          {String(value)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button
              size="lg"
              disabled={!product.isOnSale || product.stock === 0}
              className="flex-1"
              onClick={handleOpenBuy}
            >
              {product.isOnSale && product.stock > 0 ? '立即购买' : '商品已下架'}
            </Button>
            <Button size="lg" variant="outline" onClick={handleToggleCollection} disabled={collectionLoading}>
              {isCollected ? '取消收藏' : collectionLoading ? '处理中...' : '加入收藏'}
            </Button>
          </div>

          {/* 商品状态 */}
          <div className="text-sm text-gray-500">
            <p>上架状态: {product.isOnSale ? '已上架' : '已下架'}</p>
            <p>创建时间: {new Date(product.createdAt).toLocaleString()}</p>
            <p>更新时间: {new Date(product.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>确认下单</DialogTitle>
            <DialogDescription>选择规格、数量与收货地址后提交订单。</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/40 p-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{product.title}</div>
                <div className="text-sm text-muted-foreground">¥{product.price}</div>
              </div>
              <div className="text-sm text-muted-foreground">库存 {product.stock}</div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="order-quantity">数量</Label>
              <Input
                id="order-quantity"
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">支付方式</div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant={payType === 'wechat' ? 'default' : 'outline'} onClick={() => setPayType('wechat')}>
                  微信
                </Button>
                <Button type="button" size="sm" variant={payType === 'alipay' ? 'default' : 'outline'} onClick={() => setPayType('alipay')}>
                  支付宝
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">收货地址</div>
              {addressesLoading ? (
                <div className="rounded-lg border border-dashed border-border/60 p-3 text-sm text-muted-foreground">加载地址中...</div>
              ) : addresses.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/60 p-3 text-sm text-muted-foreground">
                  暂无地址，请先去地址管理添加。
                </div>
              ) : (
                <div className="grid gap-2">
                  {addresses.map((address) => (
                    <Button
                      key={address.id}
                      type="button"
                      variant={selectedAddressId === address.id ? 'default' : 'outline'}
                      className="h-auto justify-start whitespace-normal px-3 py-2 text-left"
                      onClick={() => setSelectedAddressId(address.id)}
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {address.name} {address.phone}
                          {address.isDefault ? <span className="ml-2 text-xs opacity-80">默认</span> : null}
                        </div>
                        <div className="text-xs opacity-80">
                          {address.province}
                          {address.city}
                          {address.district}
                          {address.detailAddress}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBuyDialogOpen(false)} disabled={orderLoading}>
              取消
            </Button>
            {addresses.length === 0 ? (
              <Button asChild>
                <Link href="/mall/addresses">去添加地址</Link>
              </Button>
            ) : (
              <Button onClick={handleCreateOrder} disabled={orderLoading || !selectedAddressId}>
                {orderLoading ? '提交中...' : '提交订单'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
