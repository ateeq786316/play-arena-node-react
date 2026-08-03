# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: j3-booking.spec.js >> J3 Booking & Payment >> price preview returns direct PricePreview object
- Location: src\journey.js:22:7

# Error details

```
Error: expected 2xx for pricing/preview, got 500
```

# Test source

```ts
  1  | export function isJsonResponse(res) {
  2  |   const ct = res.headers.get("content-type") ?? "";
  3  |   return ct.includes("application/json");
  4  | }
  5  | 
  6  | export function parseBody(res, rawText) {
  7  |   try {
  8  |     return rawText ? JSON.parse(rawText) : null;
  9  |   } catch {
  10 |     return null;
  11 |   }
  12 | }
  13 | 
  14 | export function assertStatus(res, expected, { path, context = "" } = {}) {
  15 |   if (res.status !== expected) {
  16 |     throw new Error(
  17 |       `status mismatch${context ? ` [${context}]` : ""} for ${path ?? "?"}: got ${res.status}, expected ${expected}`
  18 |     );
  19 |   }
  20 | }
  21 | 
  22 | export function assertOk2xx(res, { path, context = "" } = {}) {
  23 |   if (!(res.status >= 200 && res.status < 300)) {
> 24 |     throw new Error(
     |           ^ Error: expected 2xx for pricing/preview, got 500
  25 |       `expected 2xx${context ? ` [${context}]` : ""} for ${path ?? "?"}, got ${res.status}`
  26 |     );
  27 |   }
  28 | }
  29 | 
  30 | export function assertEnvelope(res, body, { path, context = "" } = {}) {
  31 |   assertOk2xx(res, { path, context });
  32 |   if (res.status !== 204 && !isJsonResponse(res)) {
  33 |     throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected content-type application/json`);
  34 |   }
  35 |   if (res.status !== 204 && body === null) {
  36 |     throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: response body is not JSON`);
  37 |   }
  38 | }
  39 | 
  40 | export function assertWrapped(body, key, { path, context = "" } = {}) {
  41 |   if (body === null || typeof body !== "object" || Array.isArray(body)) {
  42 |     throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected wrapped object, got ${JSON.stringify(body)?.slice(0, 120)}`);
  43 |   }
  44 |   if (!Array.isArray(body[key])) {
  45 |     throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected array at .${key}, got ${JSON.stringify(body[key])?.slice(0, 120)}`);
  46 |   }
  47 |   return body[key];
  48 | }
  49 | 
  50 | export function assertBareArray(body, { path, context = "" } = {}) {
  51 |   if (!Array.isArray(body)) {
  52 |     throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected bare array, got ${JSON.stringify(body)?.slice(0, 120)}`);
  53 |   }
  54 |   return body;
  55 | }
  56 | 
  57 | export function assertDirectObject(body, keys = [], { path, context = "" } = {}) {
  58 |   if (body === null || typeof body !== "object" || Array.isArray(body)) {
  59 |     throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected direct object, got ${JSON.stringify(body)?.slice(0, 120)}`);
  60 |   }
  61 |   for (const k of keys) {
  62 |     if (!(k in body)) {
  63 |       throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: missing key "${k}" in ${JSON.stringify(body).slice(0, 200)}`);
  64 |     }
  65 |   }
  66 |   return body;
  67 | }
  68 | 
  69 | export function assertError(res, body, expectedStatus, { messageRe, path, context = "" } = {}) {
  70 |   assertStatus(res, expectedStatus, { path, context });
  71 |   if (body === null || typeof body.message !== "string") {
  72 |     throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected error body with .message, got ${JSON.stringify(body)?.slice(0, 160)}`);
  73 |   }
  74 |   if (messageRe && !messageRe.test(body.message)) {
  75 |     throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: message "${body.message}" did not match ${messageRe}`);
  76 |   }
  77 | }
  78 | 
  79 | export const assert401 = (res, body, opts) => assertError(res, body, 401, opts);
  80 | export const assert403 = (res, body, opts) => assertError(res, body, 403, opts);
  81 | export const assert404 = (res, body, opts) => assertError(res, body, 404, opts);
  82 | export const assert409 = (res, body, opts) => assertError(res, body, 409, opts);
  83 | export const assert429 = (res, body, opts) => assertError(res, body, 429, opts);
  84 | 
  85 | export function assertValidation(res, body, { path, context = "" } = {}) {
  86 |   if (!(res.status === 400 || res.status === 422)) {
  87 |     throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected 400/422 validation, got ${res.status}`);
  88 |   }
  89 |   if (body === null || body.errors === undefined || !Array.isArray(body.errors)) {
  90 |     throw new Error(`${context ? `[${context}] ` : ""}${path ?? "?"}: expected errors[] in validation body, got ${JSON.stringify(body)?.slice(0, 160)}`);
  91 |   }
  92 | }
  93 | 
```