export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const STORE_ID = Number(import.meta.env.VITE_STORE_ID || 1);

type RequestOptions = {
  token?: string;
};

type APIEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
};

export class APIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

function authHeaders(token?: string): Record<string, string> {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {
    ...authHeaders(options?.token),
  };

  if (method !== 'GET' && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });

  const data = (await res.json()) as APIEnvelope<T>;
  if (!res.ok || data.success === false) {
    throw new APIError(data.error || 'Request failed', res.status);
  }

  return data.data as T;
}

export async function apiGet<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>('GET', path, undefined, options);
}

export async function apiPost<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
  return request<T>('POST', path, body, options);
}

export async function apiPut<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
  return request<T>('PUT', path, body, options);
}

export async function apiDelete<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>('DELETE', path, undefined, options);
}

export async function apiPostForm<T>(path: string, formData: FormData, options?: RequestOptions): Promise<T> {
  return request<T>('POST', path, formData, options);
}

const ADMIN_TOKEN_KEY = 'vayla_admin_token_';

export function getAdminToken(storeId: number): string {
  return localStorage.getItem(`${ADMIN_TOKEN_KEY}${storeId}`) || '';
}

export function setAdminToken(storeId: number, token: string): void {
  localStorage.setItem(`${ADMIN_TOKEN_KEY}${storeId}`, token);
}

export function clearAdminToken(storeId: number): void {
  localStorage.removeItem(`${ADMIN_TOKEN_KEY}${storeId}`);
}

export function hasAdminToken(storeId: number): boolean {
  return !!getAdminToken(storeId);
}
