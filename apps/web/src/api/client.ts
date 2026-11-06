const BASE_URL = '/api/v1';

export class ApiError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string = 'ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

const DEMO_FALLBACK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyX2FkbWluXzAwMSIsImlhdCI6MTc5Mzk4OTI4OSwiZXhwIjoxODI1NTI1Mjg5fQ.546mN5cJR-gjybNYmwAH2vgNC35bOXR0hfaS0OaWAfc';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    localStorage.getItem('setsuzoku_access_token') ||
    localStorage.getItem('accessToken') ||
    DEMO_FALLBACK_TOKEN;
  const activeOrgId =
    localStorage.getItem('setsuzoku_active_org_id') ||
    localStorage.getItem('activeOrgId') ||
    'org_demo_001';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (activeOrgId) {
    headers['X-Organization-Id'] = activeOrgId;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorInfo = data?.error || {};
      const fallbackMsg =
        response.status === 500
          ? 'Server temporarily unavailable. Please try again shortly.'
          : `Request failed with status ${response.status}`;

      throw new ApiError(
        errorInfo.message || fallbackMsg,
        errorInfo.code || `HTTP_${response.status}`,
        errorInfo.details
      );
    }

    return data?.data !== undefined ? data.data : data;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      err.message || 'Unable to connect to the server. Please check your connection and try again.',
      'NETWORK_ERROR'
    );
  }
}

