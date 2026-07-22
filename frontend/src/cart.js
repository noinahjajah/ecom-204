/**
 * cart.js — ระบบตะกร้าสินค้าที่ใช้งานได้จริง
 * เชื่อมต่อกับ Rouvo (CRM) และ Superbet (ขนส่ง)
 */

import { isProductAvailable, listProducts, decrementStockForOrder } from "./admin-products/productsDataStore";

const CART_KEY = "mv_cart";
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

export function getAppliedCoupon() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(COUPON_KEY) || null;
}

export function setAppliedCoupon(code) {
  window.localStorage.setItem(COUPON_KEY, code);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: readCart() }));
}

export function clearAppliedCoupon() {
  window.localStorage.removeItem(COUPON_KEY);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: readCart() }));
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
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(cart) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: cart }));
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

function syncCartWithStock(cart = readCart()) {
  const filtered = cart.filter((item) => isCartItemAvailable(item));
  if (filtered.length !== cart.length) writeCart(filtered);
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
  writeCart(cart);
  return cart;
}

export function updateQty(id, delta) {
  const cart = getCart().map((item) =>
    item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
  );
  writeCart(cart);
  return cart;
}

export function setQty(id, qty) {
  const cart = getCart().map((item) =>
    item.id === id ? { ...item, qty: Math.max(1, qty) } : item
  );
  writeCart(cart);
  return cart;
}

export function removeFromCart(id) {
  const cart = getCart().filter((item) => item.id !== id);
  writeCart(cart);
  return cart;
}

export function clearCart() {
  writeCart([]);
  clearAppliedCoupon();
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
    if (!e.key || e.key === CART_KEY) callback(readCart());
  };
  window.addEventListener(EVENT_NAME, handleCustom);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(EVENT_NAME, handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
}
