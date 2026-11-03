"use client";

export async function mtFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; data?: T; message?: string }> {
  const response = await fetch(`/api/medtrack${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    data?: T;
    message?: string;
  };
  return {
    ok: response.ok && payload.success !== false,
    status: response.status,
    data: payload.data,
    message: payload.message,
  };
}
