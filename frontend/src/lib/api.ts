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

// Auth
export async function apiRegister(email: string, password: string) {
  return apiFetch<{ user_id: string; email: string; token: string }>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function apiLogin(email: string, password: string) {
  return apiFetch<{ user_id: string; email: string; token: string }>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function apiGetMe() {
  return apiFetch<{ user_id: string; email: string }>("/auth/me");
}

// Decks
export async function apiGetDecks() {
  return apiFetch<any[]>("/decks");
}

export async function apiCreateDeck(name: string, description: string) {
  return apiFetch<any>("/decks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
}

export async function apiGetDeck(deckId: string) {
  return apiFetch<any>(`/decks/${deckId}`);
}

export async function apiDeleteDeck(deckId: string) {
  return apiFetch<any>(`/decks/${deckId}`, { method: "DELETE" });
}

export async function apiUploadPdf(deckId: string, file: File, subject: string = "general") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("subject", subject);

  // Start the upload (returns immediately with job_id)
  const uploadRes = await fetch(`${API_BASE}/decks/${deckId}/upload-pdf`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  });

  if (uploadRes.status === 401) {
    localStorage.removeItem("fc_token");
    localStorage.removeItem("fc_user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!uploadRes.ok) {
    const body = await uploadRes.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(body.detail || `Error ${uploadRes.status}`);
  }

  const { job_id } = await uploadRes.json();

  // Poll for job completion
  return pollJobStatus(job_id);
}

async function pollJobStatus(jobId: string): Promise<{ deck_id: string; cards_generated: number; sample_cards: any[]; subject: string; rag_enabled: boolean }> {
  const maxAttempts = 120; // 10 minutes max (5 second intervals)
  let attempts = 0;
  let consecutiveErrors = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

    try {
      const statusRes = await fetch(`${API_BASE}/jobs/${jobId}`, {
        headers: { ...authHeaders() },
      });

      if (statusRes.status === 401) {
        localStorage.removeItem("fc_token");
        localStorage.removeItem("fc_user");
        window.location.href = "/login";
        throw new Error("Unauthorized");
      }

      if (!statusRes.ok) {
        consecutiveErrors++;
        if (consecutiveErrors > 3) {
          throw new Error("Failed to check job status after multiple attempts");
        }
        attempts++;
        continue; // Retry on next iteration
      }

      // Reset error counter on success
      consecutiveErrors = 0;

      const job = await statusRes.json();

      if (job.status === "completed") {
        return job.result;
      }

      if (job.status === "failed") {
        throw new Error(job.error || "PDF processing failed");
      }

      // Still processing, continue polling
      attempts++;
    } catch (err: any) {
      // Network error or fetch failed
      if (err.message === "Unauthorized") throw err;
      
      consecutiveErrors++;
      if (consecutiveErrors > 5) {
        throw new Error("Connection lost. Please check if the backend is running.");
      }
      
      // Continue polling despite errors (backend might be waking up)
      attempts++;
    }
  }

  throw new Error("PDF processing timed out after 10 minutes");
}

export async function apiGenerateFromTopic(deckId: string) {
  return apiFetch<{ deck_id: string; cards_generated: number }>(
    `/decks/${deckId}/generate`,
    { method: "POST" }
  );
}

// Cards
export async function apiGetCards(deckId: string, dueOnly = false) {
  const query = dueOnly ? "?due_only=true" : "";
  return apiFetch<any[]>(`/cards/deck/${deckId}${query}`);
}

export async function apiRateCard(cardId: string, qualityRating: number, timeSpentSeconds?: number) {
  return apiFetch<any>(`/cards/${cardId}/rate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      quality_rating: qualityRating,
      time_spent_seconds: timeSpentSeconds 
    }),
  });
}

// Stats
export async function apiGetDeckStats(deckId: string) {
  return apiFetch<any>(`/stats/deck/${deckId}`);
}

export async function apiGetOverallStats() {
  return apiFetch<any>("/stats/overall");
}
