export function isJsonResponse(res) {
  const ct = res.headers.get("content-type") ?? "";
  return ct.includes("application/json");
}

export function parseBody(res, rawText) {
  try {
    return rawText ? JSON.parse(rawText) : null;
  } catch {
    return null;
  }
}

export function assertStatus(res, expected, { path, context = "" } = {}) {
  if (res.status !== expected) {
    throw new Error(
      `status mismatch${context ? ` [${context}]` : ""} for ${path ?? "?"}: got ${res.status}, expected ${expected}`
    );
  }
}

export function assertOk2xx(res, { path, context = "" } = {}) {
  if (!(res.status >= 200 && res.status < 300)) {
    throw new Error(
      `expected 2xx${context ? ` [${context}]` : ""} for ${path ?? "?"}, got ${res.status}`
    );
  }
}

export function assertEnvelope(res, body, { path, context = "" } = {}) {
  assertOk2xx(res, { path, context });
  if (res.status !== 204 && !isJsonResponse(res)) {
    throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected content-type application/json`);
  }
  if (res.status !== 204 && body === null) {
    throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: response body is not JSON`);
  }
}

export function assertWrapped(body, key, { path, context = "" } = {}) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected wrapped object, got ${JSON.stringify(body)?.slice(0, 120)}`);
  }
  if (!Array.isArray(body[key])) {
    throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected array at .${key}, got ${JSON.stringify(body[key])?.slice(0, 120)}`);
  }
  return body[key];
}

export function assertBareArray(body, { path, context = "" } = {}) {
  if (!Array.isArray(body)) {
    throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected bare array, got ${JSON.stringify(body)?.slice(0, 120)}`);
  }
  return body;
}

export function assertDirectObject(body, keys = [], { path, context = "" } = {}) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected direct object, got ${JSON.stringify(body)?.slice(0, 120)}`);
  }
  for (const k of keys) {
    if (!(k in body)) {
      throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: missing key "${k}" in ${JSON.stringify(body).slice(0, 200)}`);
    }
  }
  return body;
}

export function assertError(res, body, expectedStatus, { messageRe, path, context = "" } = {}) {
  assertStatus(res, expectedStatus, { path, context });
  if (body === null || typeof body.message !== "string") {
    throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected error body with .message, got ${JSON.stringify(body)?.slice(0, 160)}`);
  }
  if (messageRe && !messageRe.test(body.message)) {
    throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: message "${body.message}" did not match ${messageRe}`);
  }
}

export const assert401 = (res, body, opts) => assertError(res, body, 401, opts);
export const assert403 = (res, body, opts) => assertError(res, body, 403, opts);
export const assert404 = (res, body, opts) => assertError(res, body, 404, opts);
export const assert409 = (res, body, opts) => assertError(res, body, 409, opts);
export const assert429 = (res, body, opts) => assertError(res, body, 429, opts);

export function assertValidation(res, body, { path, context = "" } = {}) {
  if (!(res.status === 400 || res.status === 422)) {
    throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected 400/422 validation, got ${res.status}`);
  }
  if (body === null || body.errors === undefined || !Array.isArray(body.errors)) {
    throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected errors[] in validation body, got ${JSON.stringify(body)?.slice(0, 160)}`);
  }
}
