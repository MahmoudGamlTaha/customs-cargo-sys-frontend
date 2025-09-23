import { User } from "@/types";

export function getCurrentUser(): User | null {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return null;

    return JSON.parse(stored) as User;
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return null;
  }
}
