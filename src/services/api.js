const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/+$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;
  if (!response.ok) {
    const message = payload?.error || `คำขอไม่สำเร็จ (${response.status})`;
    throw new Error(message);
  }
  return payload;
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
