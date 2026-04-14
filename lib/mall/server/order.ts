import { apiRequest } from "@/lib/mall/server/request";
import type { Order, OrderCreateRequest, OrderListParams, OrderListResponse, OrderUpdateStatusRequest } from "@/types/api";

export const orderApi = {
  create: (data: OrderCreateRequest) =>
    apiRequest<Order>("/order", { method: "POST", body: JSON.stringify(data) }),

  getList: (params?: OrderListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append("page", params.page.toString());
    if (params?.pageSize !== undefined) searchParams.append("pageSize", params.pageSize.toString());
    const suffix = searchParams.toString();

    return apiRequest<OrderListResponse>(`/order${suffix ? `?${suffix}` : ""}`);
  },

  getDetail: (id: string) =>
    apiRequest<Order>(`/order/${id}`),

  cancel: (id: string) =>
    apiRequest<Order>(`/order/${id}/cancel`, { method: "POST" }),

  updateStatus: (id: string, data: OrderUpdateStatusRequest) =>
    apiRequest<Order>(`/order/${id}/status`, { method: "PUT", body: JSON.stringify(data) }),
};
