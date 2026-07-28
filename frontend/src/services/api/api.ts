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

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, params, ...fetchOptions } = options;
  const requestBody = isFormData(body) ? body : JSON.stringify(body);
  const requestHeaders = new Headers(headers);

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token && !requestHeaders.has("Authorization")) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  if (body !== undefined && !isFormData(body) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path, params), {
    ...fetchOptions,
    body: body === undefined ? undefined : requestBody,
    headers: requestHeaders,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(response.statusText || "Request failed", response.status, data);
  }

  return data as T;
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
