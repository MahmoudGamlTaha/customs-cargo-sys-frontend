import { getCurrentLanguage } from "@/contexts/LanguageContext";

const DEFAULT_BASE_URL = 'http://localhost:8080/api/v1/request-types';
const BASE_URL: string = (import.meta as any)?.env?.VITE_API_BASE_URL
  ? `${(import.meta as any).env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/v1/request-types`
  : DEFAULT_BASE_URL;

export interface ApiListResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  status?: number;
}

function getAuthToken(fallback?: string): string | undefined {
  if (fallback) return fallback;
  try {
    return localStorage.getItem('auth_token') || undefined;
  } catch {
    return undefined;
  }
}

async function parseError(resp: Response): Promise<string> {
  try {
    const j = await resp.json();
    return j?.message || j?.error || j?.msg || resp.statusText || 'Request failed';
  } catch {
    return resp.statusText || 'Request failed';
  }
}

export async function getRequestTypes(token?: string): Promise<ApiListResult> {
  const auth = getAuthToken(token);
  
  try {
    const resp = await fetch(`${BASE_URL}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Accept-Language': getCurrentLanguage(),
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
    });

    let data: any = undefined;
    try {
      data = await resp.json();
    } catch (error) {
      // ignore non-JSON
    }

    if (!resp.ok) {
      const message = (data && (data.message || data.error || data.msg)) || (await parseError(resp));
      return { success: false, message, status: resp.status, data };
    }

    return { success: true, data, status: resp.status };
    
  } catch (networkError) {
    return { 
      success: false, 
      message: "خطأ في الاتصال بالخادم. تأكد من أن الخادم يعمل على المنفذ 8080", 
      status: 0 
    };
  }
}
