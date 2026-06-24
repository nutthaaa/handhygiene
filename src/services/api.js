const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/+$/, "");
const TOKEN_KEY = "cleanhands-token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;
  if (!response.ok) {
    if (response.status === 401) {
      setToken("");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    const message = payload?.error || `คำขอไม่สำเร็จ (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export async function login(username, password) {
  const data = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data.user;
}

export function fetchMe() {
  return request("/auth/me").then((data) => data.user);
}

export function logout() {
  setToken("");
}

export function fetchObservations(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value != null && value !== ""),
  ).toString();
  return request(`/observations${query ? `?${query}` : ""}`);
}

export function createObservation(record) {
  return request("/observations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
}

export function deleteObservation(id) {
  return request(`/observations/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function clearFormObservations() {
  return request("/observations?source=form", { method: "DELETE" });
}

export function fetchCsiImports() {
  return request("/csi/imports");
}

export function importCsiFile(file, month) {
  const body = new FormData();
  body.append("file", file);
  body.append("month", month);
  return request("/csi/import", { method: "POST", body });
}

export function deleteCsiMonth(month) {
  return request(`/csi/imports/${encodeURIComponent(month)}`, { method: "DELETE" });
}

export function clearCsiImports() {
  return request("/csi/imports", { method: "DELETE" });
}
