export type MallId = string;

export type MallCategory = {
  id: MallId;
  name: string;
  icon?: string;
  sort: number;
};

export type MallProductTag = "爆款" | "新品" | "下架";

export type MallProduct = {
  id: MallId;
  title: string;
  categoryId: MallId;
  price: number;
  originalPrice?: number;
  sales: number;
  tags: MallProductTag[];
  mainImage: string;
};

export type MallAddress = {
  id: MallId;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
};

export type MallOrderStatus = "待支付" | "待发货" | "待收货" | "已完成" | "已取消";
export type MallPayStatus = "未支付" | "已支付" | "已退款";

export type MallOrderItem = {
  productId: MallId;
  title: string;
  mainImage: string;
  quantity: number;
  price: number;
  specs?: string;
};

export type MallOrder = {
  id: MallId;
  orderNo: string;
  amount: number;
  orderStatus: MallOrderStatus;
  payStatus: MallPayStatus;
  createdAt: string;
  logisticsNo?: string;
  address: MallAddress;
  items: MallOrderItem[];
};

export type MallUserInfo = {
  id: MallId;
  username: string;
  phone: string;
  avatar?: string;
  createdAt: string;
  isAdmin: boolean;
};
