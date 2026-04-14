const API_BASE_URL =
  typeof window === 'undefined'
    ? "http://backend:8000" // Server-side (SSR)
    : "http://localhost:8000"; // Client-side

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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1${path}`, {
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
