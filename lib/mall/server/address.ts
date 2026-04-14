import { apiRequest } from "@/lib/mall/server/request";
import type { Address, AddressCreateRequest, AddressUpdateRequest } from "@/types/api";

export const addressApi = {
  getList: () => apiRequest<Address[]>("/address"),

  create: (data: AddressCreateRequest) =>
    apiRequest<Address>("/address", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: AddressUpdateRequest) =>
    apiRequest<Address>(`/address/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) => apiRequest(`/address/${id}`, { method: "DELETE" }),

  setDefault: (id: number) => apiRequest<Address>(`/address/${id}/default`, { method: "PUT" }),
};
