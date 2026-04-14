import { apiRequest } from "@/lib/mall/server/request";

export const healthCheck = () => apiRequest("/health");
