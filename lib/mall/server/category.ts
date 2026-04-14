import { apiRequest } from "@/lib/mall/server/request";
import type { Category, CategoryCreateRequest, CategoryUpdateRequest } from "@/types/api";

export const categoryApi = {
  getList: () => apiRequest<Category[]>("/category"),

  create: (data: CategoryCreateRequest) =>
    apiRequest("/category", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: CategoryUpdateRequest) =>
    apiRequest(`/category/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) => apiRequest(`/category/${id}`, { method: "DELETE" }),
};
