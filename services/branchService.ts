import { getToken } from "@/utils/getToken";
import { dataProcessor, BackendResponse, BranchesResponse, PortsResponse } from "@/utils/DataProcessor";
import { getCurrentLanguage } from "@/contexts/LanguageContext";

const DEFAULT_BASE_URL = 'http://localhost:8080/api/v1/branches';
const ADMIN_PREFIX = '/admin';
const BASE_URL: string = (import.meta as any)?.env?.VITE_API_BASE_URL
  ? `${(import.meta as any).env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/v1${ADMIN_PREFIX}/branches`
  : DEFAULT_BASE_URL;

export interface ApiListResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  status?: number;
}

export interface Branch {
  id: string | number;
  name: string;
  address?: string;
  code?: string;
  phone?: string;
  email?: string;
  city?: string;
  region?: string;
  country?: string;
  isActive?: boolean;
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

export async function getBranches(token?: string): Promise<ApiListResult> {
  const auth = getAuthToken(token);
  const resp = await fetch(`${BASE_URL}`.replace(ADMIN_PREFIX, ''), {
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
  } catch {
    // ignore non-JSON
  }

  if (!resp.ok) {
    const message = (data && (data.message || data.error || data.msg)) || (await parseError(resp));
    return { success: false, message, status: resp.status, data };
  }

  // const processedData = dataProcessor.processBranchesToPorts(data);
  return { success: true, data: data, status: resp.status };
}

export async function createBranch(branchData: Omit<Branch, 'id'>, token?: string): Promise<ApiListResult> {
  const auth = getAuthToken(token) || getToken();
  const resp = await fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Language': getCurrentLanguage(),
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    body: JSON.stringify(branchData),
  });

  let data: any = undefined;
  try {
    data = await resp.json();
  } catch {
    // ignore non-JSON
  }

  if (!resp.ok) {
    const message = (data && (data.message || data.error || data.msg)) || (await parseError(resp));
    return { success: false, message, status: resp.status, data };
  }

  return { success: true, data, status: resp.status };
}

export async function updateBranch(id: string | number, branchData: Partial<Omit<Branch, 'id'>>, token?: string): Promise<ApiListResult> {
  const auth = getAuthToken(token);
  const resp = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Language': getCurrentLanguage(),
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    body: JSON.stringify(branchData),
  });

  let data: any = undefined;
  try {
    data = await resp.json();
  } catch {
    // ignore non-JSON
  }

  if (!resp.ok) {
    const message = (data && (data.message || data.error || data.msg)) || (await parseError(resp));
    return { success: false, message, status: resp.status, data };
  }

  return { success: true, data, status: resp.status };
}

export async function deleteBranch(id: string | number, token?: string): Promise<ApiListResult> {
  const auth = getAuthToken(token);
  const resp = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Accept-Language': getCurrentLanguage(),
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
  });

  if (resp.status === 204) { // No content on successful delete
    return { success: true, status: resp.status };
  }

  let data: any = undefined;
  try {
    data = await resp.json();
  } catch {
    // ignore non-JSON
  }

  if (!resp.ok) {
    const message = (data && (data.message || data.error || data.msg)) || (await parseError(resp));
    return { success: false, message, status: resp.status, data };
  }

  return { success: true, data, status: resp.status };
}


/**
 * Enable or disable DataProcessor
 * @param enabled - Boolean flag to enable/disable processing
 */
export function setDataProcessorEnabled(enabled: boolean): void {
  dataProcessor.setEnabled(enabled);
}

/**
 * Get DataProcessor status
 * @returns Status information
 */
export function getDataProcessorStatus() {
  return dataProcessor.getStatus();
}

/**
 * Get saved replacement data
 * @returns Array of saved replacement data
 */
export function getReplacementData() {
  return dataProcessor.getReplacementData();
}

/**
 * Update saved replacement data
 * @param newData - New replacement data
 */
export function setReplacementData(newData: any[]) {
  dataProcessor.setReplacementData(newData);
}

/**
 * Add or update a single replacement item
 * @param item - Replacement item to add or update
 */
export function setReplacementItem(item: any) {
  dataProcessor.setReplacementItem(item);
}

/**
 * Remove a replacement item by ID
 * @param id - ID of item to remove
 */
export function removeReplacementItem(id: number) {
  dataProcessor.removeReplacementItem(id);
}

/**
 * Clear all replacement data
 */
export function clearReplacementData() {
  dataProcessor.clearReplacementData();
}

/**
 * Test the DataProcessor with sample data
 * @returns Test result
 */
// export function testDataProcessor() {
//   console.log('Testing DataProcessor...');
  
//   // Test with sample data
//   const sampleResponse = {
//     success: true,
//     message: "Branches retrieved",
//     data: {
//       branches: [
//         {
//           id: 32,
//           name: "الاتحاد",
//           code: "001",
//           address: "طرابلس",
//           phone: "1111111111111",
//           email: "glucc@gmail.com"
//         },
//         {
//           id: 23,
//           name: "طرابلس",
//           code: "TNT",
//           address: "22St -Lybia",
//           phone: "0555555555",
//           email: "T@yahoo.com"
//         },
//         {
//           id: 33,
//           name: "غرفة التجارة والصناعة والزراعة - هلال العاصمة",
//           code: "003",
//           address: "طرابلس جنزور",
//           phone: "00218913434444",
//           email: "info@gucc.ly"
//         }
//       ],
//       pagination: {
//         page: 1,
//         page_size: 20,
//         total: 3,
//         total_pages: 1
//       }
//     },
//     timestamp: new Date().toISOString()
//   };
  
//   const result = dataProcessor.processBranchesToPorts(sampleResponse);
//   console.log('Test result:', result);
//   return result;
// }

/**
 * Test the getFilteredUsersCount method
 * @returns Test result
 */
// export async function testFilteredUsersCount() {
//   console.log('Testing Filtered Users Count from branchService...');
  
//   try {
//     const count = await dataProcessor.getFilteredUsersCount();
//     console.log('Filtered users count:', count);
//     return count;
//   } catch (error) {
//     console.error('Error testing filtered users count:', error);
//     return 0;
//   }
// }