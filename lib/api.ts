import { ApiResponse } from '@/types/api';

// 错误处理类
export class ApiError extends Error {
  constructor(public code: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// 统一的请求方法
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  const url = `${baseUrl}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // 添加认证token（如果存在）
  const token = localStorage?.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || data.code !== 200) {
      throw new ApiError(data.code, data.message);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, '网络错误，请稍后重试');
  }
}

// 健康检查
export const healthCheck = () => apiRequest('/health');

// 用户相关API
export const userApi = {
  register: (data: { phone: string; code: string; username?: string }) =>
    apiRequest<{ userId: string; username: string; phone: string; avatar?: string; isAdmin: boolean; token: string }>(
      '/user/register',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  login: (data: { phone: string; code: string }) =>
    apiRequest<{ userId: string; username: string; phone: string; avatar?: string; isAdmin: boolean; token: string }>(
      '/user/login/phone',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  getInfo: () =>
    apiRequest<{ id: string; username: string; phone: string; avatar?: string; isAdmin: boolean; createdAt: string }>(
      '/user/info'
    ),

  updateInfo: (data: { username?: string; avatar?: string }) =>
    apiRequest('/user/info', { method: 'PUT', body: JSON.stringify(data) }),

  uploadAvatar: (formData: FormData) =>
    apiRequest('/user/avatar', {
      method: 'POST',
      body: formData,
      headers: {}, // 让浏览器设置Content-Type为multipart/form-data
    }),
};

// 分类相关API
export const categoryApi = {
  getList: () =>
    apiRequest<Array<{ id: number; name: string; icon?: string; sort: number; createdAt: string }>>(
      '/category'
    ),

  create: (data: { name: string; icon?: string; sort?: number }) =>
    apiRequest('/category', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: { name?: string; icon?: string; sort?: number }) =>
    apiRequest(`/category/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: number) =>
    apiRequest(`/category/${id}`, { method: 'DELETE' }),
};

// 商品相关API
export const productApi = {
  getList: (params?: {
    categoryId?: number;
    keyword?: string;
    isHot?: boolean;
    isNew?: boolean;
    all?: boolean;
    page?: number;
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId.toString());
    if (params?.keyword) searchParams.append('keyword', params.keyword);
    if (params?.isHot !== undefined) searchParams.append('isHot', params.isHot.toString());
    if (params?.isNew !== undefined) searchParams.append('isNew', params.isNew.toString());
    if (params?.all !== undefined) searchParams.append('all', params.all.toString());
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.pageSize !== undefined) searchParams.append('pageSize', params.pageSize.toString());

    return apiRequest<
      | Array<{
          id: number;
          title: string;
          categoryId: number;
          category: { id: number; name: string; icon?: string; sort: number; createdAt: string };
          price: number;
          originalPrice?: number;
          stock: number;
          specs?: Record<string, unknown>;
          mainImage: string;
          detailImages?: string[];
          description?: string;
          sales: number;
          isOnSale: boolean;
          isHot: boolean;
          isNew: boolean;
          createdAt: string;
          updatedAt: string;
        }>
      | {
          data: Array<{
            id: number;
            title: string;
            categoryId: number;
            category: { id: number; name: string; icon?: string; sort: number; createdAt: string };
            price: number;
            originalPrice?: number;
            stock: number;
            specs?: Record<string, unknown>;
            mainImage: string;
            detailImages?: string[];
            description?: string;
            sales: number;
            isOnSale: boolean;
            isHot: boolean;
            isNew: boolean;
            createdAt: string;
            updatedAt: string;
          }>;
          pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
          };
        }
    >(`/product?${searchParams.toString()}`);
  },

  getDetail: (id: number) =>
    apiRequest<{
      id: number;
      title: string;
      categoryId: number;
      category: { id: number; name: string; icon?: string; sort: number; createdAt: string };
      price: number;
      originalPrice?: number;
      stock: number;
      specs?: Record<string, unknown>;
      mainImage: string;
      detailImages?: string[];
      description?: string;
      sales: number;
      isOnSale: boolean;
      isHot: boolean;
      isNew: boolean;
      createdAt: string;
      updatedAt: string;
    }>(`/product/${id}`),

  create: (data: {
    title: string;
    categoryId: number;
    price: number;
    originalPrice?: number;
    stock?: number;
    specs?: Record<string, unknown>;
    mainImage: string;
    detailImages?: string[];
    description?: string;
    isOnSale?: boolean;
    isHot?: boolean;
    isNew?: boolean;
  }) =>
    apiRequest('/product', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: Partial<{
    title: string;
    categoryId: number;
    price: number;
    originalPrice?: number;
    stock?: number;
    specs?: Record<string, unknown>;
    mainImage: string;
    detailImages?: string[];
    description?: string;
    isOnSale?: boolean;
    isHot?: boolean;
    isNew?: boolean;
  }>) =>
    apiRequest(`/product/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: number) =>
    apiRequest(`/product/${id}`, { method: 'DELETE' }),
};

// 地址相关API
export const addressApi = {
  getList: () =>
    apiRequest<Array<{
      id: number;
      userId: string;
      name: string;
      phone: string;
      province: string;
      city: string;
      district: string;
      detailAddress: string;
      isDefault: boolean;
      createdAt: string;
    }>>('/address'),

  create: (data: {
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detailAddress: string;
    isDefault?: boolean;
  }) =>
    apiRequest<{
      id: number;
      userId: string;
      name: string;
      phone: string;
      province: string;
      city: string;
      district: string;
      detailAddress: string;
      isDefault: boolean;
      createdAt: string;
    }>('/address', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: {
    name?: string;
    phone?: string;
    province?: string;
    city?: string;
    district?: string;
    detailAddress?: string;
  }) =>
    apiRequest<{
      id: number;
      userId: string;
      name: string;
      phone: string;
      province: string;
      city: string;
      district: string;
      detailAddress: string;
      isDefault: boolean;
      createdAt: string;
    }>(`/address/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: number) =>
    apiRequest(`/address/${id}`, { method: 'DELETE' }),

  setDefault: (id: number) =>
    apiRequest<{
      id: number;
      userId: string;
      name: string;
      phone: string;
      province: string;
      city: string;
      district: string;
      detailAddress: string;
      isDefault: boolean;
      createdAt: string;
    }>(`/address/${id}/default`, { method: 'PUT' }),
};

// 订单相关API
export const orderApi = {
  create: (data: {
    addressId: number;
    payType: string;
    items: Array<{
      productId: number;
      quantity: number;
      specs?: string;
    }>;
  }) =>
    apiRequest<{
      id: string;
      userId: string;
      addressId: number;
      totalPrice: number;
      goodsPrice: number;
      freight: number;
      discount: number;
      payType: string;
      payStatus: string;
      orderStatus: string;
      logisticsNo?: string;
      payTime?: string;
      shipTime?: string;
      confirmTime?: string;
      createdAt: string;
      address: {
        id: number;
        userId: string;
        name: string;
        phone: string;
        province: string;
        city: string;
        district: string;
        detailAddress: string;
        isDefault: boolean;
        createdAt: string;
      };
      orderGoods: Array<{
        id: number;
        orderId: string;
        productId: number;
        productTitle: string;
        productImage: string;
        specs?: string;
        price: number;
        quantity: number;
        subtotal: number;
      }>;
    }>('/order', { method: 'POST', body: JSON.stringify(data) }),

  getList: () =>
    apiRequest<Array<{
      id: string;
      userId: string;
      addressId: number;
      totalPrice: number;
      goodsPrice: number;
      freight: number;
      discount: number;
      payType: string;
      payStatus: string;
      orderStatus: string;
      logisticsNo?: string;
      payTime?: string;
      shipTime?: string;
      confirmTime?: string;
      createdAt: string;
      address: {
        id: number;
        userId: string;
        name: string;
        phone: string;
        province: string;
        city: string;
        district: string;
        detailAddress: string;
        isDefault: boolean;
        createdAt: string;
      };
      orderGoods: Array<{
        id: number;
        orderId: string;
        productId: number;
        productTitle: string;
        productImage: string;
        specs?: string;
        price: number;
        quantity: number;
        subtotal: number;
      }>;
    }>>('/order'),

  getDetail: (id: string) =>
    apiRequest<{
      id: string;
      userId: string;
      addressId: number;
      totalPrice: number;
      goodsPrice: number;
      freight: number;
      discount: number;
      payType: string;
      payStatus: string;
      orderStatus: string;
      logisticsNo?: string;
      payTime?: string;
      shipTime?: string;
      confirmTime?: string;
      createdAt: string;
      address: {
        id: number;
        userId: string;
        name: string;
        phone: string;
        province: string;
        city: string;
        district: string;
        detailAddress: string;
        isDefault: boolean;
        createdAt: string;
      };
      orderGoods: Array<{
        id: number;
        orderId: string;
        productId: number;
        productTitle: string;
        productImage: string;
        specs?: string;
        price: number;
        quantity: number;
        subtotal: number;
      }>;
    }>(`/order/${id}`),

  cancel: (id: string) =>
    apiRequest<{
      id: string;
      userId: string;
      addressId: number;
      totalPrice: number;
      goodsPrice: number;
      freight: number;
      discount: number;
      payType: string;
      payStatus: string;
      orderStatus: string;
      logisticsNo?: string;
      payTime?: string;
      shipTime?: string;
      confirmTime?: string;
      createdAt: string;
      address: {
        id: number;
        userId: string;
        name: string;
        phone: string;
        province: string;
        city: string;
        district: string;
        detailAddress: string;
        isDefault: boolean;
        createdAt: string;
      };
      orderGoods: Array<{
        id: number;
        orderId: string;
        productId: number;
        productTitle: string;
        productImage: string;
        specs?: string;
        price: number;
        quantity: number;
        subtotal: number;
      }>;
    }>(`/order/${id}/cancel`, { method: 'POST' }),

  updateStatus: (id: string, data: {
    orderStatus?: string;
    payStatus?: string;
    logisticsNo?: string;
  }) =>
    apiRequest<{
      id: string;
      userId: string;
      addressId: number;
      totalPrice: number;
      goodsPrice: number;
      freight: number;
      discount: number;
      payType: string;
      payStatus: string;
      orderStatus: string;
      logisticsNo?: string;
      payTime?: string;
      shipTime?: string;
      confirmTime?: string;
      createdAt: string;
      address: {
        id: number;
        userId: string;
        name: string;
        phone: string;
        province: string;
        city: string;
        district: string;
        detailAddress: string;
        isDefault: boolean;
        createdAt: string;
      };
      orderGoods: Array<{
        id: number;
        orderId: string;
        productId: number;
        productTitle: string;
        productImage: string;
        specs?: string;
        price: number;
        quantity: number;
        subtotal: number;
      }>;
    }>(`/order/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
};

// 收藏相关API
export const collectionApi = {
  getList: () =>
    apiRequest<Array<{
      id: number;
      userId: string;
      productId: number;
      createdAt: string;
      product: {
        id: number;
        title: string;
        categoryId: number;
        category: { id: number; name: string; icon?: string; sort: number; createdAt: string };
        price: number;
        originalPrice?: number;
        stock: number;
        specs?: Record<string, unknown>;
        mainImage: string;
        detailImages?: string[];
        description?: string;
        sales: number;
        isOnSale: boolean;
        isHot: boolean;
        isNew: boolean;
        createdAt: string;
        updatedAt: string;
      };
    }>>('/collection'),

  add: (data: { productId: number }) =>
    apiRequest<{
      id: number;
      userId: string;
      productId: number;
      createdAt: string;
      product: {
        id: number;
        title: string;
        categoryId: number;
        category: { id: number; name: string; icon?: string; sort: number; createdAt: string };
        price: number;
        originalPrice?: number;
        stock: number;
        specs?: Record<string, unknown>;
        mainImage: string;
        detailImages?: string[];
        description?: string;
        sales: number;
        isOnSale: boolean;
        isHot: boolean;
        isNew: boolean;
        createdAt: string;
        updatedAt: string;
      };
    }>('/collection', { method: 'POST', body: JSON.stringify(data) }),

  remove: (productId: number) =>
    apiRequest(`/collection/${productId}`, { method: 'DELETE' }),
};