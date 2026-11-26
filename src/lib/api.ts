function resolveBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (!raw) return '/api';
  if (raw.endsWith('/api/attendance')) return raw.replace(/\/attendance$/, '');
  if (raw.endsWith('/api')) return raw;
  return `${raw}/api`;
}

const API_BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('campusbite_auth_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const rawText = await response.text();
  let data: any = null;
  const contentType = response.headers.get('content-type') || '';
  const looksLikeJson =
    contentType.includes('application/json') ||
    (rawText.trim().startsWith('{') && rawText.trim().endsWith('}')) ||
    (rawText.trim().startsWith('[') && rawText.trim().endsWith(']'));

  if (looksLikeJson) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (data && (data.error || data.message)) {
      throw new ApiError(data.error || data.message, response.status, data);
    }
    if (
      rawText.includes('<!DOCTYPE') ||
      rawText.includes('<html') ||
      rawText.includes('The page could not be found') ||
      rawText.includes('NOT_FOUND')
    ) {
      throw new ApiError(
        `Backend API service is unreachable (${response.status} ${response.statusText || 'Not Found'}). The server returned an HTML error page. Check your Vercel deployment rewrites or configure VITE_API_URL to point to your backend.`,
        response.status,
        rawText
      );
    }
    const cleanSnippet = rawText.replace(/<[^>]*>?/gm, '').trim().slice(0, 150);
    const errorMessage = cleanSnippet || response.statusText || 'Request failed';
    throw new ApiError(errorMessage, response.status, data || rawText);
  }

  return (data !== null ? data : rawText) as T;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { method: 'GET', ...options }),
  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
};
