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
  const token = localStorage.getItem('setsuzoku_access_token');
  const activeOrgId = localStorage.getItem('setsuzoku_active_org_id');

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

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorInfo = data?.error || {};
    throw new ApiError(
      errorInfo.message || `Request failed with status ${response.status}`,
      errorInfo.code || 'HTTP_ERROR',
      errorInfo.details
    );
  }

  return data.data;
}

