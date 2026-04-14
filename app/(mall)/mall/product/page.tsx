'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Waterfall } from '@/components/ui/waterfall';
import { ProductPagination } from '@/components/mall/product-pagination';
import { categoryApi, productApi, ApiError } from '@/lib/api';
import type { Category, Product } from '@/types/api';

type ProductListPayload =
  | Product[]
  | {
      data?: Product[];
      pagination?: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
    };

type ProductListApiResponse = {
  data: ProductListPayload;
};

function parseProductListResponse(response: ProductListApiResponse) {
  const payload = response.data;
  const items = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  const pagination = !Array.isArray(payload) ? payload?.pagination : undefined;

  return { items, pagination };
}

function ProductListClient() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = useCallback(async (params: { keyword: string; page: number; categoryId: number | null }) => {
    const { keyword, page, categoryId } = params;
    setLoading(true);
    setError('');

    try {
      const response = await productApi.getList({
        ...(keyword && { keyword }),
        ...(categoryId ? { categoryId } : {}),
        page,
        pageSize,
      });
      const { items, pagination } = parseProductListResponse(response);
      setProducts(items);
      setTotal(pagination?.total ?? items.length);
      setTotalPages(pagination?.totalPages ?? 1);
      setCurrentPage(pagination?.page ?? page);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('获取商品列表失败');
      }
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    const keywordFromUrl = searchParams.get('keyword')?.trim() ?? '';
    setSearchKeyword(keywordFromUrl);
    fetchProducts({ page: 1, keyword: keywordFromUrl, categoryId: selectedCategoryId });
  }, [fetchProducts, searchParams, selectedCategoryId]);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await categoryApi.getList();
        setCategories(response.data);
      } catch {
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = async () => {
    await fetchProducts({ page: 1, keyword: searchKeyword.trim(), categoryId: selectedCategoryId });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = async (newPage: number) => {
    await fetchProducts({ page: newPage, keyword: searchKeyword.trim(), categoryId: selectedCategoryId });
  };

  const handleSelectCategory = async (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    await fetchProducts({ page: 1, keyword: searchKeyword.trim(), categoryId });
  };

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">商品列表</h1>
          <p className="text-sm text-muted-foreground">浏览所有商品</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/mall">返回商城首页</Link>
        </Button>
      </header>

      <Card className="rounded-3xl border border-border/70 bg-card">
        <CardHeader>
          <CardTitle>筛选</CardTitle>
          <CardDescription>按分类筛选商品，并支持关键词搜索。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="搜索商品..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch}>搜索</Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">产品类型</div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={selectedCategoryId === null ? 'default' : 'outline'}
                onClick={() => handleSelectCategory(null)}
                disabled={categoriesLoading}
              >
                全部
              </Button>
              {categories
                .slice()
                .sort((a, b) => a.sort - b.sort)
                .map((category) => (
                  <Button
                    key={category.id}
                    type="button"
                    size="sm"
                    variant={selectedCategoryId === category.id ? 'default' : 'outline'}
                    onClick={() => handleSelectCategory(category.id)}
                    disabled={categoriesLoading}
                    className="gap-2"
                  >
                    <span aria-hidden="true">{category.icon ?? '🏷️'}</span>
                    <span>{category.name}</span>
                  </Button>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Waterfall className="gap-6" minColumnWidth="18rem" gap="1.5rem">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow pt-0">
            <div className="relative aspect-square">
              <Image
                src={product.mainImage}
                alt={product.title}
                fill
                className="object-cover"
              />
              {product.isHot && (
                <Badge className="absolute top-2 left-2 bg-red-500">热销</Badge>
              )}
              {product.isNew && (
                <Badge className="absolute top-2 right-2 bg-green-500">新品</Badge>
              )}
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
              <CardDescription>{product.category.name}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-red-600">
                    ¥{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ¥{product.originalPrice}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600">销量: {product.sales}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `库存: ${product.stock}` : '缺货'}
                </span>
                <Button
                  size="sm"
                  disabled={!product.isOnSale || product.stock === 0}
                  asChild
                >
                  <Link href={`/mall/product/${product.id}`}>查看详情</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </Waterfall>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无商品</p>
        </div>
      )}

      {/* 分页信息和控件 */}
      {products.length > 0 && (
        <ProductPagination
          total={total}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default function ProductListPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">加载中...</div>
        </div>
      }
    >
      <ProductListClient />
    </Suspense>
  );
}
