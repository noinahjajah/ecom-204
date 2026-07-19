import { slugify, isNewToday, productCompleteness, parseMoneyToNumber } from "./productsUtils";

const STORAGE_KEY = "admin_products_v1";

function nowIso() {
  return new Date().toISOString();
}

function getSeedProducts() {
  // MVP seed: สร้างชุดข้อมูลจำลองพอให้ dashboard มีตัวเลข
  const base = [
    {
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
      video: [],
      image360: null,
      stockTotal: 120,
      reservedStock: 10,
      lowStockThreshold: 20,
      warehouses: [{ name: "Bangkok", qty: 120 }],
      variantOptions: [{
        name: "ขนาด",
        values: ["30ml", "50ml"],
      }],
      variants: [
        { sku: "SKU-SERUM-001-30", price: 2480, stock: 60, barcode: "8850000000110", image: null, options: { "ขนาด": "30ml" } },
        { sku: "SKU-SERUM-001-50", price: 2980, stock: 50, barcode: "8850000000120", image: null, options: { "ขนาด": "50ml" } },
      ],
      attributes: [{ key: "ผิวที่เหมาะ", value: "ทุกสภาพผิว" }],
      shipping: { weightKg: 0.08, widthCm: 6, heightCm: 16, lengthCm: 4, carrier: "Kerry", shippingFee: 0, freeShipping: true },
      seo: { metaTitle: "Velvet Silk Serum", metaDescription: "เซรั่มบำรุงผิว", urlSlug: "velvet-silk-serum", keywords: "serum,skin,th" },
      createdAt: nowIso(),
      updatedAt: nowIso(),
      soldCount: 340,
      views: 9200,
      clicks: 620,
      wishlist: 410,
      ratingAvg: 4.8,
      ratingCount: 88,
      ratingReportedCount: 0,
      activityLogs: [],
    },
    {
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
      video: [],
      image360: null,
      stockTotal: 0,
      reservedStock: 0,
      lowStockThreshold: 15,
      warehouses: [{ name: "Bangkok", qty: 0 }],
      variantOptions: [],
      variants: [],
      attributes: [{ key: "เหมาะกับ", value: "ผิวแพ้ง่าย" }],
      shipping: { weightKg: 0.09, widthCm: 7, heightCm: 17, lengthCm: 5, carrier: "Kerry", shippingFee: 39, freeShipping: false },
      seo: { metaTitle: "Rose Clay Cleansing Balm", metaDescription: "บาล์มอ่อนโยน", urlSlug: "rose-clay-cleansing-balm", keywords: "cleansing balm" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      updatedAt: nowIso(),
      soldCount: 180,
      views: 5200,
      clicks: 320,
      wishlist: 110,
      ratingAvg: 4.4,
      ratingCount: 41,
      ratingReportedCount: 1,
      activityLogs: [],
    },
    {
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
      video: [],
      image360: null,
      stockTotal: 35,
      reservedStock: 5,
      lowStockThreshold: 12,
      warehouses: [{ name: "Bangkok", qty: 35 }],
      variantOptions: [],
      variants: [],
      attributes: [],
      shipping: { weightKg: 0.02, widthCm: 5, heightCm: 12, lengthCm: 2, carrier: "Flash", shippingFee: 0, freeShipping: true },
      seo: { metaTitle: "Bare Petal Lip Tint", metaDescription: "", urlSlug: "bare-petal-lip-tint", keywords: "lip" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      updatedAt: nowIso(),
      soldCount: 500,
      views: 12000,
      clicks: 820,
      wishlist: 700,
      ratingAvg: 4.9,
      ratingCount: 120,
      ratingReportedCount: 0,
      activityLogs: [],
    },
    {
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
      status: "Hidden",
      tags: ["Best Seller"],
      mainImage: "https://placehold.co/240x240/ffffff/ad8a55?text=Highlighter",
      gallery: [],
      video: [],
      image360: null,
      stockTotal: 58,
      reservedStock: 0,
      lowStockThreshold: 10,
      warehouses: [{ name: "Bangkok", qty: 58 }],
      variantOptions: [],
      variants: [],
      attributes: [],
      shipping: { weightKg: 0.03, widthCm: 6, heightCm: 14, lengthCm: 3, carrier: "Kerry", shippingFee: 39, freeShipping: false },
      seo: { metaTitle: "Golden Hour Highlighter", metaDescription: "", urlSlug: "golden-hour-highlighter", keywords: "highlighter" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      soldCount: 760,
      views: 20000,
      clicks: 1200,
      wishlist: 950,
      ratingAvg: 4.7,
      ratingCount: 210,
      ratingReportedCount: 0,
      activityLogs: [],
    },
    {
      name: "Featherlight Concealer",
      enName: "Featherlight Concealer",
      descriptionShort: "คอนซีลเลอร์เนื้อครีม ปกปิดรอยคล้ำใต้ตา",
      category: "เมคอัพ",
      store: "Maison Véra",
      brand: "Maison Véra",
      sku: "SKU-CONC-040",
      barcode: "8850000000058",
      price: null,
      promoPrice: null,
      cost: 200,
      status: "Rejected",
      tags: ["Rejected"],
      mainImage: "https://placehold.co/240x240/faf3ea/ad8a55?text=Concealer",
      gallery: [],
      video: [],
      image360: null,
      stockTotal: 10,
      reservedStock: 0,
      lowStockThreshold: 12,
      warehouses: [{ name: "Bangkok", qty: 10 }],
      variantOptions: [],
      variants: [],
      attributes: [],
      shipping: { weightKg: 0.02, widthCm: 4, heightCm: 12, lengthCm: 2, carrier: "Kerry", shippingFee: 39, freeShipping: false },
      seo: { metaTitle: "Featherlight Concealer", metaDescription: "", urlSlug: "featherlight-concealer", keywords: "concealer" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      soldCount: 0,
      views: 300,
      clicks: 30,
      wishlist: 10,
      ratingAvg: 0,
      ratingCount: 0,
      ratingReportedCount: 0,
      activityLogs: [],
    },
  ];

  // normalize schema
  return base.map((p, idx) => {
    const id = `prod_${idx + 1}_${slugify(p.sku || p.name)}`;
    const comp = productCompleteness(p);
    return {
      id,
      ...p,
      createdAt: p.createdAt || nowIso(),
      updatedAt: p.updatedAt || nowIso(),
      tags: p.tags || [],
      gallery: p.gallery || [],
      video: p.video || [],
      variants: p.variants || [],
      variantOptions: p.variantOptions || [],
      attributes: p.attributes || [],
      shipping: p.shipping || { weightKg: 0, widthCm: 0, heightCm: 0, lengthCm: 0, carrier: "", shippingFee: 0, freeShipping: false },
      seo: p.seo || { metaTitle: p.name, metaDescription: "", urlSlug: slugify(p.name), keywords: "" },
      completeness: comp,
      statusDetail: {
        pending: p.status === "Pending",
        rejected: p.status === "Rejected",
        hidden: p.status === "Hidden",
        active: p.status === "Active",
        draft: p.status === "Draft",
        outOfStock: p.stockTotal === 0,
      },
    };
  });
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveAll(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function ensureSeeded() {
  const existing = loadAll();
  if (existing.length > 0) return existing;
  const seed = getSeedProducts();
  saveAll(seed);
  return seed;
}

export function listProducts() {
  const all = ensureSeeded();
  return all;
}

export function getProductById(id) {
  const all = ensureSeeded();
  return all.find((p) => p.id === id) || null;
}

function pushActivity(product, entry) {
  const next = { ...product };
  next.activityLogs = [...(product.activityLogs || []), entry];
  return next;
}

export function upsertProduct({ product, actor = "Admin" }) {
  const all = ensureSeeded();

  const isNew = !product.id || !all.some((p) => p.id === product.id);
  const id = product.id || `prod_${slugify(product.sku || product.name || "item")}_${Math.random().toString(16).slice(2, 8)}`;

  const normalized = {
    ...product,
    id,
    createdAt: product.createdAt || nowIso(),
    updatedAt: nowIso(),
    tags: product.tags || [],
    gallery: product.gallery || [],
    video: product.video || [],
    variants: product.variants || [],
    variantOptions: product.variantOptions || [],
    attributes: product.attributes || [],
    seo: product.seo || { metaTitle: product.name, metaDescription: "", urlSlug: slugify(product.name), keywords: "" },
    shipping: product.shipping || { weightKg: 0, widthCm: 0, heightCm: 0, lengthCm: 0, carrier: "", shippingFee: 0, freeShipping: false },
    stockTotal: Number.isFinite(product.stockTotal) ? product.stockTotal : parseMoneyToNumber(product.stockTotal),
    reservedStock: Number.isFinite(product.reservedStock) ? product.reservedStock : parseMoneyToNumber(product.reservedStock),
    promoPrice: product.promoPrice === undefined ? null : product.promoPrice,
  };

  normalized.completeness = productCompleteness(normalized);

  // update status detail
  normalized.statusDetail = {
    pending: normalized.status === "Pending",
    rejected: normalized.status === "Rejected",
    hidden: normalized.status === "Hidden",
    active: normalized.status === "Active",
    draft: normalized.status === "Draft",
    outOfStock: Number(normalized.stockTotal) <= 0,
  };

  let nextAll;
  if (isNew) {
    nextAll = [normalized, ...all];
    saveAll(nextAll);
    return normalized;
  }

  const prev = all.find((p) => p.id === id);
  nextAll = all.map((p) => (p.id === id ? normalized : p));

  const before = prev || null;
  const after = normalized;
  const changed = {
    who: actor,
    at: nowIso(),
    before: before ? { status: before.status, price: before.price, promoPrice: before.promoPrice, stockTotal: before.stockTotal } : null,
    after: { status: after.status, price: after.price, promoPrice: after.promoPrice, stockTotal: after.stockTotal },
    note: "Upsert product",
  };

  const updated = pushActivity(normalized, changed);
  nextAll = nextAll.map((p) => (p.id === id ? updated : p));
  saveAll(nextAll);

  return updated;
}

export function deleteProducts(ids, { actor = "Admin" } = {}) {
  const all = ensureSeeded();
  const set = new Set(ids || []);
  const next = all.filter((p) => !set.has(p.id));
  saveAll(next);
  return next;
}

export function bulkUpdateProducts(ids, updater, { actor = "Admin" } = {}) {
  const all = ensureSeeded();
  const set = new Set(ids || []);
  const at = nowIso();
  const updated = all.map((p) => {
    if (!set.has(p.id)) return p;
    const before = p;
    const after = updater(p);
    const normalized = {
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
    };

    // add minimal audit log
    const entry = {
      who: actor,
      at,
      before: { status: before.status, price: before.price, promoPrice: before.promoPrice, stockTotal: before.stockTotal, category: before.category },
      after: { status: normalized.status, price: normalized.price, promoPrice: normalized.promoPrice, stockTotal: normalized.stockTotal, category: normalized.category },
      note: "Bulk update",
    };

    return pushActivity(normalized, entry);
  });

  saveAll(updated);
  return updated;
}

export function exportProductsJSON() {
  const all = ensureSeeded();
  return JSON.stringify(all, null, 2);
}

export function importProductsJSON(jsonText, { actor = "Admin" } = {}) {
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) throw new Error("Invalid products JSON: expected array");

  const at = nowIso();
  const normalized = parsed.map((p) => {
    const id = p.id || `prod_${slugify(p.sku || p.name || "item")}_${Math.random().toString(16).slice(2, 8)}`;
    const comp = productCompleteness(p);
    return {
      ...p,
      id,
      createdAt: p.createdAt || at,
      updatedAt: p.updatedAt || at,
      tags: p.tags || [],
      gallery: p.gallery || [],
      video: p.video || [],
      variants: p.variants || [],
      variantOptions: p.variantOptions || [],
      attributes: p.attributes || [],
      seo: p.seo || { metaTitle: p.name, metaDescription: "", urlSlug: slugify(p.name), keywords: "" },
      shipping: p.shipping || { weightKg: 0, widthCm: 0, heightCm: 0, lengthCm: 0, carrier: "", shippingFee: 0, freeShipping: false },
      completeness: comp,
      statusDetail: {
        pending: p.status === "Pending",
        rejected: p.status === "Rejected",
        hidden: p.status === "Hidden",
        active: p.status === "Active",
        draft: p.status === "Draft",
        outOfStock: Number(p.stockTotal) <= 0,
      },
      activityLogs: p.activityLogs || [],
    };
  });

  // merge/replace by id
  const existing = ensureSeeded();
  const map = new Map(existing.map((p) => [p.id, p]));
  normalized.forEach((p) => map.set(p.id, p));

  const next = Array.from(map.values());
  saveAll(next);
  return next;
}

export function computeDashboardStats(products) {
  const all = products || [];
  const total = all.length;
  const active = all.filter((p) => p.status === "Active").length;
  const outOfStock = all.filter((p) => Number(p.stockTotal) <= 0).length;
  const hidden = all.filter((p) => p.status === "Hidden").length;
  const pending = all.filter((p) => p.status === "Pending").length;
  const rejected = all.filter((p) => p.status === "Rejected").length;

  const todayNew = all.filter((p) => isNewToday(p.createdAt)).length;
  const bestSelling = all.filter((p) => Number(p.soldCount) > 0).sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 1).length;
  // best-selling card should show top product count; in MVP show number of products that are best-seller candidates
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
    todayNew,
    bestSellerCount: bestSellerCandidates.length ? 1 : 0,
    noImage,
    notComplete,
    bestSellerCandidates,}}
