import { getToken } from "@/utils/getToken";

// Types for API responses
export interface RatioSumResponse {
  success: boolean;
  message: string;
  data: {
    ratio_sum: number;
  };
  timestamp: string;
}

export interface MemberCountResponse {
  success: boolean;
  message: string;
  data: {
    member_count: number;
  };
  timestamp: string;
}

export interface RequestsCountResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
  };
  timestamp: string;
}

// API Base URL
const API_BASE_URL = 'http://51.20.121.17:8080/api/v1';

/**
 * Get ratio sum for admin dashboard
 * @returns Promise<RatioSumResponse>
 */
export const getRatioSum = async (): Promise<RatioSumResponse> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('🔍 AdminDashboard - Fetching ratio sum...');
    console.log('🔍 AdminDashboard - Token:', token.substring(0, 20) + '...');

    const response = await fetch(`${API_BASE_URL}/admin/requests/ratio-sum`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 AdminDashboard - Ratio sum response status:', response.status);
    console.log('🔍 AdminDashboard - Ratio sum response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AdminDashboard - Ratio sum API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`Failed to fetch ratio sum: ${response.status} ${response.statusText}`);
    }

    const data: RatioSumResponse = await response.json();
    console.log('✅ AdminDashboard - Ratio sum data:', data);
    
    return data;
  } catch (error) {
    console.error('❌ AdminDashboard - Ratio sum error:', error);
    throw error;
  }
};

/**
 * Get member count for admin dashboard
 * @returns Promise<MemberCountResponse>
 */
export const getMemberCount = async (): Promise<MemberCountResponse> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('🔍 AdminDashboard - Fetching member count...');
    console.log('🔍 AdminDashboard - Token:', token.substring(0, 20) + '...');

    const response = await fetch(`${API_BASE_URL}/admin/users/member-count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 AdminDashboard - Member count response status:', response.status);
    console.log('🔍 AdminDashboard - Member count response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AdminDashboard - Member count API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`Failed to fetch member count: ${response.status} ${response.statusText}`);
    }

    const data: MemberCountResponse = await response.json();
    console.log('✅ AdminDashboard - Member count data:', data);
    
    return data;
  } catch (error) {
    console.error('❌ AdminDashboard - Member count error:', error);
    throw error;
  }
};

/**
 * Get requests count for admin dashboard
 * @returns Promise<RequestsCountResponse>
 */
export const getRequestsCount = async (): Promise<RequestsCountResponse> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('🔍 AdminDashboard - Fetching requests count...');
    console.log('🔍 AdminDashboard - Token:', token.substring(0, 20) + '...');

    const response = await fetch(`${API_BASE_URL}/requests/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 AdminDashboard - Requests count response status:', response.status);
    console.log('🔍 AdminDashboard - Requests count response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AdminDashboard - Requests count API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`Failed to fetch requests count: ${response.status} ${response.statusText}`);
    }

    const data: RequestsCountResponse = await response.json();
    console.log('✅ AdminDashboard - Requests count data:', data);
    
    return data;
  } catch (error) {
    console.error('❌ AdminDashboard - Requests count error:', error);
    throw error;
  }
};
