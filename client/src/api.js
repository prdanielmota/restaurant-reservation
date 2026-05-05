const API_BASE = "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Erro ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  googleLogin: (credential) =>
    request("/auth/google", { method: "POST", body: JSON.stringify({ credential }) }),
  getMe: () => request("/auth/me"),

  // Tables
  getTables: () => request("/tables"),
  getAvailableTables: (date, time, guests) =>
    request(`/tables/available?date=${date}&time=${time}&guests=${guests}`),
  addTable: (data) => request("/tables", { method: "POST", body: JSON.stringify(data) }),
  updateTable: (id, data) => request(`/tables/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deactivateTable: (id) => request(`/tables/${id}`, { method: "DELETE" }),

  // Reservations
  getReservations: () => request("/reservations"),
  createReservation: (data) =>
    request("/reservations", { method: "POST", body: JSON.stringify(data) }),
  updateReservation: (id, data) =>
    request(`/reservations/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  cancelReservation: (id) => request(`/reservations/${id}`, { method: "DELETE" }),
  getTimeSlots: (date, guests) =>
    request(`/reservations/timeslots?date=${date}&guests=${guests}`),

  // Settings
  getSettings: () => request("/settings"),
  saveSetting: (key, value) =>
    request(`/settings/${key}`, { method: "PUT", body: JSON.stringify({ value }) }),
};
