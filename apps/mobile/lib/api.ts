const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

let token: string | null = null;

export function setToken(t: string | null) { token = t; }

export async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${path} — ${text}`);
  }
  return res.json();
}
