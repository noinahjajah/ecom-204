/**
 * cart.js — ระบบตะกร้าสินค้าที่ใช้งานได้จริง
 * เชื่อมต่อกับ Rouvo (CRM) และ Superbet (ขนส่ง)
 */

import { isProductAvailable, listProducts, decrementStockForOrder } from "./admin-products/productsDataStore";
import { supabase } from "./supabaseClient";

const LEGACY_CART_KEYS = ["mv_cart", "cart"];
const GUEST_CART_KEY = "cart_guest";
const CART_KEY_PREFIX = "cart_";
const EVENT_NAME = "cartchange";
const COUPON_KEY = "mv_applied_coupon";
const ADDRESSES_KEY = "mv_saved_addresses";
const ORDERS_KEY = "mv_orders";
const CARDS_KEY = "mv_saved_cards";

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
  const products = listProducts();
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

function writeCart(cart, key = getCartKey()) {
  window.localStorage.setItem(key, JSON.stringify(cart));
  notifyCartChange(cart);
}

function findMatchingProduct(item, products = listProducts()) {
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

function isCartItemAvailable(item, products = listProducts()) {
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

export function slugify(name) {
  return name
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
  return syncCartWithStock();
}

export function saveCart(cart) {
  const nextCart = normalizeCart(cart);
  writeCart(nextCart);
  return nextCart;
}

export function getCartCount() {
  return getCart().reduce((n, item) => n + item.qty, 0);
}

export function addToCart(product, qty = 1) {
  if (!isCartItemAvailable(product)) return getCart();
  const cart = getCart();
  const existing = cart.find(
    (item) => item.id === product.id && item.variant === product.variant
  );
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      category: product.category || "",
      variant: product.variant || "",
      price: parsePrice(product.price),
      image: product.image || null,
      qty,
    });
  }
  saveCart(cart);
  return cart;
}

export function updateQty(id, delta) {
  const cart = getCart().map((item) =>
    item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
  );
  saveCart(cart);
  return cart;
}

export const updateQuantity = updateQty;

export function setQty(id, qty) {
  const cart = getCart().map((item) =>
    item.id === id ? { ...item, qty: Math.max(1, qty) } : item
  );
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
  window.localStorage.setItem(userKey, JSON.stringify(mergedCart));
  discardGuestCart();
  notifyCartChange(mergedCart);
  return mergedCart;
}

export function deductStock(items) {
  return decrementStockForOrder(items);
}

/* ── Orders ── */
export function getOrders() {
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return order;
}

/* ── Saved Cards ── */
export function getSavedCards() {
  try {
    const raw = window.localStorage.getItem(CARDS_KEY);
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
  window.localStorage.setItem(CARDS_KEY, JSON.stringify(next));
  return next;
}

export function removeSavedCard(id) {
  const next = getSavedCards().filter((c) => c.id !== id);
  window.localStorage.setItem(CARDS_KEY, JSON.stringify(next));
  return next;
}

/* ── Saved Addresses ── ปรับปรุงใหม่ พร้อม sync Rouvo ── */
function _loadAddressesRaw() {
  try {
    const raw = window.localStorage.getItem(ADDRESSES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getSavedAddresses() {
  return _loadAddressesRaw();
}

export function loadAddresses() {
  return _loadAddressesRaw();
}

/**
 * บันทึกที่อยู่ + sync กับ Rouvo CRM (ถ้ามี API key)
 */
export async function saveAddress(addr) {
  const addrs = _loadAddressesRaw();
  const id = addr.id || "addr-" + Date.now().toString(36);
  const next = { ...addr, id, updatedAt: new Date().toISOString() };
  const exists = addrs.findIndex((a) => a.id === id);
  if (exists >= 0) {
    addrs[exists] = next;
  } else {
    addrs.push(next);
  }
  window.localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addrs));
  window.dispatchEvent(new CustomEvent("addresseschange", { detail: addrs }));

  // 🔄 Sync กับ Rouvo CRM
  await syncAddressWithRouvo(next);

  return next;
}

export function removeSavedAddress(id) {
  const next = _loadAddressesRaw().filter((a) => a.id !== id);
  window.localStorage.setItem(ADDRESSES_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("addresseschange", { detail: next }));
  return next;
}

export function updateSavedAddress(id, data) {
  const addrs = _loadAddressesRaw();
  const idx = addrs.findIndex((a) => a.id === id);
  if (idx >= 0) {
    addrs[idx] = { ...addrs[idx], ...data, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addrs));
    window.dispatchEvent(new CustomEvent("addresseschange", { detail: addrs }));
  }
  return addrs;
}

export function setDefaultAddress(id) {
  const addrs = _loadAddressesRaw().map((a) => ({ ...a, isDefault: a.id === id }));
  window.localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addrs));
  window.dispatchEvent(new CustomEvent("addresseschange", { detail: addrs }));
  return addrs;
}

export function subscribeAddresses(callback) {
  const handler = (e) => callback(e.detail ?? _loadAddressesRaw());
  window.addEventListener("addresseschange", handler);
  window.addEventListener("storage", (e) => {
    if (!e.key || e.key === ADDRESSES_KEY) callback(_loadAddressesRaw());
  });
  return () => window.removeEventListener("addresseschange", handler);
}

/* ── Rouvo CRM Integration ── */
async function syncAddressWithRouvo(address) {
  try {
    const rouvoKey = import.meta.env?.VITE_ROUVO_API_KEY;
    const rouvoEndpoint = import.meta.env?.VITE_ROUVO_ENDPOINT || "https://api.rouvo.com/v1";
    if (!rouvoKey) return;

    const res = await fetch(`${rouvoEndpoint}/customers/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${rouvoKey}`,
      },
      body: JSON.stringify({
        address_id: address.id,
        name: address.fullName || address.name,
        phone: address.phone,
        email: address.email,
        line1: address.address || address.line1,
        city: address.district || address.city,
        state: address.province || address.state,
        postal_code: address.postcode,
        country: "TH",
        preferred_carrier: address.preferredCarrier || "superbet",
        is_default: address.isDefault || false,
      }),
    });

    if (!res.ok) throw new Error(`Rouvo sync failed: ${res.status}`);
  } catch (err) {
    console.warn("[Rouvo] Address sync failed (non-critical):", err.message);
  }
}

/**
 * สร้างออเดอร์ใน Rouvo CRM
 */
export async function createRouvoOrder(orderData) {
  try {
    const rouvoKey = import.meta.env?.VITE_ROUVO_API_KEY;
    const rouvoEndpoint = import.meta.env?.VITE_ROUVO_ENDPOINT || "https://api.rouvo.com/v1";
    if (!rouvoKey) return null;

    const res = await fetch(`${rouvoEndpoint}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${rouvoKey}`,
      },
      body: JSON.stringify({
        order_id: orderData.id,
        customer_email: orderData.customerEmail,
        customer_name: orderData.customerName,
        items: orderData.items,
        subtotal: orderData.subtotal,
        discount: orderData.discount,
        shipping_fee: orderData.shippingFee,
        total: orderData.total,
        status: orderData.status,
        payment_method: orderData.paymentMethod,
        shipping_address: orderData.shippingAddress,
        carrier: orderData.carrier || "superbet",
      }),
    });

    if (!res.ok) throw new Error(`Rouvo order failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[Rouvo] Order sync failed (non-critical):", err.message);
    return null;
  }
}

/* ── Superbet Tracking ── */
/**
 * สร้างเลข tracking กับ Superbet และคืน URL สำหรับติดตาม
 */
export async function createSuperbetTracking(orderData) {
  try {
    const superbetKey = import.meta.env?.VITE_SUPERBET_API_KEY;
    const superbetEndpoint = import.meta.env?.VITE_SUPERBET_ENDPOINT || "https://api.superbet.com/v1";
    if (!superbetKey) return null;

    const res = await fetch(`${superbetEndpoint}/shipments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${superbetKey}`,
      },
      body: JSON.stringify({
        order_id: orderData.id,
        recipient: {
          name: orderData.shippingAddress?.fullName,
          phone: orderData.shippingAddress?.phone,
          address: orderData.shippingAddress?.address,
          district: orderData.shippingAddress?.district,
          province: orderData.shippingAddress?.province,
          postcode: orderData.shippingAddress?.postcode,
        },
        items: orderData.items.map((item) => ({
          name: item.name,
          qty: item.qty,
          value: item.price,
        })),
        cod_amount: orderData.total,
      }),
    });

    if (!res.ok) throw new Error(`Superbet tracking failed: ${res.status}`);
    const data = await res.json();
    return {
      trackingNumber: data.tracking_number,
      trackingUrl: data.tracking_url || `https://superbet.com/track?code=${data.tracking_number}`,
      carrier: "Superbet Express",
      estimatedDelivery: data.estimated_delivery,
    };
  } catch (err) {
    console.warn("[Superbet] Tracking creation failed (non-critical):", err.message);
    return null;
  }
}

/**
 * ดึงสถานะพัสดุจาก Superbet
 */
export async function getSuperbetStatus(trackingNumber) {
  try {
    const superbetKey = import.meta.env?.VITE_SUPERBET_API_KEY;
    const superbetEndpoint = import.meta.env?.VITE_SUPERBET_ENDPOINT || "https://api.superbet.com/v1";
    if (!superbetKey || !trackingNumber) return null;

    const res = await fetch(`${superbetEndpoint}/shipments/${trackingNumber}/status`, {
      headers: { "Authorization": `Bearer ${superbetKey}` },
    });

    if (!res.ok) throw new Error(`Superbet status failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[Superbet] Status check failed:", err.message);
    return null;
  }
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
  supabase.auth.onAuthStateChange(() => {
    notifyCartChange();
  });
}