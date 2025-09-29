import { getToken } from "../utils/getToken";

export interface Activity {
  id: number;
  description: string;
  action: string;
  user_id: number;
  module: string;
  username: string;
  entity_id: number;
  entity_name?: string;
  serial_number?: string;
}

export interface ActivitiesResponse {
  data: Activity[];
  page: number;
  page_size: number;
  total: number;
}

export const getAdminActivities = async (
  page: number = 1,
  pageSize: number = 10
): Promise<ActivitiesResponse> => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const DEFAULT_BASE_URL = "http://localhost:8080/api/v1";
  const BASE_URL: string = (import.meta as any)?.env?.VITE_API_BASE_URL
    ? `${(import.meta as any).env.VITE_API_BASE_URL.replace(/\/$/, "")}/api/v1`
    : DEFAULT_BASE_URL;

  const response = await fetch(
    `${BASE_URL}/activities?page=${page}&page_size=${pageSize}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Accept-Language": "ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7",
        Authorization: `Bearer ${token}`,
        Connection: "keep-alive",
        "Content-Type": "application/json",
        Origin: "http://localhost:5173",
        Referer: "http://localhost:5173/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ActivitiesResponse = await response.json();
  console.log("Admin Activities Response:", data);

  return data;
};
