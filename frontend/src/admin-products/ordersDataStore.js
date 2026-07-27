// 📄 ordersDataStore.js (frontend)
// ─────────────────────────────────────────────────────────────
// Talks to backend/routes/orders_router.js's /orders/admin endpoints
// (protected by requireAdmin — needs a Supabase session bound to a
// profile with role === 'admin'). Same request() pattern as
// productsDataStore.js.
// ─────────────────────────────────────────────────────────────

import { supabase } from "../supabaseClient";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

async function request(path, options = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      message = body?.error || message;
    } catch {
      // response body wasn't JSON — keep the generic message
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

export async function listOrdersAdmin() {
  return request("/orders/admin");
}

export async function updateOrderAdmin(id, patch) {
  return request(`/orders/${encodeURIComponent(id)}/admin`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
