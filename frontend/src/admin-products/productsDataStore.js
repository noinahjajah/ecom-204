// 📄 productsDataStore.js (frontend)
// ─────────────────────────────────────────────────────────────
// 🔄 CHANGED THIS PASS: this file no longer talks to localStorage OR
// Supabase directly — it now calls the backend's REST API
// (backend/routes/products_router.js), and the backend is the one
// talking to Supabase (backend/services/productsService.js). Every
// exported function keeps the SAME name/shape as before (still
// async, same params/return values), so AddEditProduct.jsx and
// ProductsDashboard.jsx need NO changes.
//
// ⚠️ ONE signature change: bulkUpdateProducts(ids, updaterFn, opts)
// → bulkUpdateProducts(ids, patchObject, opts). A function can't
// cross an HTTP boundary, and every call site already only ever
// passed a simple field patch (e.g. { status: "Hidden" }) — see the
// updated ProductsTable.jsx.
//
// Needs one env var: VITE_API_BASE_URL (defaults to
// http://localhost:3000/api for local dev against server.js).
// ─────────────────────────────────────────────────────────────

import { supabase } from "../supabaseClient";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

async function request(path, options = {}) {
  // แนบ Supabase access token อัตโนมัติทุก request (ถ้ามี session) — เส้นทางฝั่ง
  // Admin (products/admin, bulk, import, export, ฯลฯ) ตอนนี้ต้องมี token ผูก
  // role admin ถึงจะผ่าน requireAdmin middleware ที่ backend ได้ (ดู products_router.js)
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
    let details;
    try {
      const body = await res.json();
      message = body?.error || message;
      details = body?.details;
    } catch {
      // response body wasn't JSON — keep the generic message
    }
    const err = new Error(message);
    err.status = res.status;
    err.details = details;
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

// ───────────────────────── Pure helpers (no IO — safe to keep client-side) ─────────────────────────

export function isProductAvailable(product) {
  if (!product) return false;

  // สินค้าที่ยังไม่ Active (Draft / Pending / Hidden / Rejected) ไม่ควรขายหน้าร้าน
  // ต่อให้ตัวเลข stockTotal จะยังไม่ใช่ 0 ก็ตาม
  if (product.status && product.status !== "Active") {
    return false;
  }

  const stockValue = product.stockTotal ?? product.stock;
  if (stockValue === null || stockValue === undefined || stockValue === "") {
    return true;
  }

  const stock = Number(stockValue);
  if (!Number.isFinite(stock)) {
    return true;
  }

  if (stock > 0) {
    return true;
  }

  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (variants.length > 0) {
    return variants.some((variant) => {
      const variantStock = Number(variant?.stock ?? 0);
      return Number.isFinite(variantStock) && variantStock > 0;
    });
  }

  return false;
}

export function computeDashboardStats(products) {
  const all = products || [];
  const total = all.length;
  const active = all.filter((p) => p.status === "Active").length;
  const outOfStock = all.filter((p) => Number(p.stockTotal) <= 0).length;
  const hidden = all.filter((p) => p.status === "Hidden").length;
  const pending = all.filter((p) => p.status === "Pending").length;
  const rejected = all.filter((p) => p.status === "Rejected").length;
  const bestSellerCandidates = all
    .filter((p) => Number(p.soldCount) > 0)
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
  const noImage = all.filter((p) => !p.mainImage && (p.gallery?.length || 0) === 0).length;
  const notComplete = all.filter((p) => !p.completeness?.isComplete).length;

  return {
    total,
    active,
    outOfStock,
    hidden,
    pending,
    rejected,
    bestSellerCount: bestSellerCandidates.length ? 1 : 0,
    noImage,
    notComplete,
    bestSellerCandidates,
  };
}

// ───────────────────────── Backend-backed operations ─────────────────────────

export async function listProducts() {
  return request("/products");
}

// ⚠️ Admin product table/dashboard need full fields (sku, barcode, brand,
// store, createdAt, updatedAt, completeness, ...) that listProducts()
// strips out for the storefront — see backend's GET /products/admin.
export async function listProductsAdmin() {
  return request("/products/admin");
}

export async function getProductById(id) {
  try {
    return await request(`/products/${encodeURIComponent(id)}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

export async function upsertProduct({ product, actor = "Admin" }) {
  return request("/products", {
    method: "POST",
    body: JSON.stringify({ product, actor }),
  });
}

export async function deleteProducts(ids, { actor = "Admin" } = {}) {
  return request("/products", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

/**
 * ⚠️ SIGNATURE CHANGE: `patch` is now a plain object merged onto each
 * matched product (e.g. { status: "Hidden" }) — not an updater function.
 */
export async function bulkUpdateProducts(ids, patch, { actor = "Admin" } = {}) {
  return request("/products/bulk", {
    method: "PATCH",
    body: JSON.stringify({ ids, patch, actor }),
  });
}

export async function exportProductsJSON() {
  return request("/products/export");
}

export async function importProductsJSON(jsonText, { actor = "Admin" } = {}) {
  return request("/products/import", {
    method: "POST",
    body: JSON.stringify({ json: jsonText, actor }),
  });
}

/**
 * เรียกจาก CheckoutPage.jsx (ผ่าน cart.js) หลังชำระเงินสำเร็จ.
 * ต้อง login อยู่ — backend เช็ค Supabase session token นี้ก่อนตัดสต็อกทุกครั้ง
 * (ดู requireAuth ใน backend/routes/products_router.js), CheckoutPage.jsx เองก็
 * เด้งไป /login ถ้ายังไม่ login ตั้งแต่เปิดหน้าอยู่แล้ว แต่ยังเช็คซ้ำตรงนี้เผื่อ
 * session หมดอายุระหว่างที่หน้ายังเปิดค้างไว้
 */
export async function decrementStockForOrder(items, { actor = "system:checkout" } = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) {
    const err = new Error("กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ");
    err.status = 401;
    throw err;
  }

  return request("/products/decrement-stock", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, actor }),
  });
}
