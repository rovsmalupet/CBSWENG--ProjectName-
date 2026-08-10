/**
 * api.js — the single HTTP client.
 *
 * The previous version threw `new Error("API Error: 500 Internal Server Error")`
 * and pages rendered that string straight to the user, so people saw raw HTTP
 * status text. It also logged every failure to the browser console, which leaks
 * response shapes to anyone with devtools open. [CSSECDV 2.4.2]
 *
 * This version understands the server's error envelope:
 *
 *     { error: { message, code, errorId?, fields?, details? } }
 *
 * `message` is always safe to display — the server guarantees it (see
 * middleware/errorHandler.js), so the UI can show it without second-guessing.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export { API_BASE_URL };

export const getApiUrl = (path) => `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/* ═══════════════════════════════════════════════════════════════════════════
 * SESSION STORAGE
 * ═══════════════════════════════════════════════════════════════════════════ */

const TOKEN_KEY = "token";
const SESSION_KEYS = [
  TOKEN_KEY,
  "userFirstName",
  "userRole",
  "userId",
  "userCountry",
  "previousAccess",
];

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const clearSession = () => {
  for (const key of SESSION_KEYS) localStorage.removeItem(key);
  sessionStorage.removeItem(REAUTH_KEY);
};

/**
 * The re-authentication token lives in sessionStorage, not localStorage.
 *
 * It is a five-minute proof that the user just re-entered their password. Tying
 * it to the tab means closing the tab discards it, and it never persists to
 * disk alongside the session token. [2.1.13]
 */
const REAUTH_KEY = "reauthToken";
export const setReauthToken = (token) => sessionStorage.setItem(REAUTH_KEY, token);
export const getReauthToken = () => sessionStorage.getItem(REAUTH_KEY);
export const clearReauthToken = () => sessionStorage.removeItem(REAUTH_KEY);

/* ═══════════════════════════════════════════════════════════════════════════
 * ERRORS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * An error carrying everything the server chose to disclose — and nothing more.
 * `code` lets callers branch (REAUTH_REQUIRED opens the password prompt);
 * `fields` drives per-field messages on forms; `errorId` is what the user can
 * quote to an administrator, who can find the full stack in the security log.
 */
export class ApiError extends Error {
  constructor({ message, code, errorId, fields, details, status }) {
    super(message || "Something went wrong. Please try again.");
    this.name = "ApiError";
    this.code = code ?? "UNKNOWN";
    this.errorId = errorId ?? null;
    this.fields = fields ?? null;
    this.details = details ?? null;
    this.status = status ?? 0;
  }
}

/** Registered by AuthContext so a 401 anywhere can end the session once. */
let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

/* ═══════════════════════════════════════════════════════════════════════════
 * REQUESTS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {string} url
 * @param {object} [options]
 * @param {boolean} [options.withReauth] attach the re-authentication token
 * @param {boolean} [options.raw] body is FormData; do not set Content-Type
 */
export const apiFetch = async (url, options = {}) => {
  const { withReauth = false, raw = false, headers: extraHeaders, ...rest } = options;

  const token = getToken();
  const headers = {
    ...(raw ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(withReauth && getReauthToken() ? { "X-Reauth-Token": getReauthToken() } : {}),
    ...extraHeaders,
  };

  let response;
  try {
    response = await fetch(url, { ...rest, headers });
  } catch {
    // Network-level failure. Deliberately vague — the browser's own message
    // ("Failed to fetch", CORS text) tells a user nothing useful.
    throw new ApiError({
      message: "We could not reach the server. Please check your connection and try again.",
      code: "NETWORK_ERROR",
    });
  }

  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const envelope = payload?.error ?? {};

    // The session is gone or was revoked. Clear it once, centrally, so every
    // caller does not have to remember to.
    if (response.status === 401) {
      clearSession();
      onUnauthorized?.();
    }

    // A single-use proof was rejected; never reuse it.
    if (envelope.code === "REAUTH_REQUIRED") clearReauthToken();

    throw new ApiError({
      message: envelope.message,
      code: envelope.code,
      errorId: envelope.errorId,
      fields: envelope.fields,
      details: envelope.details,
      status: response.status,
    });
  }

  return payload;
};

/* ── Convenience wrappers ─────────────────────────────────────────────────── */

export const apiGet = (path, options) => apiFetch(getApiUrl(path), { method: "GET", ...options });

export const apiPost = (path, body, options) =>
  apiFetch(getApiUrl(path), { method: "POST", body: JSON.stringify(body), ...options });

export const apiPatch = (path, body, options) =>
  apiFetch(getApiUrl(path), { method: "PATCH", body: JSON.stringify(body), ...options });

export const apiPut = (path, body, options) =>
  apiFetch(getApiUrl(path), { method: "PUT", body: JSON.stringify(body), ...options });

export const apiDelete = (path, options) =>
  apiFetch(getApiUrl(path), { method: "DELETE", ...options });

/** Multipart. Content-Type is left unset so the browser adds the boundary. */
export const apiUpload = (path, formData, options) =>
  apiFetch(getApiUrl(path), { method: "POST", body: formData, raw: true, ...options });

/** Build a query string from defined values only. */
export const queryString = (params) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
};
