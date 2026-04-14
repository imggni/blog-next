import { ApiResponse } from "@/types/api";
import { getStoredToken } from "@/lib/auth";

export class ApiError extends Error {
  constructor(public code: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  const url = `${baseUrl}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const token = getStoredToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || data.code !== 200) {
      throw new ApiError(data.code, data.message);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "网络错误，请稍后重试");
  }
}
