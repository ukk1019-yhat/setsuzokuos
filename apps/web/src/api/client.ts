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

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    localStorage.getItem('setsuzoku_access_token') ||
    localStorage.getItem('accessToken');
  const activeOrgId =
    localStorage.getItem('setsuzoku_active_org_id') ||
    localStorage.getItem('activeOrgId');

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
          ? 'API server error (500). Please ensure the API backend is running on port 4000.'
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
      err.message || 'Network connection failed. Verify API backend connectivity.',
      'NETWORK_ERROR'
    );
  }
}

