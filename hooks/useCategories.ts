"use client";

import { useEffect, useState } from 'react';
import { categoryApi, ApiError } from '@/lib/api';
import type { Category, ApiResponse as ApiResp } from '@/types/api';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await categoryApi.getList();

        // lib/api.apiRequest 返回 ApiResponse<T>
        // 兼容后端可能直接返回 array 的情况，优先读取 res.data
        const data = (res as unknown as ApiResp<Category[]>)?.data ?? (res as unknown as Category[]);

        if (Array.isArray(data)) {
          if (mounted) setCategories(data as Category[]);
        } else {
          if (mounted) setCategories([]);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('获取分类失败');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  return { categories, loading, error };
}
