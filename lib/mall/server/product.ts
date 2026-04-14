import { apiRequest } from "@/lib/mall/server/request";
import type {
  Product,
  ProductCreateRequest,
  ProductListParams,
  ProductListResponse,
  ProductUpdateRequest,
} from "@/types/api";

export const productApi = {
  getList: (params?: ProductListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.append("categoryId", params.categoryId.toString());
    if (params?.keyword) searchParams.append("keyword", params.keyword);
    if (params?.isHot !== undefined) searchParams.append("isHot", params.isHot.toString());
    if (params?.isNew !== undefined) searchParams.append("isNew", params.isNew.toString());
    if (params?.all !== undefined) searchParams.append("all", params.all.toString());
    if (params?.page !== undefined) searchParams.append("page", params.page.toString());
    if (params?.pageSize !== undefined) searchParams.append("pageSize", params.pageSize.toString());

    return apiRequest<ProductListResponse>(`/product?${searchParams.toString()}`);
  },

  getDetail: (id: number) =>
    apiRequest<Product>(`/product/${id}`),

  create: (data: ProductCreateRequest) => apiRequest("/product", { method: "POST", body: JSON.stringify(data) }),

  update: (
    id: number,
    data: ProductUpdateRequest
  ) => apiRequest(`/product/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) => apiRequest(`/product/${id}`, { method: "DELETE" }),
};
