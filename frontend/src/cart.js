/**
 * cart.js — ระบบตะกร้าสินค้าที่ใช้งานได้จริง (ไม่มี backend/router ให้ใช้ context ข้ามหน้าได้
 * เพราะแต่ละหน้าโหลดแยกกันผ่าน path จริง ๆ) จึงเก็บสถานะไว้ใน localStorage แทน
 * แล้วกระจายอีเวนต์ "cartchange" ให้ทุกคอมโพเนนต์ที่ subscribe รู้ตัวทันทีที่มีการเปลี่ยนแปลง
 *
 * ใช้ร่วมกันได้ทั้ง Header (แสดงจำนวนในตะกร้า), Skincare/Makeup/Home (ปุ่มหยิบใส่ตะกร้า)
 * และ CartPage (แสดง/แก้ไขรายการจริง)
 */

import { isProductAvailable, listProducts } from "./admin-products/productsDataStore";

const CART_KEY = "mv_cart";
const EVENT_NAME = "cartchange";

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
  if (filtered.length !== cart.length) {
    writeCart(filtered);
  }
  return filtered;
}

/** แปลงชื่อสินค้าเป็น id ที่คงที่ (ใช้เมื่อสินค้าไม่มี id ของตัวเอง) */
export function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** แปลงราคาที่เป็น string เช่น "1,290" ให้เป็นตัวเลข */
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

/**
 * เพิ่มสินค้าลงตะกร้า ถ้ามีอยู่แล้ว (id + variant ตรงกัน) จะบวกจำนวนแทนการเพิ่มรายการซ้ำ
 * product: { id, name, category, variant, price, image }
 */
export function addToCart(product, qty = 1) {
  if (!isCartItemAvailable(product)) {
    return getCart();
  }

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
}

/* ── Orders ──
 * เก็บประวัติคำสั่งซื้อไว้ใน localStorage เพื่อให้ Checkout ใช้งานได้จริงแบบ end-to-end
 * (สร้างเลขออเดอร์ บันทึกสถานะ ล้างตะกร้าเมื่อจ่ายสำเร็จ) โดยไม่ต้องมี backend/DB จริง
 */
const ORDERS_KEY = "mv_orders";

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

/* ── Saved cards ──
 * ห้ามเก็บเลขบัตรเต็มหรือ CVV เด็ดขาด (ผิดหลัก PCI-DSS) — เก็บเฉพาะข้อมูลที่แสดงผลได้อย่างปลอดภัย
 * คือ brand, เลข 4 ตัวท้าย, เดือน/ปีหมดอายุ และชื่อบนบัตร เพื่อไว้ "จำบัตร" แบบเดียวกับเว็บอีคอมเมิร์ซทั่วไป
 */
const CARDS_KEY = "mv_saved_cards";

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

/**
 * subscribeCart(cb) — สมัครรับการแจ้งเตือนเมื่อตะกร้าเปลี่ยน (ทั้งในแท็บเดียวกันและข้ามแท็บ)
 * คืนค่าฟังก์ชันสำหรับ unsubscribe (ใช้ใน useEffect cleanup)
 */
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
