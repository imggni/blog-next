import { apiRequest } from "@/lib/mall/server/request";
import type {
  UserInfoData,
  UserLoginData,
  UserLoginRequest,
  UserRegisterRequest,
  UserUpdateRequest,
} from "@/types/api";

export const userApi = {
  register: (data: UserRegisterRequest) =>
    apiRequest<UserLoginData>(
      "/user/register",
      { method: "POST", body: JSON.stringify(data) }
    ),

  login: (data: UserLoginRequest) =>
    apiRequest<UserLoginData>(
      "/user/login/phone",
      { method: "POST", body: JSON.stringify(data) }
    ),

  getInfo: () =>
    apiRequest<UserInfoData>("/user/info"),

  updateInfo: (data: UserUpdateRequest) =>
    apiRequest("/user/info", { method: "PUT", body: JSON.stringify(data) }),

  uploadAvatar: (formData: FormData) =>
    apiRequest("/user/avatar", {
      method: "POST",
      body: formData,
      headers: {},
    }),
};
