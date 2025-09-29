import { getToken } from '@/utils/getToken';
import { User, UserRole } from '../types';
// import { dataProcessor, RolesResponse, UsersResponse } from '@/utils/DataProcessor';
import { IResponse } from './authService';

const DEFAULT_BASE_URL = 'http://localhost:8080/api/v1';
const BASE_URL: string = (import.meta as any)?.env?.VITE_API_BASE_URL
  ? `${(import.meta as any).env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/v1`
  : DEFAULT_BASE_URL;

export interface CreateAdminUserInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole | string;
  branchId: number | string;
}

export interface CreateAdminUserPayload {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  branch_id: number;
}

export interface CreateAdminUserResult {
  success: boolean;
  data?: any;
  message?: string;
}

export interface IchangePassReq {
  current_password: string;
  new_password: string;
  new_passwrod_again: string;
}
export interface IresetPasswordProps {
  new_password: string;
}

export interface IAssignRoleToPermissionReq {
  roleId: number;
  listOfPermissions: number[];
}

function getAuthToken(): string | undefined {
  try {
    console.log(JSON.parse(localStorage.getItem('user') || '{}'));
    return JSON.parse(localStorage.getItem('user') || '{}').accessToken;
  } catch {
    return undefined;
  }
}

function toBranchIdNumber(branchId: number | string): number {
  if (typeof branchId === 'number') return branchId;
  const n = Number(branchId);
  if (!Number.isNaN(n) && Number.isFinite(n)) return n;
  // Fallback: attempt to extract trailing digits e.g., "chamber_1" -> 1
  const match = String(branchId).match(/(\d+)$/);
  return match ? Number(match[1]) : NaN;
}

export function mapToCreateAdminUserPayload(input: CreateAdminUserInput): CreateAdminUserPayload {
  const roleStr = typeof input.role === 'string' ? input.role : String(input.role);
  const branchNum = toBranchIdNumber(input.branchId);
  return {
    username: input.username,
    email: input.email,
    password: input.password,
    first_name: input.firstName,
    last_name: input.lastName,
    phone: input.phone,
    role: roleStr,
    branch_id: branchNum,
  };
}

export async function createAdminUser(input: User): Promise<CreateAdminUserResult> {
  const token = getAuthToken();
  // const payload = mapToCreateAdminUserPayload(input);
  const url = `${BASE_URL}/admin/users`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });

  let data: any = undefined;
  let message: string | undefined = undefined;
  try {
    data = await resp.json();
    message = data?.message || data?.msg;
  } catch {
    // ignore parse error
  }

  if (!resp.ok) {
    return { success: false, message: message || 'Failed to create user', data };
  }

  return { success: true, data, message };
}

// --- List Admin Users ---
export interface ListAdminUsersResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  status?: number;
}

async function parseError(resp: Response): Promise<string> {
  try {
    const j = await resp.json();
    return j?.message || j?.error || j?.msg || resp.statusText || 'Request failed';
  } catch {
    return resp.statusText || 'Request failed';
  }
}

// Normalize API role strings to our UserRole enum
export const normalizeRole = (role?: string): UserRole => {
  const r = (role || '').toLowerCase();
  switch (r) {
    case 'admin':
      return UserRole.Admin;
    case 'staff':
      return UserRole.Staff;
    case 'client':
    case 'member':
    case 'user':
    case 'customer':
      return UserRole.Member;
    case 'accountant':
      return UserRole.Accountant;
    case 'branch_admin':
    case 'branchadmin':
      return UserRole.BranchAdmin;
    case 'port_manager':
      return UserRole.PortManager;
    case 'auditor':
      return UserRole.Auditor;
    default:
      return UserRole.Member;
  }
};

// Map arbitrary API user payloads to our internal User type
export function mapApiUserToUser(apiUser: any): User {
  const id = String(
    apiUser?.id ?? apiUser?.userId ?? apiUser?.uuid ?? `user-${Date.now()}`
  );
  const firstName = apiUser?.firstName || apiUser?.first_name || '';
  const lastName = apiUser?.lastName || apiUser?.last_name || '';
  const fullName: string =
    apiUser?.fullName ||
    apiUser?.name ||
    (firstName && lastName ? `${firstName} ${lastName}` : (apiUser?.username || apiUser?.email?.split?.('@')?.[0] || 'User'));
  const email: string = apiUser?.email || '';
  const phone: string = apiUser?.phone || apiUser?.mobile || '';
  const role: UserRole = normalizeRole(apiUser?.role);
  const branchId: number = apiUser?.branchId || (apiUser?.branch_id != null ? apiUser?.branch_id : 0);
  const createdAt: string = apiUser?.createdAt || apiUser?.created_at || new Date().toISOString();  

  const user: User = {
    id,
    fullName,
    email,
    phone,
    role,
    branchId,
    membershipId: apiUser?.membershipId || '',
    createdAt,
    status: 'Active',
    nameAr: fullName,
    nameEn: fullName,
    companyNameAr: `${fullName}`,
    companyNameEn: `${fullName}`,
    is_active: apiUser?.is_active,
  } as User;
  return user;
}

export interface Role {
  id?: number;
  created_at?: string;   // ISO datetime string
  updated_at?: string;   // ISO datetime string
  name_ar: string;
  name_en: string;
  code: string;
}

export interface IPermissions {
  id?: number;
  created_at?: string;   // ISO datetime string
  updated_at?: string;   // ISO datetime string
  name_ar: string;
  name_en: string;
  code: string;
}

export interface IuserProfile {
  id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active?: boolean;
  email_verified?: boolean;
  is_password_reset_required?: boolean;
  created_at?: string;   // ISO date string
  last_login?: string | null;
  role_name?: string;
  role?: string;
  role_id?: number;
  branch_name?: string;
}

export async function listAdminUsers(token?: string, page?: number, pageSize?: number): Promise<ListAdminUsersResult> {
  const auth = token || getAuthToken() || getToken();
  let params: string = `?page=${page || 0}&page_size=${pageSize || 100}`;
  const url = `${BASE_URL}/admin/users${params}`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
  });
  console.log(`Bearer ${auth}`);
  let data: any = undefined;
  try {
    data = await resp.json();
  } catch { }

  if (!resp.ok) {
    const message = (data && (data.message || data.error || data.msg)) || (await parseError(resp));
    return { success: false, message, status: resp.status, data };
  }

  // Process the data using DataProcessor
  // console.log("Processing users data...");
  // console.log("DataProcessor status:", dataProcessor.getStatus());
  // const processedData = dataProcessor.processUsers(data as UsersResponse);
  // console.log("Processed users data:", processedData);

  return { success: true, data: data, status: resp.status };
}


export async function GetAllRoles(): Promise<ListAdminUsersResult> {
  const auth = getToken() || getAuthToken();
  const url = `${BASE_URL}/admin/roles`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
  });
  console.log(`Bearer ${auth}`);
  let data: any = undefined;
  try {
    data = await resp.json();
  } catch { }

  if (!resp.ok) {
    const message = (data && (data.message || data.error || data.msg)) || (await parseError(resp));
    return { success: false, message, status: resp.status, data };
  }

  // Process the data using DataProcessor
  // console.log("Processing roles data...");
  // const processedData = dataProcessor.processRoles(data as RolesResponse);
  // console.log("Processed roles data:", processedData);

  return { success: true, data: data, status: resp.status };
}

/**
 * Test the DataProcessor with sample roles data
 * @returns Test result
 */
// export function testRolesProcessor() {
//   console.log('Testing Roles DataProcessor...');
  
//   // Test with sample data
//   const sampleRolesResponse = {
//     success: true,
//     message: "Roles retrieved successfully",
//     data: [
//       {
//         id: 2,
//         created_at: "0001-01-01T00:00:00Z",
//         updated_at: "0001-01-01T00:00:00Z",
//         name_ar: "عميل",
//         name_en: "Client",
//         code: "client"
//       },
//       {
//         id: 3,
//         created_at: "0001-01-01T00:00:00Z",
//         updated_at: "0001-01-01T00:00:00Z",
//         name_ar: "موظف",
//         name_en: "Staff",
//         code: "staff"
//       },
//       {
//         id: 4,
//         created_at: "0001-01-01T00:00:00Z",
//         updated_at: "0001-01-01T00:00:00Z",
//         name_ar: "مسؤول",
//         name_en: "Admin",
//         code: "admin"
//       },
//       {
//         id: 5,
//         created_at: "0001-01-01T00:00:00Z",
//         updated_at: "0001-01-01T00:00:00Z",
//         name_ar: "محاسب",
//         name_en: "Accountant",
//         code: "accountant"
//       },
//       {
//         id: 6,
//         created_at: "0001-01-01T00:00:00Z",
//         updated_at: "0001-01-01T00:00:00Z",
//         name_ar: "مدقق",
//         name_en: "Auditor",
//         code: "auditor"
//       },
//       {
//         id: 13,
//         created_at: "0001-01-01T00:00:00Z",
//         updated_at: "0001-01-01T00:00:00Z",
//         name_ar: "مدير غرفة",
//         name_en: "branch_admin",
//         code: "branch_admin"
//       }
//     ],
//     timestamp: "2025-09-23T19:35:10.5106581Z"
//   };
  
//   const result = dataProcessor.processRoles(sampleRolesResponse);
//   console.log('Test result:', result);
//   return result;
// }

/**
 * Test the DataProcessor with sample users data
 * @returns Test result
 */
// export function testUsersProcessor() {
//   console.log('Testing Users DataProcessor...');
  
//   // Test with sample data
//   const sampleUsersResponse = {
//     success: true,
//     message: "Users retrieved",
//     data: {
//       pagination: {
//         page: 1,
//         page_size: 10,
//         total: 11,
//         total_pages: 2
//       },
//       users: [
//         {
//           id: 68,
//           created_at: "2025-09-18T09:16:34.958531Z",
//           updated_at: "0001-01-01T00:00:00Z",
//           username: "AhmedQassem@G.com",
//           email: "AhmedQassem@G.com",
//           first_name: "احمد",
//           last_name: "قاسم",
//           phone: "55623654785",
//           role_id: null,
//           company_id: null,
//           branch_id: 32,
//           is_active: true,
//           email_verified: true,
//           is_password_reset_required: false,
//           last_login: null,
//           role: "admin"
//         },
//         {
//           id: 67,
//           created_at: "2025-09-17T12:55:17.303094Z",
//           updated_at: "0001-01-01T00:00:00Z",
//           username: "finance-1",
//           email: "fin@gucc.ly",
//           first_name: "سامي",
//           last_name: "الاتحادي",
//           phone: "0913434444",
//           role_id: null,
//           company_id: null,
//           branch_id: 33,
//           is_active: true,
//           email_verified: true,
//           is_password_reset_required: false,
//           last_login: null,
//           role: "accountant"
//         },
//         {
//           id: 66,
//           created_at: "2025-09-17T12:53:26.866485Z",
//           updated_at: "0001-01-01T00:00:00Z",
//           username: "Osama-02",
//           email: "osama@gucc.ly",
//           first_name: "أسامة ",
//           last_name: "بن سونس",
//           phone: "0913434444",
//           role_id: null,
//           company_id: null,
//           branch_id: 33,
//           is_active: true,
//           email_verified: true,
//           is_password_reset_required: false,
//           last_login: null,
//           role: "auditor"
//         },
//         {
//           id: 65,
//           created_at: "2025-09-17T12:47:39.39742Z",
//           updated_at: "0001-01-01T00:00:00Z",
//           username: "sami-1",
//           email: "ggucc@gucc.ly",
//           first_name: "sami",
//           last_name: "ali",
//           phone: "0913434444",
//           role_id: null,
//           company_id: null,
//           branch_id: 33,
//           is_active: true,
//           email_verified: true,
//           is_password_reset_required: false,
//           last_login: null,
//           role: "staff"
//         },
//         {
//           id: 64,
//           created_at: "2025-09-17T12:40:53.499103Z",
//           updated_at: "0001-01-01T00:00:00Z",
//           username: "zyad-1",
//           email: "gucc@gucc.ly",
//           first_name: "زياد",
//           last_name: "وادي",
//           phone: "0913434444",
//           role_id: null,
//           company_id: null,
//           branch_id: 33,
//           is_active: true,
//           email_verified: true,
//           is_password_reset_required: false,
//           last_login: null,
//           role: "branch_admin"
//         }
//       ]
//     },
//     timestamp: "2025-09-23T19:44:07.3459576Z"
//   };
  
//   const result = dataProcessor.processUsers(sampleUsersResponse);
//   console.log('Test result:', result);
//   return result;
// }

export async function createNewRole(role: Role): Promise<ListAdminUsersResult> {
  const auth = getToken() || getAuthToken();
  const url = `${BASE_URL}/admin/roles`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    body: JSON.stringify(role),
  });

  console.log(`Bearer ${auth}`);

  let data: any = undefined;
  try {
    data = await resp.json();
  } catch { }

  if (!resp.ok) {
    const message =
      (data && (data.message || data.error || data.msg)) ||
      (await parseError(resp));
    return { success: false, message, status: resp.status, data };
  }

  return { success: true, data, status: resp.status };
}

export async function GetAllPermissions(): Promise<ListAdminUsersResult> {
  const auth = getToken() || getAuthToken();
  const url = `${BASE_URL}/admin/permissions`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
  });
  console.log(`Bearer ${auth}`);
  let data: any = undefined;
  try {
    data = await resp.json();
  } catch { }

  if (!resp.ok) {
    const message = (data && (data.message || data.error || data.msg)) || (await parseError(resp));
    return { success: false, message, status: resp.status, data };
  }

  return { success: true, data, status: resp.status };
}

export async function AssignRoleToPermission(assignReq: IAssignRoleToPermissionReq): Promise<ListAdminUsersResult> {
  const auth = getToken() || getAuthToken();
  const url = `${BASE_URL}/admin/roles/${assignReq?.roleId}/permissions`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    body: JSON.stringify(assignReq.listOfPermissions),
  });

  console.log(`Bearer ${auth}`);

  let data: any = undefined;
  try {
    data = await resp.json();
  } catch { }

  if (!resp.ok) {
    const message =
      (data && (data.message || data.error || data.msg)) ||
      (await parseError(resp));
    return { success: false, message, status: resp.status, data };
  }

  return { success: true, data, status: resp.status };
}

export async function GetUserPermission(userId: number): Promise<ListAdminUsersResult> {
  const auth = getToken() || getAuthToken();
  const url = `${BASE_URL}/admin/users/${userId}/permissions`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
  });
  console.log(`Bearer ${auth}`);
  let data: any = undefined;
  try {
    data = await resp.json();
  } catch { }

  if (!resp.ok) {
    const message = (data && (data.message || data.error || data.msg)) || (await parseError(resp));
    return { success: false, message, status: resp.status, data };
  }

  return { success: true, data, status: resp.status };
}

export async function GetRolePermissions(RoleId: number): Promise<ListAdminUsersResult> {
  if (RoleId) {
    const auth = getToken() || getAuthToken();
    const url = `${BASE_URL}/admin/roles/${RoleId}/permissions`;
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
    });
    console.log(`Bearer ${auth}`);
    let data: any = undefined;
    try {
      data = await resp.json();
    } catch { }

    if (!resp.ok) {
      const message = (data && (data.message || data.error || data.msg)) || (await parseError(resp));
      return { success: false, message, status: resp.status, data };
    }

    return { success: true, data, status: resp.status };
  }
}

export async function DeleteRole(RoleId: number): Promise<ListAdminUsersResult> {
  if (RoleId) {
    const auth = getToken() || getAuthToken();
    const url = `${BASE_URL}/admin/roles/${RoleId}`;
    const resp = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
    });
    console.log(`Bearer ${auth}`);
    let data: any = undefined;
    try {
      data = await resp.json();
    } catch { }

    if (!resp.ok) {
      const message = (data && (data.message || data.error || data.msg)) || (await parseError(resp));
      return { success: false, message, status: resp.status, data };
    }
    return { success: true, data, status: resp.status };
  }
}

export async function ResetUserPassword(userId: number): Promise<ListAdminUsersResult> {
  if (userId) {
    const tempReq: IresetPasswordProps = { new_password: 'password' }
    const auth = getToken() || getAuthToken();
    const url = `${BASE_URL}/admin/users/${userId}/reset-password`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
      body: JSON.stringify(tempReq),
    });
    console.log(`Bearer ${auth}`);
    let data: any = undefined;
    try {
      data = await resp.json();
    } catch { }

    if (!resp.ok) {
      const message = (data && (data.message || data.error || data.msg)) || (await parseError(resp));
      return { success: false, message, status: resp.status, data };
    }
    return { success: true, data, status: resp.status };
  }
}


export async function ChangeUserPassword(
  token: string,
  req: IchangePassReq
): Promise<IResponse> {
  if (token) {
    const auth = getToken() || getAuthToken();
    const url = `${BASE_URL}/users/change-password`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
      body: JSON.stringify(req),
    });
    console.log(`Bearer ${auth}`);
    let data: any = undefined;
    try {
      data = await resp.json();
    } catch { }

    if (!resp.ok) {
      const message =
        (data && (data.message || data.error || data.msg)) ||
        (await parseError(resp));
      return { success: false, message, status: resp.status, data };
    }
    return { success: true, data, status: resp.status };
  }
}

export async function UpdateUserProfile(
  req: IuserProfile
): Promise<IResponse> {
  const token = getToken() || getAuthToken();
  if (token) {
    const url = `${BASE_URL}/users/profile`;
    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(req),
    });
    console.log(`Bearer ${token}`);
    let data: any = undefined;
    try {
      data = await resp.json();
    } catch { }

    if (!resp.ok) {
      const message =
        (data && (data.message || data.error || data.msg)) ||
        (await parseError(resp));
      return { success: false, message, status: resp.status, data };
    }
    return { success: true, data, status: resp.status };
  }
}


export async function GetMyProfile(): Promise<ListAdminUsersResult> {
  const auth = getToken() || getAuthToken();
  if (auth) {
    const url = `${BASE_URL}/users/profile`;
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
    });
    console.log(`Bearer ${auth}`);
    let data: any = undefined;
    try {
      data = await resp.json();
    } catch { }

    if (!resp.ok) {
      const message = (data && (data.message || data.error || data.msg)) || (await parseError(resp));
      return { success: false, message, status: resp.status, data };
    }

    return { success: true, data, status: resp.status };
  }
}

export async function GetUserById(userId: number): Promise<ListAdminUsersResult> {
  const auth = getToken() || getAuthToken();
  if (auth && userId) {
    const url = `${BASE_URL}/admin/users/${userId}`;
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
    });
    // console.log(`Bearer ${auth}`);
    let data: any = undefined;
    try {
      data = await resp.json();
    } catch { }

    if (!resp.ok) {
      const message = (data && (data.message || data.error || data.msg)) || (await parseError(resp));
      return { success: false, message, status: resp.status, data };
    }

    return { success: true, data, status: resp.status };
  }
}


export async function UpdateUser(
  req: User
): Promise<IResponse> {
  console.log(req, "UpdateUserReq")
  const token = getToken() || getAuthToken();
  if (token) {
    const url = `${BASE_URL}/admin/users/${req?.id}`;
    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(req),
    });
    console.log(`Bearer ${token}`);
    let data: any = undefined;
    try {
      data = await resp.json();
    } catch { }

    if (!resp.ok) {
      const message =
        (data && (data.message || data.error || data.msg)) ||
        (await parseError(resp));
      return { success: false, message, status: resp.status, data };
    }
    return { success: true, data, status: resp.status };
  }
}

export async function GetBranchedRatioDetails(): Promise<IResponse> {
  const auth = getToken() || getAuthToken();
  const url = `${BASE_URL}/admin/requests/ratio-sum-per-branch`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
  });
  console.log(`Bearer ${auth}`);
  let data: any = undefined;
  try {
    data = await resp.json();
  } catch { }

  if (!resp.ok) {
    const message = (data && (data.message || data.error || data.msg)) || (await parseError(resp));
    return { success: false, message, status: resp.status, data };
  }

  return { success: true, data, status: resp.status };
}