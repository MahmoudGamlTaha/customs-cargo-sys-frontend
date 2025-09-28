import { getToken } from '@/utils/getToken';
import { User, UserRole, Branch } from '../types';

const DEFAULT_BASE_URL = 'http://localhost:8080/api/v1/auth';
const BASE_URL: string = (import.meta as any)?.env?.VITE_API_BASE_URL
  ? `${(import.meta as any).env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/v1/auth`
  : DEFAULT_BASE_URL;


export interface IResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  status?: number;
}

export interface LoginResult {
  user: User;
  token?: string;
}
// Normalize API role strings to our UserRole enum
const normalizeRole = (role?: string): UserRole => {
  const r = (role || '').toLowerCase();
  switch (r) {
    case 'admin':
      return UserRole.Admin;
    case 'staff':
      return UserRole.Staff;
    case 'client':
      return UserRole.Member;
    case 'accountant':
      return UserRole.Accountant;
    case 'auditor':
      return UserRole.Auditor;
    case 'branch_admin':
      return UserRole.BranchAdmin;
  }
};

async function parseError(resp: Response): Promise<string> {
  try {
    const j = await resp.json();
    return j?.message || j?.error || j?.msg || resp.statusText || 'Request failed';
  } catch {
    return resp.statusText || 'Request failed';
  }
}

// Map arbitrary API user payloads to our internal User type
const mapApiUserToUser = (apiUser: any): User => {
  const id = String(
    apiUser?.id ?? apiUser?.userId ?? apiUser?.uuid ?? `user-${Date.now()}`
  );
  const firstName: string | undefined = apiUser?.first_name;
  const lastName: string | undefined = apiUser?.last_name;
  const fullName: string =
    apiUser?.fullName ||
    apiUser?.name ||
    (firstName && lastName
      ? `${firstName} ${lastName}`
      : apiUser?.username || apiUser?.email?.split?.('@')?.[0] || 'User');
  const email: string = apiUser?.email || '';
  const phone: string = apiUser?.phone || apiUser?.mobile || '';
  const role: UserRole = normalizeRole(apiUser?.role);
  const branchId: number = apiUser?.branch_id || 0;
  const createdAt: string = apiUser?.created_at || new Date().toISOString();
  const is_password_reset_required: boolean = apiUser?.is_password_reset_required || false;

  // Extract branch information if available
  const branch = apiUser?.branch ? {
    id: apiUser.branch.id,
    created_at: apiUser.branch.created_at,
    updated_at: apiUser.branch.updated_at,
    name: apiUser.branch.name,
    code: apiUser.branch.code,
    address: apiUser.branch.address,
    phone: apiUser.branch.phone,
    email: apiUser.branch.email,
  } : undefined;

  const user: User = {
    id,
    fullName,
    email,
    phone,
    role,
    is_password_reset_required,
    branchId,
    branch, // Add full branch information
    membershipId: apiUser?.membershipId || '',
    createdAt,
    status: 'Active',
    nameAr: fullName,
    nameEn: fullName,
    accessToken: apiUser?.accessToken || '',
    companyNameAr: `${fullName}'s Company`,
    companyNameEn: `${fullName}'s Company`,
  };
  return user;
};

export async function login(email: string, password: string): Promise<LoginResult> {
  const resp = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) {
    // Try to extract error message
    let msg = 'Login failed';
    try {
      const data = await resp.json();
      msg = data?.message || data?.error || msg;
    } catch { }
    throw new Error(msg);
  }

  const json = await resp.json();
  
  // Process the login data using DataProcessor
  console.log("Processing login data...");
  // const json = dataProcessor.processLogin(json as LoginResponse);
  console.log("Processed login data:", json);
  
  const token: string | undefined =
    json?.data?.token ?? json?.token ?? json?.accessToken ?? json?.jwt;
  // console.log(json?.data, "json?.data")
  const apiUser = json?.data?.user ?? json?.user ?? json?.data ?? json; // supports { data: { user } }
  const user = mapApiUserToUser(apiUser);
  user.accessToken = token || user.accessToken || '';
  
  // Store user with full branch information in localStorage
  localStorage.setItem('user', JSON.stringify(user));
  
  // console.log(user, "USER")
  // console.log(user.branch, "BRANCH")
  return { user, token };
}

/**
 * Test the DataProcessor with sample login data
 * @returns Test result
 */
// export function testLoginProcessor() {
//   console.log('Testing Login DataProcessor...');
  
//   // Test with sample data
//   const sampleLoginResponse = {
//     success: true,
//     message: "Login successful",
//     data: {
//       user: {
//         id: 1,
//         username: "admin",
//         email: "admin@gucc.com",
//         first_name: "System",
//         last_name: "Administrator",
//         phone: "110215454554",
//         is_active: true,
//         email_verified: true,
//         is_password_reset_required: false,
//         created_at: "2025-08-10T17:26:44.658295Z",
//         last_login: null,
//         branch_id: 33,
//         branch: {
//           id: 33,
//           created_at: "2025-09-17T12:34:53.957208Z",
//           updated_at: "2025-09-17T12:34:53.957208Z",
//           name: "غرفة التجارة والصناعة والزراعة - هلال العاصمة",
//           code: "003",
//           address: "طرابلس جنزور",
//           phone: "00218913434444",
//           email: "info@gucc.ly"
//         },
//         role_name: "admin",
//         role: "admin",
//         role_id: 4
//       },
//       token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
//     },
//     timestamp: "2025-09-23T20:17:28.8518843Z"
//   };
  
//   const result = dataProcessor.processLogin(sampleLoginResponse);
//   console.log('Test result:', result);
//   return result;
// }

/**
 * Test the convertBranchAdminToPortManager method
 * @returns Test result
 */
// export function testRoleConversion() {
//   console.log('Testing Role Conversion...');
  
//   // Test cases
//   const testCases = [
//     "branch_admin",
//     "admin", 
//     "staff",
//     "port_manager",
//     "user"
//   ];
  
//   testCases.forEach(role => {
//     const converted = dataProcessor.convertBranchAdminToPortManager(role);
//     console.log(`${role} -> ${converted}`);
//   });
  
//   return testCases.map(role => ({
//     original: role,
//     converted: dataProcessor.convertBranchAdminToPortManager(role)
//   }));
// }

/**
 * Test the getFilteredUsersCount method
 * @returns Test result
 */
// export async function testFilteredUsersCount() {
//   console.log('Testing Filtered Users Count...');
  
//   try {
//     const count = await dataProcessor.getFilteredUsersCount();
//     console.log('Filtered users count:', count);
//     return count;
//   } catch (error) {
//     console.error('Error testing filtered users count:', error);
//     return 0;
//   }
// }

export async function register(
  fullName: string,
  email: string,
  phone: string,
  branchId: number,
  password: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const resp = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, phone, branchId, password }),
    });

    let message: string | undefined;
    try {
      const json = await resp.json();
      message = json?.message || json?.msg;
    } catch {
      // Ignore JSON parse errors
    }

    if (!resp.ok) {
      throw new Error(message || 'Registration failed');
    }

    return { success: true, message };
  } catch (err) {
    console.error('Registration error:', err);
    return { success: false, message: err instanceof Error ? err.message : 'Registration failed' };
  }
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr) as User;
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      return null;
    }
  }
  return null;
}

export function getCurrentBranch(): Branch | null {
  const user = getCurrentUser();
  return user?.branch || null;
}
