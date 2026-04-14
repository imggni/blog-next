---
title: "使用 Zustand 进行 React 状态管理的最佳实践"
description: "在数码配件商城项目中使用 Zustand 的实战经验，包括模块化设计、异步操作、性能优化等最佳实践。"
date: "2026-04-13"
tags:
  - "Zustand"
  - "状态管理"
  - "React"
  - "TypeScript"
---

# 使用 Zustand 进行 React 状态管理的最佳实践

在数码配件商城项目中，我选择了 Zustand 作为状态管理库。相比 Redux，Zustand 更轻量、API 更简洁。本文总结了使用 Zustand 的经验和最佳实践。

## 1. Zustand 基础使用

### 为什么选择 Zustand

- **轻量级**：包体积小（约 1KB）
- **简洁 API**：无需 Provider、ActionCreators
- **TypeScript 友好**：完整的类型支持
- **无样板代码**：减少冗余代码
- **性能优秀**：细粒度订阅，避免不必要的重渲染

### 基础 Store 创建

```typescript
// stores/user.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  phone: string;
  avatar?: string;
  isAdmin: boolean;
  token: string;
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      clearUser: () => set({ user: null }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user }), // 只持久化 user
    }
  )
);
```

## 2. 模块化 Store 设计

### 按功能模块划分

```typescript
// stores/cart.ts
import { create } from 'zustand';

export interface CartItem {
  productId: number;
  title: string;
  price: number;
  mainImage: string;
  quantity: number;
  specs?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalQuantity: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (item) =>
    set((state) => {
      const existingItem = state.items.find(
        (i) => i.productId === item.productId
      );
      
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      
      return { items: [...state.items, item] };
    }),
  
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    })),
  
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    })),
  
  clearCart: () => set({ items: [] }),
  
  getTotalPrice: () => {
    const state = get();
    return state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },
  
  getTotalQuantity: () => {
    const state = get();
    return state.items.reduce((total, item) => total + item.quantity, 0);
  },
}));
```

## 3. 异步操作与 API 集成

### 处理异步状态

```typescript
// stores/product.ts
import { create } from 'zustand';
import { productApi, Product } from '@/lib/api';

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  
  fetchProducts: (params?: any) => Promise<void>;
  fetchProductDetail: (id: number) => Promise<void>;
  createProduct: (data: any) => Promise<void>;
  updateProduct: (id: number, data: any) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  
  fetchProducts: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await productApi.getList(params);
      set({ products: response.data, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取商品列表失败';
      set({ error: message, loading: false });
    }
  },
  
  fetchProductDetail: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await productApi.getDetail(id);
      set({ currentProduct: response.data, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取商品详情失败';
      set({ error: message, loading: false });
    }
  },
  
  createProduct: async (data) => {
    set({ loading: true, error: null });
    try {
      await productApi.create(data);
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建商品失败';
      set({ error: message, loading: false });
      throw error;
    }
  },
  
  updateProduct: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await productApi.update(id, data);
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新商品失败';
      set({ error: message, loading: false });
      throw error;
    }
  },
  
  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await productApi.delete(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除商品失败';
      set({ error: message, loading: false });
      throw error;
    }
  },
}));
```

### 在组件中使用

```typescript
// components/ProductList.tsx
'use client';

import { useEffect } from 'react';
import { useProductStore } from '@/stores/product';
import { toast } from 'sonner';

export function ProductList() {
  const { products, loading, error, fetchProducts, deleteProduct } =
    useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      toast.success('删除成功');
    } catch (error) {
      toast.error('删除失败');
    }
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.title}</h3>
          <p>¥{product.price}</p>
          <button onClick={() => handleDelete(product.id)}>删除</button>
        </div>
      ))}
    </div>
  );
}
```

## 4. 性能优化技巧

### 选择性订阅

```typescript
// ❌ 不好的做法：订阅整个 store
const { user, cart, theme } = useStore();

// ✅ 好的做法：只订阅需要的状态
const user = useStore((state) => state.user);
const addToCart = useStore((state) => state.addToCart);

// ✅ 使用 shallow 避免不必要的重渲染
import { shallow } from 'zustand/shallow';

const { items, total } = useCartStore(
  (state) => ({
    items: state.items,
    total: state.getTotalPrice(),
  }),
  shallow
);
```

## 5. 中间件使用

### DevTools 中间件

```typescript
import { devtools } from 'zustand/middleware';

export const useStore = create<StoreState>()(
  devtools(
    (set) => ({
      // store 状态和方法
    }),
    {
      name: 'app-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
```

### Persist 中间件

```typescript
import { persist } from 'zustand/middleware';

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user }), // 只持久化部分状态
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // 处理版本迁移
        if (version === 0) {
          return {
            user: persistedState,
          };
        }
        return persistedState;
      },
    }
  )
);
```

## 6. TypeScript 类型安全

### 完整的类型定义

```typescript
// types/store.ts
export interface User {
  id: string;
  username: string;
  phone: string;
  avatar?: string;
  isAdmin: boolean;
  token: string;
}

export interface CartItem {
  productId: number;
  title: string;
  price: number;
  mainImage: string;
  quantity: number;
  specs?: string;
}

export interface UserState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export type StoreState = UserState & CartState;
```

## 7. 测试 Zustand Store

### 单元测试

```typescript
// __tests__/stores/cart.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '@/stores/cart';

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        productId: 1,
        title: 'Test Product',
        price: 100,
        mainImage: '/test.jpg',
        quantity: 1,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe(1);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        productId: 1,
        title: 'Test Product',
        price: 100,
        mainImage: '/test.jpg',
        quantity: 1,
      });
    });

    act(() => {
      result.current.removeItem(1);
    });

    expect(result.current.items).toHaveLength(0);
  });
});
```

## 总结

Zustand 状态管理的最佳实践：

1. **模块化设计**：按功能划分 Store，保持代码清晰
2. **选择性订阅**：只订阅需要的状态，避免不必要的重渲染
3. **异步处理**：合理处理异步操作和错误状态
4. **中间件使用**：利用 devtools 和 persist 中间件提升开发体验
5. **类型安全**：充分利用 TypeScript 的类型系统
6. **性能优化**：使用 shallow 和 computed 优化性能
7. **测试覆盖**：编写单元测试确保 Store 的正确性

通过遵循这些最佳实践，可以构建一个高效、可维护的状态管理系统。