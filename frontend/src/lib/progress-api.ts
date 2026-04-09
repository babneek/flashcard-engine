const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken(): string | null {
  return localStorage.getItem("fc_token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("fc_token");
    localStorage.removeItem("fc_user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(body.detail || `Error ${res.status}`);
  }

  return res.json();
}

// Progress API
export async function apiGetDashboard() {
  return apiFetch<any>("/progress/dashboard");
}

export async function apiGetDeckProgress(deckId: string) {
  return apiFetch<any>(`/progress/deck/${deckId}`);
}

export async function apiGetStreak() {
  return apiFetch<any>("/progress/streak");
}

export async function apiGetWeakAreas() {
  return apiFetch<any>("/progress/weak-areas");
}

export async function apiGetProgressChart(days: number = 30) {
  return apiFetch<any>(`/progress/chart?days=${days}`);
}
