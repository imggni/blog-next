import { apiRequest } from "@/lib/mall/server/request";
import type { CollectionAddRequest, CollectionItem } from "@/types/api";

export const collectionApi = {
  getList: () => apiRequest<CollectionItem[]>("/collection"),

  add: (data: CollectionAddRequest) =>
    apiRequest<CollectionItem>("/collection", { method: "POST", body: JSON.stringify(data) }),

  remove: (productId: number) => apiRequest(`/collection/${productId}`, { method: "DELETE" }),
};
