import { ApiError } from "../../utils/ApiError";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_URL environment variable");
}

type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: QueryParams;
};

const apiBaseUrl = API_URL.replace(/\/$/, "");
const REFRESH_PATH = "/auth/refresh";

let refreshPromise: Promise<boolean> | null = null;

function buildUrl(path: string, params?: QueryParams) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${apiBaseUrl}${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type");

  if (response.status === 204) {
    return null;
  }

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  document.cookie = "session=; path=/; max-age=0";
}

async function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    try {
      const response = await fetch(buildUrl(REFRESH_PATH), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) return false;

      const data = await parseResponse(response);
      if (!data?.accessToken || !data?.refreshToken) return false;

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

function handleSessionExpired(): never {
  clearSession();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
  throw new ApiError("Session expired", 401, { message: "Sesión expirada" });
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, params, ...fetchOptions } = options;
  const requestBody = isFormData(body) ? body : JSON.stringify(body);
  const requestHeaders = new Headers(headers);

  const isRefreshRequest = path === REFRESH_PATH;
  const hasStoredToken =
    typeof window !== "undefined" && !!localStorage.getItem("accessToken");

  if (typeof window !== "undefined" && hasStoredToken && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${localStorage.getItem("accessToken")}`);
  }

  if (body !== undefined && !isFormData(body) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const doFetch = async (authHeaders: Headers) => {
    const response = await fetch(buildUrl(path, params), {
      ...fetchOptions,
      body: body === undefined ? undefined : requestBody,
      headers: authHeaders,
    });
    const data = await parseResponse(response);
    return { response, data };
  };

  const firstAttempt = await doFetch(requestHeaders);

  if (
    firstAttempt.response.status === 401 &&
    !isRefreshRequest &&
    hasStoredToken
  ) {
    const refreshed = await refreshSession();
    if (refreshed) {
      const retryHeaders = new Headers(requestHeaders);
      retryHeaders.set("Authorization", `Bearer ${localStorage.getItem("accessToken")}`);
      const retry = await doFetch(retryHeaders);
      if (retry.response.ok) return retry.data as T;
    }
    return handleSessionExpired();
  }

  if (!firstAttempt.response.ok) {
    throw new ApiError(
      firstAttempt.response.statusText || "Request failed",
      firstAttempt.response.status,
      firstAttempt.data
    );
  }

  return firstAttempt.data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, body, method: "POST" }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, body, method: "PUT" }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, body, method: "PATCH" }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
