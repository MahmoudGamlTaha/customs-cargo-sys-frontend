import { getToken } from '../utils/getToken';

export interface RequestCountData {
  total: number;
}

export interface RequestCountResponse {
  success: boolean;
  message: string;
  data: RequestCountData;
  timestamp: string;
}

export const getRequestCount = async (): Promise<RequestCountResponse> => {
  const token = getToken();
  if (!token) {
    console.error('No authentication token found.');
    throw new Error('Authentication required.');
  }

  const url = 'http://51.20.121.17:8080/api/v1/requests/count';

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
        'Authorization': `Bearer ${token}`,
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        'Referer': 'http://localhost:5173/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
    }

    const data: RequestCountResponse = await response.json();
    console.log('Request Count Response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching request count:', error);
    throw error;
  }
};
