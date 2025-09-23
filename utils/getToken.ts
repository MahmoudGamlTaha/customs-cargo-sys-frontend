// utils/auth.ts

import { GetUserPermission, IPermissions } from "@/services/userService";

export function getToken(): string | null {
  try {
    return localStorage.getItem("auth_token");
  } catch (error) {
    console.error("Error accessing localStorage:", error);
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
