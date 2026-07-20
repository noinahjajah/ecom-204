import { slugify, parsePrice, productCompleteness } from "./helpers";
import { STORAGE_KEYS } from "./constants";

/* ─── Products Store ─── */

function nowIso() {
  return new Date().toISOString();
}

/*
 * FULLY CONSISTENT SEED DATA
 * ──────────────────────────
 * - soldCount on each product matches total qty sold across all seed orders
 * - Order items reference the exact product id / name / price
 * - Every page (Overview, Orders, Products) sees the same coherent numbers
 */
const SEED_PRODUCTS_DATA = [
  {
    id: "prod_1_velvet-silk-serum",
    name: "Velvet Silk Serum",
    enName: "Velvet Silk Serum",
    descriptionShort: "เซรั่มบำรุงผิวเข้มข้น เนื้อบางเบา ซึมไว",
    category: "สกินแคร์",
    store: "Maison Véra",
    brand: "Maison Véra",
    sku: "SKU-SERUM-001",
    barcode: "8850000000010",
    price: 2480,
    promoPrice: null,
    cost: 980,
    status: "Active",
    tags: ["New", "Skincare"],
    mainImage: "https://placehold.co/240x240/faf3ea/ad8a55?text=Serum",
    gallery: [],
    stockTotal: 120,
    reservedStock: 10,
    lowStockThreshold: 20,
    warehouses: [{ name: "Bangkok", qty: 120 }],
    variantOptions: [{ name: "ขนาด", values: ["30ml", "50ml"] }],
    variants: [
      { sku: "SKU-SERUM-001-30", price: 2480, stock: 60, barcode: "8850000000110", image: null, options: { "ขนาด": "30ml" } },
      { sku: "SKU-SERUM-001-50", price: 2980, stock: 50, barcode: "8850000000120", image: null, options: { "ขนาด": "50ml" } },
    ],
    attributes: [{ key: "ผิวที่เหมาะ", value: "ทุกสภาพผิว" }],
    shipping: { weightKg: 0.08, widthCm: 6, heightCm: 16, lengthCm: 4, carrier: "Kerry", shippingFee: 0, freeShipping: true },
    seo: { metaTitle: "Velvet Silk Serum", metaDescription: "", urlSlug: "velvet-silk-serum", keywords: "serum,skin,th" },
    // soldCount = 4 (ORD-001 qty 2 + ORD-003 qty 1 + ORD-006 qty 1)
    soldCount: 4,
    views: 9200,
    clicks: 620,
    wishlist: 410,
    ratingAvg: 4.8,
    ratingCount: 88,
    ratingReportedCount: 0,
    activityLogs: [],
  },
  {
    id: "prod_2_rose-clay-cleansing-balm",
    name: "Rose Clay Cleansing Balm",
    enName: "Rose Clay Cleansing Balm",
    descriptionShort: "บาล์มทำความสะอาดผิว สูตรอ่อนโยน",
    category: "สกินแคร์",
    store: "Maison Véra",
    brand: "Maison Véra",
    sku: "SKU-CLEAN-010",
    barcode: "8850000000027",
    price: 1290,
    promoPrice: 1590,
    cost: 520,
    status: "Active",
    tags: ["Sale"],
    mainImage: "https://placehold.co/240x240/f3ece0/9c7b4f?text=Cleansing",
    gallery: [],
    stockTotal: 45,
    reservedStock: 0,
    lowStockThreshold: 15,
    warehouses: [{ name: "Bangkok", qty: 45 }],
    variantOptions: [],
    variants: [],
    attributes: [{ key: "เหมาะกับ", value: "ผิวแพ้ง่าย" }],
    shipping: { weightKg: 0.09, widthCm: 7, heightCm: 17, lengthCm: 5, carrier: "Kerry", shippingFee: 39, freeShipping: false },
    seo: { metaTitle: "Rose Clay Cleansing Balm", metaDescription: "", urlSlug: "rose-clay-cleansing-balm", keywords: "cleansing balm" },
    // soldCount = 4 (ORD-002 qty 1 + ORD-003 qty 2 + ORD-006 qty 1)
    soldCount: 4,
    views: 5200,
    clicks: 320,
    wishlist: 110,
    ratingAvg: 4.4,
    ratingCount: 41,
    ratingReportedCount: 1,
    activityLogs: [],
  },
  {
    id: "prod_3_bare-petal-lip-tint",
    name: "Bare Petal Lip Tint",
    enName: "Bare Petal Lip Tint",
    descriptionShort: "ลิปทินท์เนื้อกำมะหยี่ ติดทนตลอดวัน",
    category: "เมคอัพ",
    store: "Maison Véra",
    brand: "Maison Véra",
    sku: "SKU-LIP-020",
    barcode: "8850000000034",
    price: 890,
    promoPrice: null,
    cost: 250,
    status: "Pending",
    tags: ["Best Seller"],
    mainImage: null,
    gallery: [],
    stockTotal: 35,
    reservedStock: 5,
    lowStockThreshold: 12,
    warehouses: [{ name: "Bangkok", qty: 35 }],
    variantOptions: [],
    variants: [],
    attributes: [],
    shipping: { weightKg: 0.02, widthCm: 5, heightCm: 12, lengthCm: 2, carrier: "Flash", shippingFee: 0, freeShipping: true },
    seo: { metaTitle: "Bare Petal Lip Tint", metaDescription: "", urlSlug: "bare-petal-lip-tint", keywords: "lip" },
    // soldCount = 6 (ORD-001 qty 1 + ORD-004 qty 3 + ORD-006 qty 2)
    soldCount: 6,
    views: 12000,
    clicks: 820,
    wishlist: 700,
    ratingAvg: 4.9,
    ratingCount: 120,
    ratingReportedCount: 0,
    activityLogs: [],
  },
  {
    id: "prod_4_golden-hour-highlighter",
    name: "Golden Hour Highlighter",
    enName: "Golden Hour Highlighter",
    descriptionShort: "ไฮไลท์เนื้อครีม ให้แสงประกายจากภายใน",
    category: "เมคอัพ",
    store: "Maison Véra",
    brand: "Maison Véra",
    sku: "SKU-HL-030",
    barcode: "8850000000041",
    price: 1150,
    promoPrice: null,
    cost: 410,
    status: "Active",
    tags: ["Best Seller"],
    mainImage: "https://placehold.co/240x240/ffffff/ad8a55?text=Highlighter",
    gallery: [],
    stockTotal: 58,
    reservedStock: 0,
    lowStockThreshold: 10,
    warehouses: [{ name: "Bangkok", qty: 58 }],
    variantOptions: [],
    variants: [],
    attributes: [],
    shipping: { weightKg: 0.03, widthCm: 6, heightCm: 14, lengthCm: 3, carrier: "Kerry", shippingFee: 39, freeShipping: false },
    seo: { metaTitle: "Golden Hour Highlighter", metaDescription: "", urlSlug: "golden-hour-highlighter", keywords: "highlighter" },
    // soldCount = 4 (ORD-002 qty 1 + ORD-004 qty 1 + ORD-007 qty 2)
    soldCount: 4,
    views: 20000,
    clicks: 1200,
    wishlist: 950,
    ratingAvg: 4.7,
    ratingCount: 210,
    ratingReportedCount: 0,
    activityLogs: [],
  },
  {
    id: "prod_5_featherlight-concealer",
    name: "Featherlight Concealer",
    enName: "Featherlight Concealer",
    descriptionShort: "คอนซีลเลอร์เนื้อครีม ปกปิดรอยคล้ำใต้ตา",
    category: "เมคอัพ",
    store: "Maison Véra",
    brand: "Maison Véra",
    sku: "SKU-CONC-040",
    barcode: "8850000000058",
    price: 1290,
    promoPrice: null,
    cost: 200,
    status: "Active",
    tags: [],
    mainImage: "https://placehold.co/240x240/faf3ea/ad8a55?text=Concealer",
    gallery: [],
    stockTotal: 10,
    reservedStock: 0,
    lowStockThreshold: 12,
    warehouses: [{ name: "Bangkok", qty: 10 }],
    variantOptions: [],
    variants: [],
    attributes: [],
    shipping: { weightKg: 0.02, widthCm: 4, heightCm: 12, lengthCm: 2, carrier: "Kerry", shippingFee: 39, freeShipping: false },
    seo: { metaTitle: "Featherlight Concealer", metaDescription: "", urlSlug: "featherlight-concealer", keywords: "concealer" },
    // soldCount = 3 (ORD-005 qty 2 + ORD-007 qty 1)
    soldCount: 3,
    views: 3000,
    clicks: 230,
    wishlist: 50,
    ratingAvg: 4.2,
    ratingCount: 18,
    ratingReportedCount: 0,
    activityLogs: [],
  },
];

function getSeedProducts() {
  const now = Date.now();
  return SEED_PRODUCTS_DATA.map((p, idx) => {
    const daysAgo = [0, 2, 1, 7, 10][idx] || 0;
    const comp = productCompleteness(p);
    return {
      ...p,
      createdAt: new Date(now - daysAgo * 86400000).toISOString(),
      updatedAt: new Date(now - Math.max(0, daysAgo - 1) * 86400000).toISOString(),
      completeness: comp,
      statusDetail: {
        pending: p.status === "Pending",
        rejected: p.status === "Rejected",
        hidden: p.status === "Hidden",
        active: p.status === "Active",
        draft: p.status === "Draft",
        outOfStock: p.stockTotal <= 0,
      },
    };
  });
}

const SEED_ORDERS_DATA = [
  {
    id: "ORD-001",
    items: [
      { id: "prod_1_velvet-silk-serum", name: "Velvet Silk Serum", variant: "30ml", qty: 2, price: 2480 },
      { id: "prod_3_bare-petal-lip-tint", name: "Bare Petal Lip Tint", qty: 1, price: 890 },
    ],
    total: 5850, subtotal: 5850, shippingFee: 0,
    shipping: { fullName: "สมหญิง รักสวย", phone: "081-234-5678", address: "123/4 ถ.สุขุมวิท กรุงเทพฯ 10110" },
    customer: { fullName: "สมหญิง รักสวย", phone: "081-234-5678" },
    status: "paid",
    payment: { method: "credit_card", brand: "Visa", last4: "1234" },
    trackingNumber: "TH123456789", carrier: "Kerry",
  },
  {
    id: "ORD-002",
    items: [
      { id: "prod_2_rose-clay-cleansing-balm", name: "Rose Clay Cleansing Balm", qty: 1, price: 1290 },
      { id: "prod_4_golden-hour-highlighter", name: "Golden Hour Highlighter", qty: 1, price: 1150 },
    ],
    total: 2440, subtotal: 2440, shippingFee: 0,
    shipping: { fullName: "มานี มานะ", phone: "082-987-6543", address: "56/7 หมู่ 3 ต.ช้างเผือก อ.เมือง เชียงใหม่ 50000" },
    customer: { fullName: "มานี มานะ", phone: "082-987-6543" },
    status: "paid",
    trackingNumber: "FL987654321", carrier: "Flash Express",
  },
  {
    id: "ORD-003",
    items: [
      { id: "prod_1_velvet-silk-serum", name: "Velvet Silk Serum", variant: "50ml", qty: 1, price: 2980 },
      { id: "prod_2_rose-clay-cleansing-balm", name: "Rose Clay Cleansing Balm", qty: 2, price: 1290 },
    ],
    total: 5560, subtotal: 5560, shippingFee: 0,
    shipping: { fullName: "สมศักดิ์ ใจดี", phone: "083-456-7890", address: "99/88 ซอยเพชรบุรี ถ.พญาไท ราชเทวี กรุงเทพฯ 10400" },
    customer: { fullName: "สมศักดิ์ ใจดี", phone: "083-456-7890" },
    status: "รอชำระเงิน",
  },
  {
    id: "ORD-004",
    items: [
      { id: "prod_3_bare-petal-lip-tint", name: "Bare Petal Lip Tint", qty: 3, price: 890 },
      { id: "prod_4_golden-hour-highlighter", name: "Golden Hour Highlighter", qty: 1, price: 1150 },
    ],
    total: 3820, subtotal: 3820, shippingFee: 0,
    shipping: { fullName: "พิมพ์ใจ สุขใจ", phone: "084-123-4567", address: "200 หมู่ 2 ต.ป่าตอง อ.กะทู้ ภูเก็ต 83150" },
    customer: { fullName: "พิมพ์ใจ สุขใจ", phone: "084-123-4567" },
    status: "paid",
    carrier: "Kerry", trackingNumber: "KR456789012",
  },
  {
    id: "ORD-005",
    items: [
      { id: "prod_5_featherlight-concealer", name: "Featherlight Concealer", qty: 2, price: 1290 },
    ],
    total: 2619, subtotal: 2580, shippingFee: 39,
    shipping: { fullName: "วิชัย กล้าหาญ", phone: "085-678-9012", address: "12/34 ถ.เจริญกรุง แขวงบางรัก เขตบางรัก กรุงเทพฯ 10500" },
    customer: { fullName: "วิชัย กล้าหาญ", phone: "085-678-9012" },
    status: "ยกเลิก",
  },
  {
    id: "ORD-006",
    items: [
      { id: "prod_1_velvet-silk-serum", name: "Velvet Silk Serum", variant: "30ml", qty: 1, price: 2480 },
      { id: "prod_3_bare-petal-lip-tint", name: "Bare Petal Lip Tint", qty: 2, price: 890 },
      { id: "prod_2_rose-clay-cleansing-balm", name: "Rose Clay Cleansing Balm", qty: 1, price: 1290 },
    ],
    total: 5550, subtotal: 5550, shippingFee: 0,
    shipping: { fullName: "นงลักษณ์ พริ้งเพรา", phone: "086-234-5678", address: "88/8 หมู่ 6 ต.หนองปรือ อ.บางละมุง ชลบุรี 20150" },
    customer: { fullName: "นงลักษณ์ พริ้งเพรา", phone: "086-234-5678" },
    status: "paid",
    carrier: "Kerry", trackingNumber: "TH789012345",
  },
  {
    id: "ORD-007",
    items: [
      { id: "prod_4_golden-hour-highlighter", name: "Golden Hour Highlighter", qty: 2, price: 1150 },
      { id: "prod_5_featherlight-concealer", name: "Featherlight Concealer", qty: 1, price: 1290 },
    ],
    total: 3629, subtotal: 3590, shippingFee: 39,
    shipping: { fullName: "ก้องเกียรติ ยอดเยี่ยม", phone: "087-345-6789", address: "333 ถ.ศรีอยุธยา แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ 10400" },
    customer: { fullName: "ก้องเกียรติ ยอดเยี่ยม", phone: "087-345-6789" },
    status: "รอชำระเงิน",
  },
];

function getSeedOrders() {
  const now = Date.now();
  return SEED_ORDERS_DATA.map((o, idx) => {
    const daysAgo = [0.5, 1.2, 2, 3, 5, 0.8, 0.2][idx] || 1;
    const createdAt = new Date(now - daysAgo * 86400000);
    return {
      ...o,
      createdAt: createdAt.toISOString(),
      date: createdAt.toISOString(),
      statusHistory: [
        { status: o.status, at: createdAt.toISOString(), who: "System" },
        ...(o.id === "ORD-004" ? [{ status: "กำลังจัดส่ง", at: new Date(now - 2 * 86400000).toISOString(), who: "Admin" }] : []),
        ...(o.id === "ORD-005" ? [{ status: "paid", at: new Date(now - 5 * 86400000).toISOString(), who: "System" }, { status: "ยกเลิก", at: new Date(now - 4 * 86400000).toISOString(), who: "Admin" }] : []),
        ...(o.id === "ORD-006" ? [{ status: "paid", at: createdAt.toISOString(), who: "System" }, { status: "กำลังเตรียมพัสดุ", at: new Date(now - 0.5 * 86400000).toISOString(), who: "Admin" }] : []),
      ],
    };
  });
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.products);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(products) {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

export function ensureSeeded() {
  const existing = loadAll();
  if (existing.length > 0) return existing;
  const seed = getSeedProducts();
  saveAll(seed);
  return seed;
}

export function listProducts() {
  return ensureSeeded();
}

export function getProductById(id) {
  return ensureSeeded().find((p) => p.id === id) || null;
}

function pushActivity(product, entry) {
  return { ...product, activityLogs: [...(product.activityLogs || []), entry] };
}

export function upsertProduct({ product, actor = "Admin" }) {
  const all = ensureSeeded();
  const isNew = !product.id || !all.some((p) => p.id === p.id);
  const id = product.id || `prod_${slugify(product.sku || product.name || "item")}_${Math.random().toString(16).slice(2, 8)}`;
  const customNote = product._saveNote;

  const normalized = {
    ...product,
    id,
    createdAt: product.createdAt || nowIso(),
    updatedAt: nowIso(),
    tags: product.tags || [],
    gallery: product.gallery || [],
    variants: product.variants || [],
    variantOptions: product.variantOptions || [],
    attributes: product.attributes || [],
    warehouses: product.warehouses || [],
    seo: product.seo || { metaTitle: product.name, urlSlug: slugify(product.name) },
    shipping: product.shipping || {},
    stockTotal: Number(product.stockTotal || 0),
    reservedStock: Number(product.reservedStock || 0),
    cost: Number(product.cost || 0),
    promoPrice: product.promoPrice === undefined ? null : product.promoPrice,
    completeness: productCompleteness(product),
    statusDetail: {
      pending: product.status === "Pending",
      rejected: product.status === "Rejected",
      hidden: product.status === "Hidden",
      active: product.status === "Active",
      draft: product.status === "Draft",
      outOfStock: Number(product.stockTotal) <= 0,
    },
  };
  delete normalized._saveNote;

  let nextAll;
  if (isNew) {
    const created = pushActivity(normalized, {
      who: actor, at: nowIso(), before: null,
      after: { status: normalized.status, price: normalized.price, stockTotal: normalized.stockTotal },
      note: customNote || "Created product",
    });
    nextAll = [created, ...all];
  } else {
    const prev = all.find((p) => p.id === id);
    nextAll = all.map((p) => (p.id === id ? normalized : p));
    const changed = {
      who: actor, at: nowIso(),
      before: prev ? { status: prev.status, price: prev.price, stockTotal: prev.stockTotal } : null,
      after: { status: normalized.status, price: normalized.price, stockTotal: normalized.stockTotal },
      note: customNote || "Upsert product",
    };
    const updated = pushActivity(normalized, changed);
    nextAll = nextAll.map((p) => (p.id === id ? updated : p));
  }
  saveAll(nextAll);
  return isNew ? nextAll[0] : normalized;
}

export function deleteProducts(ids) {
  const set = new Set(ids || []);
  const next = ensureSeeded().filter((p) => !set.has(p.id));
  saveAll(next);
  return next;
}

export function bulkUpdateProducts(ids, updater) {
  const set = new Set(ids || []);
  const at = nowIso();
  const updated = ensureSeeded().map((p) => {
    if (!set.has(p.id)) return p;
    const after = updater(p);
    return pushActivity(
      {
        ...after,
        id: p.id,
        updatedAt: at,
        completeness: productCompleteness(after),
        statusDetail: {
          pending: after.status === "Pending",
          rejected: after.status === "Rejected",
          hidden: after.status === "Hidden",
          active: after.status === "Active",
          draft: after.status === "Draft",
          outOfStock: Number(after.stockTotal) <= 0,
        },
      },
      { who: "Admin", at, note: "Bulk update" }
    );
  });
  saveAll(updated);
  return updated;
}

export function exportProductsJSON() {
  return JSON.stringify(ensureSeeded(), null, 2);
}

export function importProductsJSON(jsonText) {
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) throw new Error("Invalid products JSON");
  const at = nowIso();
  const normalized = parsed.map((p) => {
    const id = p.id || `prod_${slugify(p.sku || p.name)}_${Math.random().toString(16).slice(2, 8)}`;
    return { ...p, id, createdAt: p.createdAt || at, updatedAt: p.updatedAt || at, completeness: productCompleteness(p) };
  });
  const map = new Map(ensureSeeded().map((p) => [p.id, p]));
  normalized.forEach((p) => map.set(p.id, p));
  const next = Array.from(map.values());
  saveAll(next);
  return next;
}

/* ============================================
   ORDERS STORE
   ============================================ */

function ensureOrdersSeeded() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.orders);
    if (raw && JSON.parse(raw).length > 0) return;
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(getSeedOrders()));
  } catch {
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(getSeedOrders()));
  }
}

export function getOrders() {
  ensureOrdersSeeded();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.orders);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
  return order;
}

export function updateOrder(id, updater) {
  const all = getOrders();
  const idx = all.findIndex((o) => o.id === id);
  if (idx < 0) return false;
  const updated = updater({ ...all[idx] });
  all[idx] = updated;
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(all));
  return true;
}

export function getOrderById(id) {
  return getOrders().find((o) => o.id === id) || null;
}
