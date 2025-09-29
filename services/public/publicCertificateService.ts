import { getToken } from "@/utils/getToken";

const DEFAULT_BASE_URL = `http://localhost:8080/api/v1/requests`;
const BASE_URL: string = (import.meta as any)?.env?.VITE_API_BASE_URL
  ? `${(import.meta as any).env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/v1/request`
  : DEFAULT_BASE_URL;

// Base URL for certificate validation (different endpoint)
const VALIDATION_BASE_URL: string = (import.meta as any)?.env?.VITE_API_BASE_URL
  ? `${(import.meta as any).env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/v1/request`
  : `http://localhost:8080/api/v1/request`;

export interface PublicCertificateData {
  id: number;
  title: string;
  client_name: string;
  transfer_detail: string;
  signs: string;
  number_of_parcel: number;
  request_id: number;
  description: string;
  weight: number;
  client_id: number;
  user_id: number;
  quantity: number | null;
  net_weight: number;
  invoice_number: string;
  invoice_date: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  commerical_number: string;
  activity_type: string;
  address: string;
  phone_number: string;
  email: string;
  identity_number: string;
  mobile_number: string;
  company_name_en: string | null;
  qr_identifier: string;
  country_producer: string;
  request_type_name: string | null;
  for_official_use: string;
  standard_of_origin: string;
  exporter_name: string;
  serial_number: string;
  extra: string;
  foreign_items_cost: string;
}

export interface PublicCertificateResponse {
  success: boolean;
  message: string;
  data: PublicCertificateData;
  timestamp: string;
}

// Interface for certificate validation response
export interface CertificateValidationData {
  id: number;
  serial_number: string;
  title: string;
  description: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  create_by_user_id: number;
  approved_by_user_id: number | null;
  request_type_id: number;
  request_details: any | null;
  qr_identifier: string;
}

export interface CertificateValidationResponse {
  success: boolean;
  message: string;
  data: CertificateValidationData;
  timestamp: string;
}

export const getPublicCertificateByQrId = async (qrIdentifier: string): Promise<PublicCertificateData> => {
  console.log("BASE_URL",BASE_URL);
  
  try {
    const response = await fetch(`${BASE_URL}/${qrIdentifier}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Certificate not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: PublicCertificateResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to retrieve certificate');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching public certificate:', error);
    throw error;
  }
};

/**
 * Search for a certificate by serial number for validation
 * @param serialNumber - The serial number to search for (e.g., "MAIN001-110")
 * @returns Promise<CertificateValidationData> - The certificate data if found
 */
export const searchCertificateBySerial = async (serialNumber: string): Promise<CertificateValidationData> => {
  console.log("VALIDATION_BASE_URL", VALIDATION_BASE_URL);
  console.log("Searching for serial number:", serialNumber);
  
  try {
    const auth = getToken();
    const response = await fetch(`${VALIDATION_BASE_URL}/serial/${serialNumber}`, {
      method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Certificate not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: CertificateValidationResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to retrieve certificate');
    }

    return result.data;
  } catch (error) {
    console.error('Error searching certificate by serial:', error);
    throw error;
  }
};
