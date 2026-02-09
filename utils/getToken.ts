// utils/auth.ts

import { GetUserPermission, IPermissions } from "@/services/userService";

function decodeJwt(token: string) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token);

  if (!decoded?.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000); // seconds
  return decoded.exp < currentTime;
}


export function getToken(): string | null {
  try {

    const token = localStorage.getItem("auth_token");
    if (!token || isTokenExpired(token)) {
      // window.location.href = "/";
    } else {
      return token;
    }  
  } catch (error) {
    return null;
  }
}

export async function getUserPermissions(): Promise<IPermissions[]> {
  let user = localStorage.getItem("user");
  if (user) {
    const userReq = JSON.parse(user);
    try {
      const result = await GetUserPermission(userReq?.id);
      if (result.success) {
        return result.data?.data;
      } else {
        return;
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return null;
    }
  }
}
