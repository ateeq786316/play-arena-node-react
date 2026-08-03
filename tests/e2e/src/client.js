export class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  setFromResponse(res) {
    const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const raw of setCookies) {
      const [pair] = raw.split(";");
      const idx = pair.indexOf("=");
      if (idx === -1) continue;
      const name = pair.slice(0, idx).trim();
      const value = pair.slice(idx + 1).trim();
      if (value === "") {
        this.cookies.delete(name);
      } else {
        this.cookies.set(name, value);
      }
    }
  }

  header() {
    if (this.cookies.size === 0) return "";
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  has(name) {
    return this.cookies.has(name);
  }
}

export class ApiClient {
  constructor({ baseUrl, jar = new CookieJar(), on401Refresh = true } = {}) {
    this.baseUrl = baseUrl;
    this.jar = jar;
    this.on401Refresh = on401Refresh;
  }

  async raw(method, path, { body, headers = {}, auth = true } = {}) {
    const url = /^https?:\/\//.test(path) ? path : `${this.baseUrl}${path}`;
    const cookie = this.jar.header();
    const res = await fetch(url, {
      method,
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      redirect: "manual",
    });
    this.jar.setFromResponse(res);
    return res;
  }

  async request(method, path, opts = {}) {
    let res = await this.raw(method, path, opts);
    if (res.status === 401 && this.on401Refresh) {
      const refreshRes = await this.raw("POST", "/api/user/refresh", {});
      if (refreshRes.ok || [200, 201].includes(refreshRes.status)) {
        res = await this.raw(method, path, opts);
      }
    }
    return res;
  }

  async get(path, opts) {
    return this.request("GET", path, opts);
  }

  async post(path, body, opts) {
    return this.request("POST", path, { ...opts, body });
  }

  async patch(path, body, opts) {
    return this.request("PATCH", path, { ...opts, body });
  }

  async delete(path, opts) {
    return this.request("DELETE", path, opts);
  }

  async json(method, path, opts) {
    const res = await this.request(method, path, opts);
    const text = await res.text();
    let parsed = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }
    return { res, body: parsed, rawText: text };
  }
}

export function createClient(baseUrl = process.env.E2E_API_URL ?? "http://localhost:3000") {
  return new ApiClient({ baseUrl });
}
