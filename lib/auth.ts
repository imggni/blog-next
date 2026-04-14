export const AUTH_STORAGE_KEY = "mall-auth-store";
export const AUTH_TOKEN_KEY = "mall_token";
export const AUTH_USER_KEY = "mall_user";

export interface StoredUser {
  id?: string;
  username: string;
  phone: string;
  isAdmin: boolean;
  avatar?: string;
  createdAt?: string;
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setAuthStorage(token: string, user: StoredUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("authChange"));
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new CustomEvent("authChange"));
}

export function getLegacyAuthSnapshot() {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    return null;
  }

  return { token, user };
}
