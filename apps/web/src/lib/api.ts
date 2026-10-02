/**
 * Base URL of the FastAPI backend.
 *
 * Always comes from the environment so the same bundle works against
 * localhost, a preview deployment, or production. There is deliberately no
 * hardcoded host anywhere else in this file.
 *
 * The API mounts its routers under `/v1` (see apps/api/app/main.py:
 * `app.include_router(chapters.router, prefix="/v1")`), so the full URL for
 * chapters is `${BASE}/v1/chapters` - the `/v1` segment below is part of the
 * contract, not a duplicate of the router prefix.
 */
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Health endpoint, mounted at the root (not under /v1). */
export const HEALTH_URL = `${BASE}/health`;

export interface Chapter {
  id: string;
  title: string;
  pages: [string, string, string];
  authorUid: string;
  authorName: string;
  authorPhoto: string | null;
  language: string;
  place: { label: string; lat: number; lng: number } | null;
  icon: string;
  heroImagePath: string | null;
  audioPath: string | null;
  status: "pending" | "published" | "needs_review" | "rejected";
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  chapterNumber: number;
}

export interface Translation {
  title: string;
  pages: [string, string, string];
  createdAt: string;
}

async function fetchApi<T>(
  path: string,
  options?: RequestInit,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/v1${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${res.status}`);
  }
  return res.json();
}

export const api = {
  getChapters: (token?: string) => fetchApi<Chapter[]>("/chapters", {}, token),
  getChapter: (id: string, token?: string) => fetchApi<Chapter>(`/chapters/${id}`, {}, token),
  createChapter: (data: Partial<Chapter>, token: string) =>
    fetchApi<Chapter>("/chapters", { method: "POST", body: JSON.stringify(data) }, token),
  updateChapter: (id: string, data: Partial<Chapter>, token: string) =>
    fetchApi<Chapter>(`/chapters/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),
  deleteChapter: (id: string, token: string) =>
    fetchApi<{ ok: boolean }>(`/chapters/${id}`, { method: "DELETE" }, token),
  translate: (id: string, lang: string, token?: string) =>
    fetchApi<Translation>(`/chapters/${id}/translate?lang=${lang}`, {}, token),
  similar: (id: string, token?: string) =>
    fetchApi<Chapter[]>(`/chapters/${id}/similar`, {}, token),
  transcribe: (formData: FormData, token: string) =>
    fetchApi<{ transcript: string; language: string }>("/voice/transcribe", { method: "POST", body: formData }, token),
  weave: (text: string, token: string) =>
    fetchApi<{ title: string; pages: [string, string, string] }>("/agent/weave", { method: "POST", body: JSON.stringify({ text }) }, token),
  signUpload: (fileName: string, contentType: string, token: string) =>
    fetchApi<{ uploadUrl: string; publicUrl: string }>("/upload/sign", { method: "POST", body: JSON.stringify({ fileName, contentType }) }, token),
  trackEvent: (event: string, data: Record<string, string>) =>
    fetchApi<{ ok: boolean }>("/events", { method: "POST", body: JSON.stringify({ event, ...data }) }),
  getAdminChapters: (token: string) => fetchApi<Chapter[]>("/admin/chapters", {}, token),
  moderateChapter: (id: string, action: "publish" | "reject", token: string) =>
    fetchApi<Chapter>(`/admin/chapters/${id}/moderate`, { method: "POST", body: JSON.stringify({ action }) }, token),
  featureChapter: (id: string, featured: boolean, token: string) =>
    fetchApi<Chapter>(`/admin/chapters/${id}/feature`, { method: "POST", body: JSON.stringify({ featured }) }, token),
  getAnalytics: (token: string) => fetchApi<Record<string, number>>("/admin/analytics", {}, token),
};
