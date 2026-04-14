// API响应基础类型
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 用户相关类型
export interface UserLoginRequest {
  phone: string;
  code: string;
}

export interface UserRegisterRequest {
  phone: string;
  code: string;
  username?: string;
}

export interface UserLoginData {
  userId: string;
  username: string;
  phone: string;
  avatar?: string;
  isAdmin: boolean;
  token: string;
}

export interface UserInfoData {
  id: string;
  username: string;
  phone: string;
  avatar?: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface UserUpdateRequest {
  username?: string;
  avatar?: string;
}

// 分类相关类型
export interface Category {
  id: number;
  name: string;
  icon?: string;
  sort: number;
  createdAt: string;
}

export interface CategoryCreateRequest {
  name: string;
  icon?: string;
  sort?: number;
}

export interface CategoryUpdateRequest {
  name?: string;
  icon?: string;
  sort?: number;
}

// 商品相关类型
export interface Product {
  id: number;
  title: string;
  categoryId: number;
  category: Category;
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
}

export interface ProductCreateRequest {
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
}

export interface ProductUpdateRequest {
  title?: string;
  categoryId?: number;
  price?: number;
  originalPrice?: number;
  stock?: number;
  specs?: Record<string, unknown>;
  mainImage?: string;
  detailImages?: string[];
  description?: string;
  isOnSale?: boolean;
  isHot?: boolean;
  isNew?: boolean;
}

// 地址相关类型
export interface Address {
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
}

export interface AddressCreateRequest {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  isDefault?: boolean;
}

export interface AddressUpdateRequest {
  name?: string;
  phone?: string;
  province?: string;
  city?: string;
  district?: string;
  detailAddress?: string;
}

// 订单相关类型
export interface OrderCreateRequest {
  addressId: number;
  payType: string;
  items: Array<{
    productId: number;
    quantity: number;
    specs?: string;
  }>;
}

export interface OrderGood {
  id: number;
  orderId: string;
  productId: number;
  productTitle: string;
  productImage: string;
  specs?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
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
  address: Address;
  orderGoods: OrderGood[];
}

export interface OrderUpdateStatusRequest {
  orderStatus?: string;
  payStatus?: string;
  logisticsNo?: string;
}

// 收藏相关类型
export interface CollectionAddRequest {
  productId: number;
}

export interface CollectionItem {
  id: number;
  userId: string;
  productId: number;
  createdAt: string;
  product: Product;
}

// 通用分页类型
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// 列表查询参数/响应类型
export interface ProductListParams {
  categoryId?: number;
  keyword?: string;
  isHot?: boolean;
  isNew?: boolean;
  all?: boolean;
  page?: number;
  pageSize?: number;
}

export type ProductListResponse = Product[] | PaginatedResponse<Product>;

export interface OrderListParams {
  page?: number;
  pageSize?: number;
}

export type OrderListResponse = Order[] | PaginatedResponse<Order>;
