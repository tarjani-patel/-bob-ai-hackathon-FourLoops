/**
 * TrialGuard AI — HTTP API Client
 *
 * Configures base URL, JSON handling, and automatic RBAC header injection
 * matching the active user session.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SESSION_STORAGE_KEY = "trialguard_auth_session_v1";

const ROLE_HEADER_MAP = {
  cra: "CRA",
  investigator: "SITE_INVESTIGATOR",
  data_manager: "DATA_MANAGER",
  sponsor: "SPONSOR",
};

/**
 * Retrieves the current session headers for prototype RBAC enforcement.
 */
export function getAuthHeaders() {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  try {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (rawSession) {
      const session = JSON.parse(rawSession);
      if (session?.role) {
        const mappedRole = ROLE_HEADER_MAP[session.role.toLowerCase()] || session.role.toUpperCase();
        headers["X-Demo-Role"] = mappedRole;
      }
      if (session?.assignedSite) {
        headers["X-Demo-Site"] = session.assignedSite;
      }
      if (session?.name) {
        headers["X-Demo-User"] = session.name;
      }
    }
  } catch (err) {
    console.warn("[TrialGuard API] Failed to parse session for auth headers:", err);
  }

  return headers;
}

/**
 * Generic fetch wrapper with error handling and query param stringification.
 */
export async function apiClient(endpoint, options = {}) {
  const { params, headers = {}, ...customOptions } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const mergedHeaders = {
    ...getAuthHeaders(),
    ...headers,
  };

  const response = await fetch(url, {
    ...customOptions,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson?.detail) {
        errorDetail = typeof errorJson.detail === "string" 
          ? errorJson.detail 
          : JSON.stringify(errorJson.detail);
      }
    } catch {
      // Ignore JSON parse error on non-json error responses
    }
    const error = new Error(errorDetail);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export { API_BASE_URL };
