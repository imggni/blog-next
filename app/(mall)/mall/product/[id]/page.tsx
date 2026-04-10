'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { productApi, ApiError } from '@/lib/api';
import { Product } from '@/types/api';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

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
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
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
            <div>
              <h3 className="text-lg font-semibold mb-2">商品描述</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {/* 规格信息 */}
          {product.specs && (
            <div>
              <h3 className="text-lg font-semibold mb-2">规格参数</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700">
                  {JSON.stringify(product.specs, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <Separator />

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button
              size="lg"
              disabled={!product.isOnSale || product.stock === 0}
              className="flex-1"
            >
              {product.isOnSale && product.stock > 0 ? '立即购买' : '商品已下架'}
            </Button>
            <Button size="lg" variant="outline">
              加入收藏
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
    </div>
  );
}