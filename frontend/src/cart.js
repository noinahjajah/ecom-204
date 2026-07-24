/**
 * cart.js — ระบบตะกร้าสินค้าที่ใช้งานได้จริง
 * 🔄 UPDATED: For logged-in users, stores cart in Supabase DB via API (/api/cart)
 * For guests, keeps localStorage as before. Maintains same export interface for backward compat.
 * เชื่อมต่อกับ Rouvo (CRM) และ Superbet (ขนส่ง)
 */

import { isProductAvailable, listProducts, decrementStockForOrder } from "./admin-products/productsDataStore";
import { supabase } from "./supabaseClient";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// ── API helpers for DB cart ────────────────────────────────────
async function getAuthToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.access_token) return null;
  return data.session.access_token;
}

async function apiCall(method, path, body = null) {
  const token = await getAuthToken();
  if (!token) return null; // Not logged in, fallback to localStorage

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_BASE}${path}`, options);
    if (!res.ok) {
      console.error(`API error ${res.status}:`, await res.text());
      return null; // Fallback to localStorage on error
    }
    return await res.json();
  } catch (err) {
    console.error("API call failed:", err);
    return null; // Fallback to localStorage on network error
  }
}

// ── Local cache for DB cart (optimistic updates) ────────────────
let dbCartCache = [];

async function syncDbCartToLocal() {
  const cart = await apiCall("GET", "/cart");
  if (cart && Array.isArray(cart)) {
    dbCartCache = cart;
    // Also update localStorage as backup
    const cartKey = getCartKey();
    const formatted = cart.map(item => ({
      id: item.product_id,
      name: item.product_name,
      category: item.category,
      variant: item.variant,
      price: item.price,
      image: item.image_url,
      qty: item.quantity,
    }));
    writeCart(formatted, cartKey, { skipDbSync: true });
  }
  return dbCartCache;
}

// ── Products cache ──────────────────────────────────────────────
// 🔄 CHANGED: listProducts() now hits the backend API (async), but all
// the cart math below (getAvailableQty, addToCart, updateQty, setQty,
// computeShippingFee, getCart, ...) is called SYNCHRONOUSLY from onClick
// handlers and render code all over Makeup.jsx / Skincare.jsx /
// ProductDetailPage.jsx / CartPage.jsx / Header.jsx. Making every one of
// those async would mean rewriting all of those call sites too. Instead:
// keep a small in-memory cache of the product list here, refreshed in
// the background, and have the synchronous functions below read from the
// cache instead of calling listProducts() directly.
//
// ⚠️ If a page's own list of products isn't loaded yet when this cache
// is still empty (e.g. right after a hard refresh), stock checks below
// fall back to "no product found → don't block" (see findMatchingProduct
// callers), the same permissive behavior already used for unknown items.
let productsCache = [];

export async function refreshProductsCache() {
  try {
    productsCache = await listProducts();
  } catch (err) {
    console.error("โหลดรายการสินค้าไม่สำเร็จ (cart.js productsCache)", err);
  }
  return productsCache;
}

if (typeof window !== "undefined") {
  refreshProductsCache();
  // เดียวกับจังหวะ polling ที่หน้า Admin ใช้ (ProductsTable.jsx) — กันไม่ให้
  // ตัวเลขสต็อกที่ใช้เช็คตรงนี้เก่าเกินไปเมื่อเทียบกับของจริงใน Supabase
  setInterval(refreshProductsCache, 5000);
}

const LEGACY_CART_KEYS = ["mv_cart", "cart"];
const GUEST_CART_KEY = "cart_guest";
const CART_KEY_PREFIX = "cart_";
const EVENT_NAME = "cartchange";
const COUPON_KEY = "mv_applied_coupon";

// ที่อยู่ / คำสั่งซื้อ / บัตรที่บันทึกไว้ ต้องผูกกับ user ที่ login อยู่ตอนนั้น
// เหมือนตะกร้า ไม่งั้นสลับบัญชีแล้วข้อมูลจะติดตามไปด้วย (หรือเห็นของบัญชีอื่น)
const ADDRESSES_KEY_PREFIX = "mv_saved_addresses_";
const GUEST_ADDRESSES_KEY = "mv_saved_addresses_guest";
const ORDERS_KEY_PREFIX = "mv_orders_";
const GUEST_ORDERS_KEY = "mv_orders_guest";
const CARDS_KEY_PREFIX = "mv_saved_cards_";
const GUEST_CARDS_KEY = "mv_saved_cards_guest";

// key ที่ใช้จำหน้าที่ผู้ใช้ตั้งใจจะไป ก่อนถูกเด้งไป login (ให้ AuthCallback.jsx อ่านแล้วเด้งกลับมาที่นี่)
// เดิมประกาศ/hardcode แยกกันใน CartPage.jsx, CheckoutPage.jsx, MyAddresses.jsx,
// ProductDetailPage.jsx และ AuthCallback.jsx — รวมไว้ที่เดียวกันเพื่อกันสะกดผิด
export const REDIRECT_AFTER_LOGIN_KEY = "mv_redirect_after_login";

/* ── Coupons ── */
export const coupons = {
  SAVE10: { type: "percent", value: 10, minSpend: 0, max: 300 },
  FREESHIP: { type: "free_shipping", minSpend: 0 },
  WELCOME20: { type: "percent", value: 20, minSpend: 1000, max: 500 },
};

export const FREE_SHIPPING_THRESHOLD = 1500;
export const SHIPPING_FEE = 60;

function normalizeCart(value) {
  return Array.isArray(value) ? value : [];
}

function readCartFromKey(key) {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return normalizeCart(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

function extractUserIdFromSession(sessionValue) {
  if (!sessionValue || typeof sessionValue !== "object") return null;
  if (sessionValue.user?.id) return sessionValue.user.id;
  if (sessionValue.session?.user?.id) return sessionValue.session.user.id;
  if (sessionValue.currentSession?.user?.id) return sessionValue.currentSession.user.id;
  if (Array.isArray(sessionValue)) {
    for (const entry of sessionValue) {
      const userId = extractUserIdFromSession(entry);
      if (userId) return userId;
    }
  }
  return null;
}

function getCurrentUserId() {
  if (typeof window === "undefined") return null;
  const authStorageKey = supabase.auth?.storageKey;
  if (!authStorageKey) return null;

  try {
    const raw = window.localStorage.getItem(authStorageKey);
    if (!raw) return null;
    return extractUserIdFromSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function getCartKey() {
  const userId = getCurrentUserId();
  return userId ? `${CART_KEY_PREFIX}${userId}` : GUEST_CART_KEY;
}

function getAddressesKey() {
  const userId = getCurrentUserId();
  return userId ? `${ADDRESSES_KEY_PREFIX}${userId}` : GUEST_ADDRESSES_KEY;
}

function getOrdersKey() {
  const userId = getCurrentUserId();
  return userId ? `${ORDERS_KEY_PREFIX}${userId}` : GUEST_ORDERS_KEY;
}

function getCardsKey() {
  const userId = getCurrentUserId();
  return userId ? `${CARDS_KEY_PREFIX}${userId}` : GUEST_CARDS_KEY;
}

function isCartStorageKey(key) {
  return Boolean(
    key && (key === GUEST_CART_KEY || key.startsWith(CART_KEY_PREFIX) || LEGACY_CART_KEYS.includes(key))
  );
}

function migrateLegacyGuestCart() {
  if (typeof window === "undefined") return [];

  const guestCart = readCartFromKey(GUEST_CART_KEY);
  if (guestCart.length > 0) {
    LEGACY_CART_KEYS.forEach((key) => window.localStorage.removeItem(key));
    return guestCart;
  }

  for (const legacyKey of LEGACY_CART_KEYS) {
    const legacyCart = readCartFromKey(legacyKey);
    if (legacyCart.length === 0) continue;
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(legacyCart));
    LEGACY_CART_KEYS.forEach((key) => window.localStorage.removeItem(key));
    return legacyCart;
  }

  return guestCart;
}

function readGuestCart() {
  migrateLegacyGuestCart();
  return readCartFromKey(GUEST_CART_KEY);
}

function notifyCartChange(cart = readCart()) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: cart }));
}

function mergeCartItems(baseCart, incomingCart) {
  const merged = baseCart.map((item) => ({ ...item }));

  incomingCart.forEach((incomingItem) => {
    const existing = merged.find(
      (item) => item.id === incomingItem.id && item.variant === incomingItem.variant
    );

    if (existing) {
      existing.qty += incomingItem.qty;
      return;
    }

    merged.push({ ...incomingItem });
  });

  return merged;
}

export function getAppliedCoupon() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(COUPON_KEY) || null;
}

export function setAppliedCoupon(code) {
  window.localStorage.setItem(COUPON_KEY, code);
  notifyCartChange();
}

export function clearAppliedCoupon() {
  window.localStorage.removeItem(COUPON_KEY);
  notifyCartChange();
}

/* ── Shipping calculation ── */
function getItemShipping(item, products) {
  const product = findMatchingProduct(item, products);
  const shipping = product?.shipping;

  if (!shipping) return { fee: SHIPPING_FEE, free: false };
  if (shipping.freeShipping) return { fee: 0, free: true };

  const fee = Number(shipping.shippingFee);
  return { fee: Number.isFinite(fee) ? fee : SHIPPING_FEE, free: false };
}

function computeShippingFee(cart) {
  if (cart.length === 0) return 0;
  const products = productsCache;
  const payableFees = cart
    .map((item) => getItemShipping(item, products))
    .filter((s) => !s.free)
    .map((s) => s.fee);
  return payableFees.length > 0 ? Math.max(...payableFees) : 0;
}

export function computeTotals(cart, appliedCoupon = getAppliedCoupon()) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const c = appliedCoupon ? coupons[appliedCoupon] : null;

  let discount = 0;
  if (c?.type === "percent") discount = Math.min(subtotal * (c.value / 100), c.max ?? Infinity);
  else if (c?.type === "fixed") discount = Math.min(c.value, subtotal);

  const isFreeShippingCoupon = c?.type === "free_shipping";
  const shippingFee =
    cart.length === 0 || isFreeShippingCoupon || subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : computeShippingFee(cart);

  const total = Math.max(subtotal - discount, 0) + shippingFee;

  return { subtotal, discount, shippingFee, total, appliedCoupon: c ? appliedCoupon : null };
}

/* ── Cart helpers ── */
function readCart() {
  const cartKey = getCartKey();
  return cartKey === GUEST_CART_KEY ? readGuestCart() : readCartFromKey(cartKey);
}

// รูปสินค้าที่แอดมินอัปโหลดจากเครื่อง จะถูกเก็บเป็น base64 data URL ซึ่งมีขนาดใหญ่มาก
// ถ้าเก็บซ้ำอีกชุดไว้ในตะกร้า อาจทำให้ localStorage เต็มโควตาได้ (QuotaExceededError)
// จึงตัดข้อมูลรูปแบบ data URL ออกจากตะกร้าก่อนบันทึกลง localStorage เสมอ แล้วค่อยดึงรูป
// จริงจาก product store มาแสดงตอน render แทน (ดู resolveCartItemImage)
function stripHeavyImages(cart) {
  return cart.map((item) =>
    typeof item.image === "string" && item.image.startsWith("data:")
      ? { ...item, image: null }
      : item
  );
}

function resolveCartItemImage(item, products) {
  if (item.image) return item;
  const product = findMatchingProduct(item, products);
  const image = product?.mainImage || product?.gallery?.[0] || null;
  return image ? { ...item, image } : item;
}

async function syncCartToDB(cart) {
  const userId = getCurrentUserId();
  if (!userId) return; // Not logged in

  try {
    await apiCall("DELETE", "/cart");
    for (const item of cart) {
      await apiCall("POST", "/cart", {
        productId: item.id,
        productName: item.name,
        category: item.category || "",
        variant: item.variant || "",
        price: item.price,
        quantity: item.qty,
        imageUrl: item.image || null,
      });
    }
  } catch (err) {
    console.warn("DB sync failed (non-critical):", err);
  }
}

// ป้องกันไม่ให้ syncCartToDB หลายรอบ (จากคลิกรัวๆ) วิ่งซ้อนกันจนแย่ง DELETE/POST
// กันคนละรอบ ทำให้ของหายหรือซ้ำใน DB — เข้าคิวให้รันทีละรอบเสมอ โดยรอบหลังสุด
// จะใช้ค่าตะกร้าล่าสุด ณ ตอนที่ถึงคิวจริง (ไม่ใช่ค่าตอนที่ถูกเรียก)
let dbSyncChain = Promise.resolve();
let latestCartForSync = null;

function queueCartSyncToDB() {
  dbSyncChain = dbSyncChain.then(() => syncCartToDB(latestCartForSync));
  return dbSyncChain;
}

function writeCart(cart, key = getCartKey(), { skipDbSync = false } = {}) {
  const slimCart = stripHeavyImages(cart);
  try {
    window.localStorage.setItem(key, JSON.stringify(slimCart));
  } catch (err) {
    if (err && err.name === "QuotaExceededError") {
      console.error("บันทึกตะกร้าไม่สำเร็จ: พื้นที่จัดเก็บในเบราว์เซอร์เต็ม", err);
    } else {
      throw err;
    }
  }

  // For logged-in users, also sync to DB (async, non-blocking)
  // skipDbSync ใช้ตอนเขียนค่าที่ดึงมาจาก DB เองอยู่แล้ว (syncDbCartToLocal) ไม่งั้นจะวนส่งกลับ
  if (!skipDbSync && getCurrentUserId()) {
    latestCartForSync = cart;
    queueCartSyncToDB();
  }

  notifyCartChange(cart);
}

function findMatchingProduct(item, products = productsCache) {
  if (!item) return null;
  const byId = products.find((product) => product.id === item.id);
  if (byId) return byId;
  const name = String(item.name || "");
  return (
    products.find((product) => slugify(product.name || "") === slugify(name)) ||
    products.find((product) => product.sku === item.sku) ||
    null
  );
}

function isCartItemAvailable(item, products = productsCache) {
  const product = findMatchingProduct(item, products);
  if (!product) return true;
  const stockValue = product.stockTotal ?? product.stock;
  if (stockValue === null || stockValue === undefined || stockValue === "") return true;
  const stock = Number(stockValue);
  if (!Number.isFinite(stock)) return true;
  if (stock > 0) return true;
  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (variants.length > 0) {
    return variants.some((variant) => {
      const variantStock = Number(variant?.stock ?? 0);
      return Number.isFinite(variantStock) && variantStock > 0;
    });
  }
  return false;
}

function syncCartWithStock(cart = readCart(), key = getCartKey()) {
  const filtered = cart.filter((item) => isCartItemAvailable(item));
  if (filtered.length !== cart.length) writeCart(filtered, key);
  return filtered;
}

// 🔒 หัวใจของ fix: จำนวนที่ "เพิ่มลงตะกร้าได้จริง" ต้องไม่เกิน stock ที่เหลือ
// ของสินค้า (หรือของ variant นั้นๆ ถ้าสินค้ามี variants และ item ระบุ variant มา)
// ใช้จุดเดียวนี้ทั้งใน addToCart / updateQty / setQty กันไม่ให้ตะกร้าไหลเกินสต็อก
export function getAvailableQty(item, products = productsCache) {
  const product = findMatchingProduct(item, products);
  if (!product) return Infinity; // หา product ไม่เจอ (เช่น fallback/demo data) อย่าบล็อกของเดิม

  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (item.variant && variants.length > 0) {
    const variant = variants.find(
      (v) => (v.sku && v.sku === item.variant) || Object.values(v.options || {}).some((val) => val === item.variant)
    );
    if (variant) {
      const variantStock = Number(variant.stock);
      if (Number.isFinite(variantStock)) return Math.max(0, variantStock);
    }
  }

  const stockTotal = Number(product.stockTotal ?? product.stock);
  return Number.isFinite(stockTotal) ? Math.max(0, stockTotal) : Infinity;
}

export function slugify(name) {
  return String(name ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function parsePrice(price) {
  if (typeof price === "number") return price;
  return Number(String(price).replace(/[^0-9.]/g, "")) || 0;
}

export function getCart() {
  const products = productsCache;
  return syncCartWithStock().map((item) => resolveCartItemImage(item, products));
}

export function saveCart(cart) {
  const nextCart = normalizeCart(cart);
  writeCart(nextCart);
  return nextCart;
}

export function getCartCount() {
  return getCart().reduce((n, item) => n + item.qty, 0);
}

// คืนค่าเป็น object เสมอ (ไม่ใช่ array ตะกร้าตรงๆ เหมือนเดิม) เพราะตอนนี้ต้องบอก
// ผู้เรียกได้ว่าใส่ไปได้จริงกี่ชิ้น เผื่อสต็อกไม่พอ — จุดเรียกใช้เดิมในโปรเจกต์
// (Makeup.jsx, Skincare.jsx, ProductDetailPage.jsx) ไม่มีที่ไหนอ่านค่าที่ return
// แบบ array ตรงๆ อยู่แล้ว จึงเปลี่ยน shape ได้โดยไม่พังของเดิม
export function addToCart(product, qty = 1) {
  if (!isCartItemAvailable(product)) {
    return { cart: getCart(), added: 0, availableQty: 0, capped: qty > 0 };
  }

  const products = productsCache;
  const availableQty = getAvailableQty(product, products);

  const cart = getCart();
  const existing = cart.find(
    (item) => item.id === product.id && item.variant === product.variant
  );
  const currentQty = existing ? existing.qty : 0;
  const finalQty = Math.max(0, Math.min(currentQty + qty, availableQty));
  const added = finalQty - currentQty;

  if (existing) {
    existing.qty = finalQty;
  } else if (finalQty > 0) {
    cart.push({
      id: product.id,
      name: product.name,
      category: product.category || "",
      variant: product.variant || "",
      price: parsePrice(product.price),
      image: product.image || null,
      qty: finalQty,
    });
  }

  saveCart(cart);
  return { cart, added, availableQty, capped: added < qty };
}

export function updateQty(id, delta) {
  const products = productsCache;
  const cart = getCart().map((item) => {
    if (item.id !== id) return item;
    const availableQty = getAvailableQty(item, products);
    return { ...item, qty: Math.max(1, Math.min(item.qty + delta, availableQty)) };
  });
  saveCart(cart);
  return cart;
}

export const updateQuantity = updateQty;

export function setQty(id, qty) {
  const products = productsCache;
  const cart = getCart().map((item) => {
    if (item.id !== id) return item;
    const availableQty = getAvailableQty(item, products);
    return { ...item, qty: Math.max(1, Math.min(qty, availableQty)) };
  });
  saveCart(cart);
  return cart;
}

export function removeFromCart(id) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
  clearAppliedCoupon();
}

export function hasGuestCartItems() {
  return readGuestCart().length > 0;
}

export function discardGuestCart() {
  window.localStorage.removeItem(GUEST_CART_KEY);
  LEGACY_CART_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

/**
 * รวมตะกร้า guest เข้ากับตะกร้าของ user ที่ login
 * ต้องส่ง { confirm: true } เท่านั้นถึงจะ merge จริง (กันไม่ให้ auto-merge แบบเงียบๆ
 * ไปปนกับบัญชีที่ไม่เกี่ยวข้อง เวลาสลับ login หลายบัญชีบนเครื่องเดียวกัน)
 */
export function mergeGuestCartIntoUserCart(userId, { confirm = false } = {}) {
  if (typeof window === "undefined" || !userId) return [];

  const guestCart = readGuestCart();
  const userKey = `${CART_KEY_PREFIX}${userId}`;
  const userCart = readCartFromKey(userKey);

  if (guestCart.length === 0) {
    return syncCartWithStock(userCart, userKey);
  }

  if (!confirm) {
    // มีของค้างใน guest cart แต่ยังไม่ได้รับการยืนยัน -> ไม่ merge, คืนตะกร้าเดิมของ user ไปก่อน
    return syncCartWithStock(userCart, userKey);
  }

  const mergedCart = syncCartWithStock(mergeCartItems(userCart, guestCart), userKey);
  writeCart(mergedCart, userKey); // เขียน localStorage + sync ตะกร้าที่ merge แล้วขึ้น DB ด้วย
  discardGuestCart();
  return mergedCart;
}

export function deductStock(items) {
  return decrementStockForOrder(items);
}

/* ── Orders ── DB-backed (Supabase ผ่าน /api/orders) สำหรับคน login เก็บ
   localStorage ไว้เป็น cache ให้อ่านแบบ sync ได้เหมือนเดิม (เหมือนตะกร้า/ที่อยู่) +
   fallback เต็มรูปแบบสำหรับ guest ที่ยังไม่ login ── */
function formatOrderFromDb(row) {
  return {
    id: row.id,
    items: row.items || [],
    subtotal: row.subtotal,
    discount: row.discount,
    shippingFee: row.shipping_fee,
    total: row.total,
    appliedCoupon: row.applied_coupon,
    status: row.status,
    paymentMethod: row.payment_method,
    cardInfo: row.card_info,
    shippingAddress: row.shipping_address,
    addressId: row.address_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    carrier: row.carrier,
    trackingNumber: row.tracking_number,
    trackingUrl: row.tracking_url,
    estimatedDelivery: row.estimated_delivery,
    statusHistory: row.status_history || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function syncDbOrdersToLocal() {
  const rows = await apiCall("GET", "/orders");
  if (rows && Array.isArray(rows)) {
    const formatted = rows.map(formatOrderFromDb);
    window.localStorage.setItem(getOrdersKey(), JSON.stringify(formatted));
    window.dispatchEvent(new CustomEvent("orderschange", { detail: formatted }));
  }
  return rows;
}

export function getOrders() {
  try {
    const raw = window.localStorage.getItem(getOrdersKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * บันทึกออเดอร์ลง localStorage ทันที (optimistic) แล้วค่อยยิงไป DB แบบ non-blocking
 * เบื้องหลัง — คืนค่าออเดอร์ที่บันทึกแบบ sync เหมือนเดิม เพื่อไม่ให้จุดที่เรียกใช้
 * (CheckoutPage.jsx) ที่ไม่ได้ await ผลลัพธ์พัง
 */
export function saveOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  window.localStorage.setItem(getOrdersKey(), JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent("orderschange", { detail: orders }));

  if (getCurrentUserId()) {
    apiCall("POST", "/orders", order).catch(() => {});
  }

  return order;
}

/**
 * แก้ไขออเดอร์ที่มีอยู่แล้ว (เช่น ใส่เลข tracking ที่ได้จาก Superbet หลังสร้างออเดอร์)
 * ใช้แทนการเขียน localStorage ตรงๆ ที่ CheckoutPage.jsx เคยทำ (ผิด key เดิม)
 */
export function updateOrder(id, patch) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], ...patch, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(getOrdersKey(), JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent("orderschange", { detail: orders }));
  }

  if (getCurrentUserId()) {
    apiCall("PATCH", `/orders/${encodeURIComponent(id)}`, patch).catch(() => {});
  }

  return idx >= 0 ? orders[idx] : null;
}

/* ── Saved Cards ── DB-backed (Supabase ผ่าน /api/cards) สำหรับคน login เก็บ
   localStorage ไว้เป็น cache ให้อ่านแบบ sync ได้เหมือนเดิม (เหมือนตะกร้า/ที่อยู่/ออเดอร์) +
   fallback เต็มรูปแบบสำหรับ guest ที่ยังไม่ login ── */
function formatCardFromDb(row) {
  return { id: row.id, brand: row.brand, last4: row.last4, expiry: row.expiry, name: row.name };
}

async function syncDbCardsToLocal() {
  const rows = await apiCall("GET", "/cards");
  if (rows && Array.isArray(rows)) {
    const formatted = rows.map(formatCardFromDb);
    window.localStorage.setItem(getCardsKey(), JSON.stringify(formatted));
    window.dispatchEvent(new CustomEvent("cardschange", { detail: formatted }));
  }
  return rows;
}

export function getSavedCards() {
  try {
    const raw = window.localStorage.getItem(getCardsKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCard({ brand, last4, expiry, name }) {
  const cards = getSavedCards();
  const id = `${brand}-${last4}-${expiry}`;
  if (cards.some((c) => c.id === id)) return cards;
  const next = [...cards, { id, brand, last4, expiry, name }];
  window.localStorage.setItem(getCardsKey(), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("cardschange", { detail: next }));

  if (getCurrentUserId()) {
    apiCall("POST", "/cards", { id, brand, last4, expiry, name }).catch(() => {});
  }

  return next;
}

export function removeSavedCard(id) {
  const next = getSavedCards().filter((c) => c.id !== id);
  window.localStorage.setItem(getCardsKey(), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("cardschange", { detail: next }));

  if (getCurrentUserId()) {
    apiCall("DELETE", `/cards/${encodeURIComponent(id)}`).catch(() => {});
  }

  return next;
}

/* ── Saved Addresses ── DB-backed (Supabase ผ่าน /api/addresses) สำหรับคน login
   เก็บ localStorage ไว้เป็น cache ให้อ่านแบบ sync ได้เหมือนเดิม (เหมือนตะกร้า) +
   fallback เต็มรูปแบบสำหรับ guest ที่ยังไม่ login ── */
function _loadAddressesRaw() {
  try {
    const raw = window.localStorage.getItem(getAddressesKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatAddressFromDb(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    district: row.district,
    province: row.province,
    postcode: row.postcode,
    preferredCarrier: row.preferred_carrier,
    isDefault: row.is_default,
    note: row.note,
    updatedAt: row.updated_at,
  };
}

async function syncDbAddressesToLocal() {
  const rows = await apiCall("GET", "/addresses");
  if (rows && Array.isArray(rows)) {
    const formatted = rows.map(formatAddressFromDb);
    window.localStorage.setItem(getAddressesKey(), JSON.stringify(formatted));
    window.dispatchEvent(new CustomEvent("addresseschange", { detail: formatted }));
  }
}

export function getSavedAddresses() {
  return _loadAddressesRaw();
}

export function loadAddresses() {
  return _loadAddressesRaw();
}

/**
 * บันทึกที่อยู่ลง localStorage ทันที (optimistic) แล้วค่อยยิงไป DB / Rouvo CRM
 * แบบ non-blocking เบื้องหลัง — คืนค่าที่อยู่ที่บันทึกแบบ sync เหมือนเดิม เพื่อไม่ให้
 * จุดที่เรียกใช้ (MyAddresses.jsx, CheckoutPage.jsx) ที่ไม่ได้ await ผลลัพธ์พัง
 */
export function saveAddress(addr) {
  const addrs = _loadAddressesRaw();
  const id = addr.id || "addr-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const next = { ...addr, id, updatedAt: new Date().toISOString() };

  if (next.isDefault) {
    addrs.forEach((a) => { a.isDefault = false; });
  }

  const exists = addrs.findIndex((a) => a.id === id);
  if (exists >= 0) {
    addrs[exists] = next;
  } else {
    addrs.push(next);
  }
  window.localStorage.setItem(getAddressesKey(), JSON.stringify(addrs));
  window.dispatchEvent(new CustomEvent("addresseschange", { detail: addrs }));

  if (getCurrentUserId()) {
    // 🔄 backend จะ sync กับ Rouvo CRM ให้เอง (ดู addressesService.upsertAddress ฝั่ง backend)
    apiCall("POST", "/addresses", next).catch(() => {});
  }

  return next;
}

export function removeSavedAddress(id) {
  const next = _loadAddressesRaw().filter((a) => a.id !== id);
  window.localStorage.setItem(getAddressesKey(), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("addresseschange", { detail: next }));

  if (getCurrentUserId()) {
    apiCall("DELETE", `/addresses/${encodeURIComponent(id)}`).catch(() => {});
  }

  return next;
}

export function updateSavedAddress(id, data) {
  const addrs = _loadAddressesRaw();
  const idx = addrs.findIndex((a) => a.id === id);
  if (idx >= 0) {
    if (data.isDefault) {
      addrs.forEach((a) => { a.isDefault = false; });
    }
    addrs[idx] = { ...addrs[idx], ...data, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(getAddressesKey(), JSON.stringify(addrs));
    window.dispatchEvent(new CustomEvent("addresseschange", { detail: addrs }));

    if (getCurrentUserId()) {
      apiCall("PATCH", `/addresses/${encodeURIComponent(id)}`, addrs[idx]).catch(() => {});
    }
  }
  return addrs;
}

export function setDefaultAddress(id) {
  const addrs = _loadAddressesRaw().map((a) => ({ ...a, isDefault: a.id === id }));
  window.localStorage.setItem(getAddressesKey(), JSON.stringify(addrs));
  window.dispatchEvent(new CustomEvent("addresseschange", { detail: addrs }));

  if (getCurrentUserId()) {
    apiCall("PATCH", `/addresses/${encodeURIComponent(id)}/default`).catch(() => {});
  }

  return addrs;
}

export function subscribeAddresses(callback) {
  const handler = (e) => callback(e.detail ?? _loadAddressesRaw());
  const handleStorage = (e) => {
    if (!e.key || e.key === getAddressesKey()) callback(_loadAddressesRaw());
  };
  window.addEventListener("addresseschange", handler);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener("addresseschange", handler);
    window.removeEventListener("storage", handleStorage);
  };
}

/* ── Rouvo CRM / Superbet Tracking ── ยิงผ่าน backend (/api/integrations/...) เท่านั้น
   API key ของทั้งสองบริการอยู่ฝั่ง backend (ดู backend/services/rouvoService.js,
   backend/services/superbetService.js) ไม่ถูกฝังลงใน frontend bundle อีกต่อไป
   (เดิมใช้ import.meta.env.VITE_ROUVO_API_KEY / VITE_SUPERBET_API_KEY ซึ่งค่า VITE_*
   ถูก inline ลง JS ที่ส่งไปหา browser ตรงๆ ทำให้ใครก็เห็น key ผ่าน DevTools ได้) ── */

/**
 * สร้างออเดอร์ใน Rouvo CRM (ผ่าน backend proxy)
 */
export async function createRouvoOrder(orderData) {
  return apiCall("POST", "/integrations/rouvo/order", orderData);
}

/**
 * สร้างเลข tracking กับ Superbet และคืน URL สำหรับติดตาม (ผ่าน backend proxy)
 */
export async function createSuperbetTracking(orderData) {
  return apiCall("POST", "/integrations/superbet/tracking", orderData);
}

/**
 * ดึงสถานะพัสดุจาก Superbet (ผ่าน backend proxy)
 */
export async function getSuperbetStatus(trackingNumber) {
  if (!trackingNumber) return null;
  return apiCall("GET", `/integrations/superbet/status/${encodeURIComponent(trackingNumber)}`);
}

/* ── Cart Subscription ── */
export function subscribeCart(callback) {
  const handleCustom = (e) => callback(e.detail ?? readCart());
  const handleStorage = (e) => {
    if (!e.key || isCartStorageKey(e.key) || e.key === supabase.auth?.storageKey) callback(readCart());
  };
  window.addEventListener(EVENT_NAME, handleCustom);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(EVENT_NAME, handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
}

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
      // User logged in: sync DB cart + saved addresses + orders + saved cards to local storage
      await syncDbCartToLocal();
      await syncDbAddressesToLocal();
      await syncDbOrdersToLocal();
      await syncDbCardsToLocal();
    } else if (event === "SIGNED_OUT") {
      // User logged out: clear DB cache
      dbCartCache = [];
    }
    notifyCartChange();
  });
}
