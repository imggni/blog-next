import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  AUTH_STORAGE_KEY,
  clearAuthStorage,
  getLegacyAuthSnapshot,
  setAuthStorage,
  type StoredUser,
} from "@/lib/auth";
import type { UserInfoData, UserLoginData } from "@/types/api";

type AuthState = {
  token: string | null;
  user: StoredUser | null;
  isHydrated: boolean;
  setHydrated: (isHydrated: boolean) => void;
  setAuth: (token: string, user: StoredUser) => void;
  setAuthFromLoginData: (data: UserLoginData) => void;
  setUser: (user: StoredUser) => void;
  setUserFromInfo: (userInfo: UserInfoData) => void;
  clearAuth: () => void;
};

function normalizeLoginUser(data: UserLoginData): StoredUser {
  return {
    id: data.userId,
    username: data.username || data.phone,
    phone: data.phone,
    isAdmin: data.isAdmin,
    avatar: data.avatar,
  };
}

function normalizeUserInfo(userInfo: UserInfoData): StoredUser {
  return {
    id: userInfo.id,
    username: userInfo.username || userInfo.phone,
    phone: userInfo.phone,
    isAdmin: userInfo.isAdmin,
    avatar: userInfo.avatar,
    createdAt: userInfo.createdAt,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isHydrated: false,
      setHydrated: (isHydrated) => set({ isHydrated }),
      setAuth: (token, user) => {
        setAuthStorage(token, user);
        set({ token, user });
      },
      setAuthFromLoginData: (data) => {
        const user = normalizeLoginUser(data);
        setAuthStorage(data.token, user);
        set({ token: data.token, user });
      },
      setUser: (user) => {
        set((state) => {
          if (state.token) {
            setAuthStorage(state.token, user);
          }

          return { user };
        });
      },
      setUserFromInfo: (userInfo) => {
        const user = normalizeUserInfo(userInfo);
        set((state) => {
          if (state.token) {
            setAuthStorage(state.token, user);
          }

          return { user };
        });
      },
      clearAuth: () => {
        clearAuthStorage();
        set({ token: null, user: null });
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        const legacyAuth = getLegacyAuthSnapshot();

        if (state && !state.token && legacyAuth) {
          state.setAuth(legacyAuth.token, legacyAuth.user);
        }

        state?.setHydrated(true);
      },
    }
  )
);
