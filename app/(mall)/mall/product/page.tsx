'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Waterfall } from '@/components/ui/waterfall';
import { productApi, ApiError } from '@/lib/api';
import { Product } from '@/types/api';

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

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const parseProductListResponse = (response: ProductListApiResponse) => {
    const payload = response.data;
    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
      ? payload.data
      : [];
    const pagination = !Array.isArray(payload) ? payload?.pagination : undefined;

    return { items, pagination };
  };

  useEffect(() => {
    const fetchProducts = async (keyword = '', page = 1) => {
      setLoading(true);
      setError('');

      try {
        const response = await productApi.getList({
          ...(keyword && { keyword }),
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
    };

    fetchProducts();
  }, [pageSize]);

  const handleSearch = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await productApi.getList({
        ...(searchKeyword && { keyword: searchKeyword }),
        page: 1,
        pageSize,
      });
      const { items, pagination } = parseProductListResponse(response);
      setProducts(items);
      setTotal(pagination?.total ?? items.length);
      setTotalPages(pagination?.totalPages ?? 1);
      setCurrentPage(pagination?.page ?? 1);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('获取商品列表失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    setError('');

    try {
      const response = await productApi.getList({
        ...(searchKeyword && { keyword: searchKeyword }),
        page: newPage,
        pageSize,
      });
      const { items, pagination } = parseProductListResponse(response);
      setProducts(items);
      setTotal(pagination?.total ?? items.length);
      setTotalPages(pagination?.totalPages ?? 1);
      setCurrentPage(pagination?.page ?? newPage);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('获取商品列表失败');
      }
    } finally {
      setLoading(false);
    }
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

      {/* 搜索框 */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="搜索商品..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleSearch}>搜索</Button>
      </div>

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
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            共 <span className="font-medium">{total}</span> 个商品，第{' '}
            <span className="font-medium">{currentPage}</span> 页
            <span className="mx-1">/</span>
            共 <span className="font-medium">{totalPages}</span> 页
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => {
                    if (currentPage > 1) {
                      handlePageChange(currentPage - 1);
                    }
                  }}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {/* 显示页码 */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={pageNum === currentPage}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => {
                    if (currentPage < totalPages) {
                      handlePageChange(currentPage + 1);
                    }
                  }}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
