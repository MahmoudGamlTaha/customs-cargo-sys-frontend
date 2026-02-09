import { data } from "react-router-dom";
import { DocumentRequest, SingleRequestResponse, UserActivity } from "../types";
import { DEFAULT_PAGINATION_PARAMS } from "../utils/generalPaginationForApplication";
import { getToken } from "@/utils/getToken";
import { IResponse } from "./authService";
import { getCurrentLanguage } from "@/contexts/LanguageContext";

const DEFAULT_BASE_URL = `http://localhost:8080/api/v1/requests`;
const BASE_URL: string = (import.meta as any)?.env?.VITE_API_BASE_URL
  ? `${(import.meta as any).env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/v1/requests`
  : DEFAULT_BASE_URL;

const DEFAULT_ACTIVITIES_BASE_URL = 'http://localhost:8080/api/v1/activities';
const ACTIVITIES_BASE_URL: string = (import.meta as any)?.env?.VITE_API_BASE_URL
  ? `${(import.meta as any).env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/v1/activities`
  : DEFAULT_ACTIVITIES_BASE_URL;


const BASE_URL_SOURCE: string = `${(
  import.meta as any
).env.VITE_API_BASE_URL.replace(/\/$/, "")}/api/v1`;

// Exact payload shape expected by the API
export interface RequestDetailPayload {
  client_name: string;
  transfer_detail: string;
  signs: string;
  number_of_parcel: number;
  description: string;
  weight: number;
  net_weight: number;
  client_id: number;
  user_id: number;
  invoice_number: string;
  invoice_date: string; // ISO 8601 string
  company_name: string;
  commerical_number: string;
  activity_type: string;
  address: string;
  phone_number: string;
  email: string;
  identity_number: string;
  mobile_number: string;
  for_official_use: string;
  country_producer: string;
  standard_of_origin: string;
}

export interface CreateRequestPayload {
  title: string;
  description: string;
  client_id: number;
  request_type_id: number;
  request_details: RequestDetailPayload[];
}

// Friendlier input types (camelCase) often used by forms, mapped to API payload
export interface RequestDetailInput {
  clientName: string;
  transferDetail: string;
  signs: string;
  numberOfParcel: number | string;
  description: string;
  weight: number | string;
  netWeight: number | string;
  clientId: number | string;
  userId: number | string;
  invoiceNumber: string;
  invoiceDate: string | Date; // will be converted to ISO
  companyName: string;
  commericalNumber: string;
  activityType: string;
  address: string;
  phoneNumber: string;
  email: string;
  identityNumber: string;
  mobileNumber: string;
  forOfficialUse: string;
  countryProducer: string;
  standardOfOrigin: string;
}

export interface CreateRequestInput {
  title: string;
  description: string;
  clientId: number | string;
  requestTypeId: number | string;
  requestDetails: RequestDetailInput[];
}

function toNumber(n: number | string): number {
  if (typeof n === 'number') return n;
  const parsed = Number(String(n).trim());
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number: ${n}`);
  }
  return parsed;
}

function getAuthToken(fallback?: string): string | undefined {
  if (fallback) return fallback;
  try {
    return localStorage.getItem('auth_token') || undefined;
  } catch {
    return undefined;
  }
}

function toIsoString(d: string | Date): string {
  if (d instanceof Date) return d.toISOString();
  // try to parse string
  const date = new Date(d);
  if (isNaN(date.getTime())) {
    // If already ISO-like, return as is; otherwise throw
    // Basic check for yyyy-mm-dd or ISO
    const isoLike = /\d{4}-\d{2}-\d{2}/.test(d);
    if (isoLike) return d;
    throw new Error(`Invalid date: ${d}`);
  }
  return date.toISOString();
}

export function mapToCreateRequestPayload(input: CreateRequestInput): CreateRequestPayload {
  return {
    title: input.title,
    description: input.description,
    client_id: toNumber(input.clientId),
    request_type_id: toNumber(input.requestTypeId),
    request_details: input.requestDetails?.map((d): RequestDetailPayload => ({
      client_name: d.clientName,
      transfer_detail: d.transferDetail,
      signs: d.signs,
      number_of_parcel: toNumber(d.numberOfParcel),
      description: d.description,
      weight: toNumber(d.weight),
      net_weight: toNumber(d.netWeight),
      client_id: toNumber(d.clientId),
      user_id: toNumber(d.userId),
      invoice_number: d.invoiceNumber,
      invoice_date: toIsoString(d.invoiceDate),
      company_name: d.companyName,
      commerical_number: d.commericalNumber,
      activity_type: d.activityType,
      address: d.address,
      phone_number: d.phoneNumber,
      email: d.email,
      identity_number: d.identityNumber,
      mobile_number: d.mobileNumber,
      for_official_use: d.forOfficialUse,
      country_producer: d.countryProducer,
      standard_of_origin: d.standardOfOrigin,
    })),
  };
}

export interface CreateRequestResponse<T = any> {
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

export async function createRequest(
  payload: CreateRequestPayload,
  token: string
): Promise<CreateRequestResponse> {
  const resp = await fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
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

// Convenience: accept camelCase inputs directly
export async function createRequestFromInputs(
  inputs: CreateRequestInput,
  token: string
): Promise<CreateRequestResponse> {
  const payload = mapToCreateRequestPayload(inputs);
  return createRequest(payload, token);
}

// Interface for request list response
export interface RequestListResponse {
  success: boolean;
  data?: {
    requests?: any[];
    pagination?: any;
  };
  message?: string;
  status?: number;
}

/**
 * Get all requests
 * @param token Authorization token
 * @returns List of requests
 */
export async function getAllRequests(
  pageSize?: number,
  pageNumber?: number,
): Promise<RequestListResponse> {
  try {
    let params: string = "?page=0&page_size=100";
    if (pageNumber && pageSize) {
      params = `?page=${pageNumber}&page_size=${pageSize}`;
    }
    const resp = await fetch(`${BASE_URL}${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
        Accept: "application/json",
      },
    });

    let data: any = undefined;
    try {
      data = await resp.json();
    } catch (error) {
      console.error("Error parsing response:", error);
      return { success: false, message: "Failed to parse server response" };
    }

    if (!resp.ok) {
      const message = data.message;
      return { success: data.success, message, status: resp.status, data };
    }

    // Transform the raw data to match the DocumentRequest type
    const transformedData = (data.data?.requests || data.data || [])?.map(
      (req: any) => ({
        id: req.id,
        serialNumber: req.serial_number || "",
        serviceType: req.request_type?.name || "N/A",
        serviceTypeId: req.request_type_id,
        request_type_name: req.request_type_name || "N/A",
        date: req.created_at, // Mapping createdAt to date
        createdAt: req.created_at,
        status: req.status,
        fee: req.fee || 0, // Providing default value for fee
        userId: req.user_id || "", // Providing default value for userId
        title: req.title || "",
        description: req.description || "",
        details: req.request_details || [],
        ratio: req.ratio,
        branch_id: req?.branch_id,
        rejection_reason: req?.rejection_reason,
      })
    );
    return {
      success: true,
      data: {
        requests: transformedData,
        pagination: data.data?.pagination || {},
      },
      status: resp.status,
    };
  } catch (error) {
    console.error("Error fetching requests:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
export async function approveRequest(
  requestId: string,
  token: string
): Promise<RequestListResponse> {
  try {
    const resp = await fetch(`${BASE_URL}/${requestId}/approve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    let data: any = undefined;
    try {
      data = await resp.json();
    } catch (error) {
      console.error("Error parsing response:", error);
      return { success: false, message: "Failed to parse server response" };
    }

    if (!resp.ok) {
      const message = data.message;
      return { success: data.success, message, status: resp.status, data };
    }

    return { success: true, data: data.data, status: resp.status };
  } catch (error) {
    console.error("Error approving request:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function markAsPaid(
  requestId: string,
  token: string
): Promise<RequestListResponse> {
  try {
    const resp = await fetch(`${BASE_URL}/${requestId}/mark-paid`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    let data: any = undefined;
    try {
      data = await resp.json();
    } catch (error) {
      console.error("Error parsing response:", error);
      return { success: false, message: "Failed to parse server response" };
    }

    if (!resp.ok) {
      const message = data.message;
      return { success: data.success, message, status: resp.status, data };
    }

    return { success: true, data: data.data, status: resp.status };
  } catch (error) {
    console.error("Error fetching requests:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getRequestById(
  requestId: string,
  token: string
): Promise<SingleRequestResponse> {
  try {
    const resp = await fetch(`${BASE_URL}/${requestId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await resp.json();

    if (!resp.ok) {
      return {
        success: false,
        message: data.message || "Failed to fetch request",
      };
    }

    // Transform the raw data to match the DocumentRequest type
    const req = data.data;
    const transformedData: DocumentRequest = {
      id: req.id,
      serialNumber: req.serial_number || "",
      serviceType: req.request_type?.name || "N/A",
      serviceTypeId: req.request_type_id,
      request_type_name: req.request_type_name || "N/A",
      date: req.created_at, // Mapping createdAt to date
      createdAt: req.created_at,
      status: req.status,
      fee: req.fee || 0, // Providing default value for fee
      userId: req.user_id || "", // Providing default value for userId
      title: req.title || "",
      description: req.description || "",
      details: req.request_details || [],
      ratio: req.ratio,
      rejection_reason: req?.rejection_reason,
      branch_id: req?.branch_id,
    };

    return { success: true, data: transformedData };
  } catch (error) {
    console.error("Error fetching request by ID:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function holdRequest(requestId: string, token: string): Promise<RequestListResponse> {
  try {
    const resp = await fetch(`${BASE_URL}/${requestId}/hold`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    let data: any = undefined;
    try {
      data = await resp.json();
    } catch (error) {
      console.error('Error parsing response:', error);
      return { success: false, message: 'Failed to parse server response' };
    }

    if (!resp.ok) {
      const message = data.message;
      return { success: data.success, message, status: resp.status, data };
    }

    return { success: true, data: data.data, status: resp.status };
  } catch (error) {
    console.error('Error holding request:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function rejectRequest(requestId: string, reason: string, token: string): Promise<RequestListResponse> {
  try {
    const resp = await fetch(`${BASE_URL}/${requestId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    let data: any = undefined;
    try {
      data = await resp.json();
    } catch (error) {
      console.error('Error parsing response:', error);
      return { success: false, message: 'Failed to parse server response' };
    }

    if (!resp.ok) {
      const message = data.message;
      return { success: data.success, message, status: resp.status, data };
    }

    return { success: true, data: data.data, status: resp.status };
  } catch (error) {
    console.error('Error rejecting request:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Interface for activities list response
export interface ActivityListResponse {
  success: boolean;
  data?: {
    activities?: UserActivity[];
    data?: UserActivity[];
    total?: number;
    page?: number;
    page_size?: number;
  };
  message?: string;
  status?: number;
}

/**
 * Get activities for a specific request
 * @param requestId Request ID to fetch activities for
 * @param token Authorization token
 * @param page Page number for pagination (optional)
 * @param pageSize Number of items per page (optional)
 * @returns List of activities related to the request
 */
export async function getRequestActivities(
  requestId: string,
  token: string,
  page: number = 1,
  pageSize: number = 10
): Promise<ActivityListResponse> {
  try {
    const ACTIVITIES_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL
      ? `${(import.meta as any).env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/v1/activities`
      : 'http://localhost:8080/api/v1/activities';

    // Build URL with query parameters for pagination
    const url = new URL(`${ACTIVITIES_BASE_URL}/module/request/entity/${requestId}`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('page_size', pageSize.toString());

    const resp = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Accept-Language': getCurrentLanguage(),
      },
    });

    let data: any = undefined;
    try {
      data = await resp.json();
    } catch (error) {
      console.error('Error parsing activities response:', error);
      return { success: false, message: 'Failed to parse server response' };
    }

    if (!resp.ok) {
      const message = data?.message || 'Failed to fetch activities';
      return { success: false, message, status: resp.status, data };
    }

    // Make sure we return a consistent structure
    const activities = data.data?.activities || data.data || [];

    return {
      success: true,
      data: {
        activities,
        total: data.data?.total || activities?.length,
        page: data.data?.page || page,
        page_size: data.data?.page_size || pageSize
      },
      status: resp.status
    };
  } catch (error) {
    console.error('Error fetching request activities:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function GetRequestsCount(): Promise<IResponse> {
  const auth = getToken() || getAuthToken();
  const url = `${BASE_URL}/count`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Accept-Language': getCurrentLanguage(),
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

export async function GetMembershipByIdPublic(id: string): Promise<IResponse> {
  if (id) {
    const url = `${BASE_URL_SOURCE}/membership/check/${id}`;
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        'Accept-Language': getCurrentLanguage(),
      },
      // body: JSON.stringify(req),
    });
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
