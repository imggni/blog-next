import type { MallAddress, MallCategory, MallOrder, MallProduct, MallUserInfo } from "@/types/mall";

export const mallCategories: MallCategory[] = [
  { id: "c-1", name: "耳机", icon: "🎧", sort: 1 },
  { id: "c-2", name: "键鼠", icon: "⌨️", sort: 2 },
  { id: "c-3", name: "存储", icon: "💾", sort: 3 },
  { id: "c-4", name: "线材", icon: "🔌", sort: 4 },
];

export const mallProducts: MallProduct[] = [
  {
    id: "p-1",
    title: "无线降噪耳机 Pro",
    categoryId: "c-1",
    price: 399,
    originalPrice: 499,
    sales: 1240,
    tags: ["爆款"],
    mainImage: "/images/monograph/featured-1.png",
  },
  {
    id: "p-2",
    title: "机械键盘 87 键",
    categoryId: "c-2",
    price: 299,
    originalPrice: 359,
    sales: 860,
    tags: ["新品"],
    mainImage: "/images/monograph/featured-2.png",
  },
  {
    id: "p-3",
    title: "高速固态硬盘 1TB",
    categoryId: "c-3",
    price: 499,
    originalPrice: 599,
    sales: 540,
    tags: [],
    mainImage: "/images/monograph/featured-1.png",
  },
  {
    id: "p-4",
    title: "Type-C 快充数据线",
    categoryId: "c-4",
    price: 39,
    originalPrice: 59,
    sales: 3660,
    tags: ["爆款"],
    mainImage: "/images/monograph/featured-2.png",
  },
];

export const mallDefaultAddress: MallAddress = {
  id: "a-1",
  receiverName: "张三",
  phone: "13800000000",
  province: "广东省",
  city: "深圳市",
  district: "南山区",
  detail: "科技园科兴科学园 A 栋 1001",
  isDefault: true,
};

export const mallAddresses: MallAddress[] = [
  mallDefaultAddress,
  {
    id: "a-2",
    receiverName: "李四",
    phone: "13900000000",
    province: "上海市",
    city: "上海市",
    district: "浦东新区",
    detail: "世纪大道 100 号",
    isDefault: false,
  },
];

export const mallUserMock: MallUserInfo = {
  id: "u-1",
  username: "示例用户",
  phone: "13800000000",
  avatar: "/images/monograph/hero.png",
  createdAt: "2026-01-01 10:00:00",
  isAdmin: true,
};

export const mallOrders: MallOrder[] = [
  {
    id: "o-1",
    orderNo: "202604090001",
    amount: 438,
    orderStatus: "待支付",
    payStatus: "未支付",
    createdAt: "2026-04-09 09:30:00",
    address: mallDefaultAddress,
    items: [
      {
        productId: "p-4",
        title: "Type-C 快充数据线",
        mainImage: "/images/monograph/featured-2.png",
        quantity: 1,
        price: 39,
      },
      {
        productId: "p-1",
        title: "无线降噪耳机 Pro",
        mainImage: "/images/monograph/featured-1.png",
        quantity: 1,
        price: 399,
        specs: "黑色",
      },
    ],
  },
  {
    id: "o-2",
    orderNo: "202604090002",
    amount: 299,
    orderStatus: "已完成",
    payStatus: "已支付",
    createdAt: "2026-04-08 18:10:00",
    logisticsNo: "SF1234567890",
    address: mallDefaultAddress,
    items: [
      {
        productId: "p-2",
        title: "机械键盘 87 键",
        mainImage: "/images/monograph/featured-2.png",
        quantity: 1,
        price: 299,
        specs: "青轴",
      },
    ],
  },
];

export function findMallProductById(id: string) {
  return mallProducts.find((product) => product.id === id) ?? null;
}

export function findMallOrderById(id: string) {
  return mallOrders.find((order) => order.id === id) ?? null;
}
