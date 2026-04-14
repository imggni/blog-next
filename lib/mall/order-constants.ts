type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export const PAY_TYPE_LABELS: Record<string, string> = {
  wechat: "微信支付",
  alipay: "支付宝",
  card: "银行卡",
  cash: "现金",
};

export const PAY_STATUS_LABELS: Record<string, string> = {
  unpaid: "未支付",
  paid: "已支付",
  refunded: "已退款",
  cancelled: "已取消",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  unpaid: "待支付",
  paid: "已支付待处理",
  processing: "备货中",
  shipped: "已发货",
  completed: "已完成",
  cancelled: "已取消",
};

export function getPayTypeLabel(payType: string) {
  return PAY_TYPE_LABELS[payType] ?? payType;
}

export function getPayStatusLabel(status: string) {
  return PAY_STATUS_LABELS[status] ?? status;
}

export function getOrderStatusLabel(status: string) {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function getPayStatusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case "unpaid":
      return "secondary";
    case "paid":
      return "default";
    case "refunded":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

export function getOrderStatusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case "unpaid":
    case "paid":
    case "processing":
      return "secondary";
    case "shipped":
      return "outline";
    case "completed":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}
