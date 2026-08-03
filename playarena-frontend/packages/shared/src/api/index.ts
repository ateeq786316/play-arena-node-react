const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export class ApiError extends Error {
  public errors?: Array<{ field: string; msg: string }>;

  constructor(
    public status: number,
    public body: { message?: string; errors?: Array<{ field: string; msg: string }> },
  ) {
    super(body.message || `Request failed with status ${status}`);
    this.errors = body.errors;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
    ...options,
  });

  if (res.status === 401 && !path.includes("/refresh")) {
    const refreshRes = await fetch(`${API_BASE_URL}/api/user/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshRes.ok) {
      return request<T>(method, path, body, options);
    }
  }

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new ApiError(res.status, json);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
