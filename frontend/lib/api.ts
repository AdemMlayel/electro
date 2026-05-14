const PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

const INTERNAL_API_BASE_URL =
  process.env.INTERNAL_API_BASE_URL ?? PUBLIC_API_BASE_URL;

function getApiBaseUrl(): string {
  return typeof window === "undefined" ? INTERNAL_API_BASE_URL : PUBLIC_API_BASE_URL;
}

function getPublicBackendOrigin(): string {
  try {
    return new URL(PUBLIC_API_BASE_URL).origin;
  } catch {
    return "http://localhost:8000";
  }
}

export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  try {
    return new URL(path, getPublicBackendOrigin()).toString();
  } catch {
    return path;
  }
}

function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
  return match ? match[1] : null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: "include",
    headers,
    ...options,
  });

  if (!res.ok) {
    let errorMessage = "Request failed";
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      const errorText = await res.text();
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  // Some endpoints (register) return empty body
  if (res.status === 204) {
    return null as T;
  }

  return res.json();
}
