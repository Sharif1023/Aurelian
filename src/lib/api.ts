const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_URL as string) ||
  '/api';

const ADMIN_TOKEN_KEY = "adminToken";
const ADMIN_USER_KEY = "adminUser";

export type AdminUser = {
  id: string;
  username: string;
  email?: string | null;
  role: string;
  isActive?: boolean;
  is_active?: boolean;
};

export type LoginResponse = {
  success: boolean;
  token: string;
  admin: AdminUser;
};

export type AdminMeResponse = {
  success: boolean;
  admin: AdminUser;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAdminToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getAdminUser(): AdminUser | null {
  if (!isBrowser()) return null;

  const user = localStorage.getItem(ADMIN_USER_KEY);
  if (!user) return null;

  try {
    return JSON.parse(user) as AdminUser;
  } catch {
    return null;
  }
}

export function setAdminSession(data: LoginResponse) {
  if (!isBrowser()) return;

  localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
}

export function logoutAdmin() {
  if (!isBrowser()) return;

  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

export function isAdminLoggedIn(): boolean {
  return Boolean(getAdminToken());
}

function makeUrl(endpoint: string): string {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  return `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
}

function isFormData(body: BodyInit | null | undefined): boolean {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function buildHeaders(
  headers: HeadersInit | undefined,
  body: BodyInit | null | undefined,
  auth: boolean
): Headers {
  const finalHeaders = new Headers(headers || {});
  const token = getAdminToken();

  if (body && !isFormData(body) && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (auth && token && !finalHeaders.has("Authorization")) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  return finalHeaders;
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | null;
  auth?: boolean;
};

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("Content-Type") || "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => null);
}

function getErrorMessage(data: unknown, status: number): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error?: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }

  return `API error: ${status}`;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    auth = false,
    headers,
    body,
    ...fetchOptions
  } = options;

  const token = getAdminToken();

  if (auth && !token) {
    throw new ApiError("Please login again.", 401);
  }

  const url = makeUrl(endpoint);

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers: buildHeaders(headers, body, auth),
      body,
      mode: 'cors'
    });
  } catch (error) {
    console.error('Failed to fetch API endpoint:', url, error);
    throw new ApiError(`Failed to fetch: ${url}`, 0, error);
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const message = getErrorMessage(data, response.status);

    if (auth && response.status === 401) {
      logoutAdmin();
    }

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export async function apiGet<T>(
  endpoint: string,
  auth = false
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "GET",
    auth,
  });
}

export async function apiPost<T>(
  endpoint: string,
  data?: unknown,
  auth = false
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "POST",
    auth,
    body: data === undefined ? undefined : JSON.stringify(data),
  });
}

export async function apiPut<T>(
  endpoint: string,
  data?: unknown,
  auth = true
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "PUT",
    auth,
    body: data === undefined ? undefined : JSON.stringify(data),
  });
}

export async function apiPatch<T>(
  endpoint: string,
  data?: unknown,
  auth = true
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "PATCH",
    auth,
    body: data === undefined ? undefined : JSON.stringify(data),
  });
}

export async function apiDelete<T>(
  endpoint: string,
  auth = true
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "DELETE",
    auth,
  });
}

// =========================
// ADMIN AUTH
// =========================

export async function adminLogin(
  username: string,
  password: string
): Promise<LoginResponse> {
  const data = await apiPost<LoginResponse>(
    "/admin/login",
    {
      username,
      password,
    },
    false
  );

  setAdminSession(data);
  return data;
}

export async function adminLoginWithEmail(
  email: string,
  password: string
): Promise<LoginResponse> {
  const data = await apiPost<LoginResponse>(
    "/admin/login",
    {
      email,
      password,
    },
    false
  );

  setAdminSession(data);
  return data;
}

export async function getCurrentAdmin(): Promise<AdminMeResponse> {
  return apiGet<AdminMeResponse>("/admin/me", true);
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  return apiPut<{ success: boolean; message: string }>(
    "/admin/password",
    {
      currentPassword,
      newPassword,
    },
    true
  );
}

export async function adminSetup(
  setupKey: string,
  data: {
    username: string;
    email?: string;
    password: string;
  }
): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>("/admin/setup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-setup-key": setupKey,
    },
    body: JSON.stringify(data),
    auth: false,
  });

  setAdminSession(response);
  return response;
}