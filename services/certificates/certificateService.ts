// Certificate Service - Handles certificate operations
import { getCurrentLanguage } from '@/contexts/LanguageContext';
import { getCurrentUser } from '../authService';

// Base URL configuration
const DEFAULT_BASE_URL = 'http://localhost:8080/api/v1';
const BASE_URL: string = (import.meta as any)?.env?.VITE_API_BASE_URL
  ? `${(import.meta as any).env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/v1`
  : DEFAULT_BASE_URL;

// Certificate data interface based on API response
export interface CertificateData {
  id: number;
  title: string;
  client_name: string;
  transfer_detail: string | null;
  signs: string | null;
  number_of_parcel: number;
  request_id: number;
  description: string | null;
  weight: number | null;
  client_id: number;
  user_id: number;
  quantity: number | null;
  net_weight: number | null;
  invoice_number: string;
  invoice_date: string | null;
  created_at: string;
  updated_at: string;
  company_name: string | null;
  commerical_number: string | null;
  activity_type: string | null;
  address: string | null;
  phone_number: string | null;
  email: string | null;
  identity_number: string;
  mobile_number: string;
  company_name_en: string | null;
  country_producer: string | null;
  request_type_name: string | null;
  for_official_use: string | null;
  standard_of_origin: string | null;
  serial_number?: string | null;
  certificate_number?: string | null;
  serialNumber?: string | null;
  extra?: string | null;
  free_trade_extra_data?: string | null;
}

// API Response interfaces
export interface CertificateApiResponse {
  success: boolean;
  message: string;
  data?: CertificateData;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

// Service error class
export class CertificateServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'CertificateServiceError';
  }
}

/**
 * Get certificate by ID
 * @param certificateId - The ID of the certificate to retrieve
 * @returns Promise<CertificateData> - The certificate data
 * @throws CertificateServiceError - If the request fails or certificate not found
 */
export async function getCertificateById(certificateId: number): Promise<CertificateData> {
  try {
    // Get current user for authorization
    const user = getCurrentUser();
    if (!user || !user.accessToken) {
      throw new CertificateServiceError('User not authenticated', 'UNAUTHENTICATED', 401);
    }

    // Make API request
    const response = await fetch(`${BASE_URL}/requests/${certificateId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'insomnia/11.4.0',
        'Accept-Language': getCurrentLanguage(),
      }
    });

    // Parse response
    const data: CertificateApiResponse = await response.json();

    // Handle API response
    if (!data.success) {
      const errorCode = data.error?.code || 'UNKNOWN_ERROR';
      const errorMessage = data.error?.message || data.message || 'Failed to retrieve certificate';
      
      if (errorCode === 'NOT_FOUND') {
        throw new CertificateServiceError('Certificate not found', 'NOT_FOUND', 404);
      }
      
      throw new CertificateServiceError(errorMessage, errorCode, response.status);
    }

    // Validate data exists
    if (!data.data) {
      throw new CertificateServiceError('Invalid response: no certificate data received', 'INVALID_RESPONSE', 500);
    }

    return data.data;

  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new CertificateServiceError('Network error: Unable to connect to server', 'NETWORK_ERROR', 0);
    }

    // Re-throw CertificateServiceError instances
    if (error instanceof CertificateServiceError) {
      throw error;
    }

    // Handle unexpected errors
    throw new CertificateServiceError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      'UNEXPECTED_ERROR',
      500
    );
  }
}

/**
 * Get certificate by ID with error handling wrapper
 * @param certificateId - The ID of the certificate to retrieve
 * @returns Promise<{ success: boolean; data?: CertificateData; error?: string }>
 */
export async function getCertificateByIdSafe(certificateId: number): Promise<{
  success: boolean;
  data?: CertificateData;
  error?: string;
}> {
  try {
    const data = await getCertificateById(certificateId);
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}
