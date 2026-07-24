// 📄 backend/services/productsService.js
// ─────────────────────────────────────────────────────────────
// All product business logic (normalization, activity logs, stock
// matching for checkout, dashboard stats) plus the actual Supabase
// reads/writes now live here — the frontend no longer touches
// Supabase directly. products_router.js is a thin layer that just
// calls these functions and returns JSON.
//
// Storage shape is unchanged from the earlier Supabase-direct version:
// each row = { id, sku, data, updated_at }, `data` is the full product
// object (see product.schema.json), stored as JSONB.
// ─────────────────────────────────────────────────────────────
const supabase = require('../Supabaseclient');

const TABLE = 'products';

function nowIso() {
  return new Date().toISOString();
}

// 🔤 The server is now the only place that generates product ids, so
// this only needs to be internally consistent — it no longer has to
// match the frontend's productsUtils.js slugify() byte-for-byte.
function slugify(input) {
  const s = String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'item';
}

function parseMoneyToNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const cleaned = String(value ?? '').replace(/[^0-9.-]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function isNewToday(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}



function productCompleteness(p) {
  const hasImage = !!p.mainImage || (Array.isArray(p.gallery) && p.gallery.length > 0);
  const isComplete = !!(p.name && p.sku && p.category && Number(p.price) > 0 && hasImage);
  return { hasImage, isComplete };
}

function getSeedProducts() {
  // MVP seed: สร้างชุดข้อมูลจำลองพอให้ dashboard มีตัวเลข (ใช้ครั้งแรกที่ table ว่าง)
  const base = [
    {
      name: 'Velvet Silk Serum',
      enName: 'Velvet Silk Serum',
      descriptionShort: 'เซรั่มบำรุงผิวเข้มข้น เนื้อบางเบา ซึมไว',
      category: 'สกินแคร์',
      store: 'Maison Véra',
      brand: 'Maison Véra',
      sku: 'SKU-SERUM-001',
      barcode: '8850000000010',
      price: 2480,
      promoPrice: null,
      cost: 980,
      status: 'Active',
      tags: ['New', 'Skincare'],
      mainImage: 'https://placehold.co/240x240/faf3ea/ad8a55?text=Serum',
      gallery: [],
      video: [],
      image360: null,
      stockTotal: 120,
      reservedStock: 10,
      lowStockThreshold: 20,
      warehouses: [{ name: 'Bangkok', qty: 120 }],
      variantOptions: [{ name: 'ขนาด', values: ['30ml', '50ml'] }],
      variants: [
        { sku: 'SKU-SERUM-001-30', price: 2480, stock: 60, barcode: '8850000000110', image: null, options: { 'ขนาด': '30ml' } },
        { sku: 'SKU-SERUM-001-50', price: 2980, stock: 50, barcode: '8850000000120', image: null, options: { 'ขนาด': '50ml' } },
      ],
      attributes: [{ key: 'ผิวที่เหมาะ', value: 'ทุกสภาพผิว' }],
      shipping: { weightKg: 0.08, widthCm: 6, heightCm: 16, lengthCm: 4, carrier: 'Kerry', shippingFee: 0, freeShipping: true },
      seo: { metaTitle: 'Velvet Silk Serum', metaDescription: 'เซรั่มบำรุงผิว', urlSlug: 'velvet-silk-serum', keywords: 'serum,skin,th' },
      createdAt: nowIso(),
      updatedAt: nowIso(),
      soldCount: 340, views: 9200, clicks: 620, wishlist: 410, ratingAvg: 4.8, ratingCount: 88, ratingReportedCount: 0,
      activityLogs: [],
    },
    {
      name: 'Rose Clay Cleansing Balm',
      enName: 'Rose Clay Cleansing Balm',
      descriptionShort: 'บาล์มทำความสะอาดผิว สูตรอ่อนโยน',
      category: 'สกินแคร์',
      store: 'Maison Véra',
      brand: 'Maison Véra',
      sku: 'SKU-CLEAN-010',
      barcode: '8850000000027',
      price: 1290,
      promoPrice: 1590,
      cost: 520,
      status: 'Active',
      tags: ['Sale'],
      mainImage: 'https://placehold.co/240x240/f3ece0/9c7b4f?text=Cleansing',
      gallery: [], video: [], image360: null,
      stockTotal: 0, reservedStock: 0, lowStockThreshold: 15,
      warehouses: [{ name: 'Bangkok', qty: 0 }],
      variantOptions: [], variants: [],
      attributes: [{ key: 'เหมาะกับ', value: 'ผิวแพ้ง่าย' }],
      shipping: { weightKg: 0.09, widthCm: 7, heightCm: 17, lengthCm: 5, carrier: 'Kerry', shippingFee: 39, freeShipping: false },
      seo: { metaTitle: 'Rose Clay Cleansing Balm', metaDescription: 'บาล์มอ่อนโยน', urlSlug: 'rose-clay-cleansing-balm', keywords: 'cleansing balm' },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      updatedAt: nowIso(),
      soldCount: 180, views: 5200, clicks: 320, wishlist: 110, ratingAvg: 4.4, ratingCount: 41, ratingReportedCount: 1,
      activityLogs: [],
    },
    {
      name: 'Bare Petal Lip Tint',
      enName: 'Bare Petal Lip Tint',
      descriptionShort: 'ลิปทินท์เนื้อกำมะหยี่ ติดทนตลอดวัน',
      category: 'เมคอัพ',
      store: 'Maison Véra',
      brand: 'Maison Véra',
      sku: 'SKU-LIP-020',
      barcode: '8850000000034',
      price: 890,
      promoPrice: null,
      cost: 250,
      status: 'Pending',
      tags: ['Best Seller'],
      mainImage: null,
      gallery: [], video: [], image360: null,
      stockTotal: 35, reservedStock: 5, lowStockThreshold: 12,
      warehouses: [{ name: 'Bangkok', qty: 35 }],
      variantOptions: [], variants: [], attributes: [],
      shipping: { weightKg: 0.02, widthCm: 5, heightCm: 12, lengthCm: 2, carrier: 'Flash', shippingFee: 0, freeShipping: true },
      seo: { metaTitle: 'Bare Petal Lip Tint', metaDescription: '', urlSlug: 'bare-petal-lip-tint', keywords: 'lip' },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      updatedAt: nowIso(),
      soldCount: 500, views: 12000, clicks: 820, wishlist: 700, ratingAvg: 4.9, ratingCount: 120, ratingReportedCount: 0,
      activityLogs: [],
    },
    {
      name: 'Golden Hour Highlighter',
      enName: 'Golden Hour Highlighter',
      descriptionShort: 'ไฮไลท์เนื้อครีม ให้แสงประกายจากภายใน',
      category: 'เมคอัพ',
      store: 'Maison Véra',
      brand: 'Maison Véra',
      sku: 'SKU-HL-030',
      barcode: '8850000000041',
      price: 1150,
      promoPrice: null,
      cost: 410,
      status: 'Hidden',
      tags: ['Best Seller'],
      mainImage: 'https://placehold.co/240x240/ffffff/ad8a55?text=Highlighter',
      gallery: [], video: [], image360: null,
      stockTotal: 58, reservedStock: 0, lowStockThreshold: 10,
      warehouses: [{ name: 'Bangkok', qty: 58 }],
      variantOptions: [], variants: [], attributes: [],
      shipping: { weightKg: 0.03, widthCm: 6, heightCm: 14, lengthCm: 3, carrier: 'Kerry', shippingFee: 39, freeShipping: false },
      seo: { metaTitle: 'Golden Hour Highlighter', metaDescription: '', urlSlug: 'golden-hour-highlighter', keywords: 'highlighter' },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      soldCount: 760, views: 20000, clicks: 1200, wishlist: 950, ratingAvg: 4.7, ratingCount: 210, ratingReportedCount: 0,
      activityLogs: [],
    },
    {
      name: 'Featherlight Concealer',
      enName: 'Featherlight Concealer',
      descriptionShort: 'คอนซีลเลอร์เนื้อครีม ปกปิดรอยคล้ำใต้ตา',
      category: 'เมคอัพ',
      store: 'Maison Véra',
      brand: 'Maison Véra',
      sku: 'SKU-CONC-040',
      barcode: '8850000000058',
      price: null,
      promoPrice: null,
      cost: 200,
      status: 'Rejected',
      tags: ['Rejected'],
      mainImage: 'https://placehold.co/240x240/faf3ea/ad8a55?text=Concealer',
      gallery: [], video: [], image360: null,
      stockTotal: 10, reservedStock: 0, lowStockThreshold: 12,
      warehouses: [{ name: 'Bangkok', qty: 10 }],
      variantOptions: [], variants: [], attributes: [],
      shipping: { weightKg: 0.02, widthCm: 4, heightCm: 12, lengthCm: 2, carrier: 'Kerry', shippingFee: 39, freeShipping: false },
      seo: { metaTitle: 'Featherlight Concealer', metaDescription: '', urlSlug: 'featherlight-concealer', keywords: 'concealer' },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      soldCount: 0, views: 300, clicks: 30, wishlist: 10, ratingAvg: 0, ratingCount: 0, ratingReportedCount: 0,
      activityLogs: [],
    },
  ];

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
      shipping: p.shipping || { weightKg: 0, widthCm: 0, heightCm: 0, lengthCm: 0, carrier: '', shippingFee: 0, freeShipping: false },
      seo: p.seo || { metaTitle: p.name, metaDescription: '', urlSlug: slugify(p.name), keywords: '' },
      warehouses: p.warehouses || [],
      cost: p.cost ?? 0,
      completeness: comp,
      statusDetail: {
        pending: p.status === 'Pending',
        rejected: p.status === 'Rejected',
        hidden: p.status === 'Hidden',
        active: p.status === 'Active',
        draft: p.status === 'Draft',
        outOfStock: p.stockTotal === 0,
      },
    };
  });
}

// ───────────────────────── Supabase row <-> product mapping ─────────────────────────

function rowToProduct(row) {
  return { ...(row.data || {}), id: row.id };
}

function productToRow(product) {
  return {
    id: product.id,
    sku: product.sku || null,
    data: product,
    updated_at: product.updatedAt || nowIso(),
  };
}

async function fetchAll() {
  console.time('fetchAll');

  console.time('select-query');
  const { data, error } = await supabase.from(TABLE).select('id, data');
  console.timeEnd('select-query');

  if (error) throw error;

  console.time('map-rows');
  const result = (data || []).map(rowToProduct);
  console.timeEnd('map-rows');

  console.timeEnd('fetchAll');
  return result;
}

async function fetchAllLite() {
  console.time('fetchAllLite');

  console.time('select-lite-query');
  const { data, error } = await supabase.from(TABLE).select('id, data');
  console.timeEnd('select-lite-query');

  if (error) throw error;

  console.time('extract-fields');
  const result = (data || []).map(row => {
    const d = row.data || {};
    return {
      id: row.id,
      name: d.name,
      status: d.status,
      price: d.price,
      promoPrice: d.promoPrice,
      descriptionShort: d.descriptionShort,
      mainImage: d.mainImage,
      stockTotal: d.stockTotal,
      gallery: d.gallery || [],
      tags: d.tags || [],
      category: d.category,
    };
  });
  console.timeEnd('extract-fields');

  console.timeEnd('fetchAllLite');
  return result;
}

async function ensureSeeded() {
  console.time('ensureSeeded');

  console.time('count-check');
  const { count, error } = await supabase.from(TABLE).select('id', { count: 'exact', head: true });
  console.timeEnd('count-check');
  if (error) throw error;

  if (count > 0) {
    console.time('fetch-all');
    const result = await fetchAll();
    console.timeEnd('fetch-all');
    console.timeEnd('ensureSeeded');
    return result;
  }

  console.time('get-seed-products');
  const seed = getSeedProducts();
  console.timeEnd('get-seed-products');

  console.time('insert-seed');
  const { error: insertError } = await supabase.from(TABLE).insert(seed.map(productToRow));
  console.timeEnd('insert-seed');
  if (insertError) throw insertError;

  console.timeEnd('ensureSeeded');
  return seed;
}

async function listProducts() {
  return fetchAllLite();
}

// ⚠️ Admin product table needs fields fetchAllLite() strips out for the
// storefront (sku, barcode, brand, store, createdAt, updatedAt,
// completeness, ...) — see products_router.js's GET /products/admin.
async function listProductsAdmin() {
  return fetchAll();
}

async function getProductById(id) {
  const { data, error } = await supabase.from(TABLE).select('id, data').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToProduct(data) : null;
}

function pushActivity(product, entry) {
  const next = { ...product };
  next.activityLogs = [...(product.activityLogs || []), entry];
  return next;
}

async function upsertProduct({ product, actor = 'Admin' }) {
  let existing = null;
  if (product.id) {
    const { data, error } = await supabase.from(TABLE).select('id, data').eq('id', product.id).maybeSingle();
    if (error) throw error;
    existing = data ? rowToProduct(data) : null;
  }

  const isNew = !existing;
  const id = product.id || `prod_${slugify(product.sku || product.name || 'item')}_${Math.random().toString(16).slice(2, 8)}`;
  const customNote = product._saveNote;

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
    warehouses: product.warehouses || [],
    seo: product.seo || { metaTitle: product.name, metaDescription: '', urlSlug: slugify(product.name), keywords: '' },
    shipping: product.shipping || { weightKg: 0, widthCm: 0, heightCm: 0, lengthCm: 0, carrier: '', shippingFee: 0, freeShipping: false },
    stockTotal: Number.isFinite(product.stockTotal) ? product.stockTotal : parseMoneyToNumber(product.stockTotal),
    reservedStock: Number.isFinite(product.reservedStock) ? product.reservedStock : parseMoneyToNumber(product.reservedStock),
    cost: Number.isFinite(product.cost) ? product.cost : parseMoneyToNumber(product.cost),
    promoPrice: product.promoPrice === undefined ? null : product.promoPrice,
  };
  delete normalized._saveNote;

  normalized.completeness = productCompleteness(normalized);
  normalized.statusDetail = {
    pending: normalized.status === 'Pending',
    rejected: normalized.status === 'Rejected',
    hidden: normalized.status === 'Hidden',
    active: normalized.status === 'Active',
    draft: normalized.status === 'Draft',
    outOfStock: Number(normalized.stockTotal) <= 0,
  };

  let finalProduct;
  if (isNew) {
    finalProduct = pushActivity(normalized, {
      who: actor,
      at: nowIso(),
      before: null,
      after: { status: normalized.status, price: normalized.price, promoPrice: normalized.promoPrice, stockTotal: normalized.stockTotal },
      note: customNote || 'Created product',
    });
  } else {
    const changed = {
      who: actor,
      at: nowIso(),
      before: { status: existing.status, price: existing.price, promoPrice: existing.promoPrice, stockTotal: existing.stockTotal },
      after: { status: normalized.status, price: normalized.price, promoPrice: normalized.promoPrice, stockTotal: normalized.stockTotal },
      note: customNote || 'Upsert product',
    };
    finalProduct = pushActivity(normalized, changed);
  }

  const { error } = await supabase.from(TABLE).upsert(productToRow(finalProduct));
  if (error) throw error;

  return finalProduct;
}

async function deleteProducts(ids) {
  const list = ids || [];
  if (list.length > 0) {
    const { error } = await supabase.from(TABLE).delete().in('id', list);
    if (error) throw error;
  }
  return fetchAll();
}

/**
 * bulkUpdateProducts — NOTE: this used to take an updater *function* on
 * the frontend (can't serialize a function over HTTP), so it now takes
 * a plain `patch` object merged onto each matched product instead. Every
 * call site in ProductsTable.jsx only ever passed simple field patches
 * (status/stockTotal), so this is a behavior-preserving change — see
 * products_router.js's PATCH /products/bulk.
 */
async function bulkUpdateProducts(ids, patch, { actor = 'Admin' } = {}) {
  const set = new Set(ids || []);
  const all = await fetchAll();
  const at = nowIso();
  const rowsToUpsert = [];

  const updated = all.map((p) => {
    if (!set.has(p.id)) return p;
    const before = p;
    const after = { ...p, ...patch };
    const normalized = {
      ...after,
      id: p.id,
      updatedAt: at,
      completeness: productCompleteness(after),
      statusDetail: {
        pending: after.status === 'Pending',
        rejected: after.status === 'Rejected',
        hidden: after.status === 'Hidden',
        active: after.status === 'Active',
        draft: after.status === 'Draft',
        outOfStock: Number(after.stockTotal) <= 0,
      },
    };

    const entry = {
      who: actor,
      at,
      before: { status: before.status, price: before.price, promoPrice: before.promoPrice, stockTotal: before.stockTotal, category: before.category },
      after: { status: normalized.status, price: normalized.price, promoPrice: normalized.promoPrice, stockTotal: normalized.stockTotal, category: normalized.category },
      note: 'Bulk update',
    };

    const withLog = pushActivity(normalized, entry);
    rowsToUpsert.push(withLog);
    return withLog;
  });

  if (rowsToUpsert.length > 0) {
    const { error } = await supabase.from(TABLE).upsert(rowsToUpsert.map(productToRow));
    if (error) throw error;
  }

  return updated;
}

async function exportProductsJSON() {
  const all = await fetchAll();
  return JSON.stringify(all, null, 2);
}

async function importProductsJSON(jsonText, { actor = 'Admin' } = {}) {
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) throw new Error('Invalid products JSON: expected array');

  const at = nowIso();
  const normalized = parsed.map((p) => {
    const id = p.id || `prod_${slugify(p.sku || p.name || 'item')}_${Math.random().toString(16).slice(2, 8)}`;
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
      seo: p.seo || { metaTitle: p.name, metaDescription: '', urlSlug: slugify(p.name), keywords: '' },
      shipping: p.shipping || { weightKg: 0, widthCm: 0, heightCm: 0, lengthCm: 0, carrier: '', shippingFee: 0, freeShipping: false },
      completeness: comp,
      statusDetail: {
        pending: p.status === 'Pending',
        rejected: p.status === 'Rejected',
        hidden: p.status === 'Hidden',
        active: p.status === 'Active',
        draft: p.status === 'Draft',
        outOfStock: Number(p.stockTotal) <= 0,
      },
      activityLogs: p.activityLogs || [],
    };
  });

  const { error } = await supabase.from(TABLE).upsert(normalized.map(productToRow));
  if (error) throw error;

  return fetchAll();
}

function variantMatches(variant, item) {
  if (variant.sku && item.variant && variant.sku === item.variant) return true;
  const optionValues = Object.values(variant.options || {});
  return optionValues.some((v) => v === item.variant);
}

class InsufficientStockError extends Error {
  constructor(details) {
    super('สินค้าบางรายการมีสต็อกไม่พอ');
    this.code = 'INSUFFICIENT_STOCK';
    this.details = details;
  }
}

const DECREMENT_MAX_RETRIES = 8;

/**
 * ตัดสต็อกของสินค้าชิ้นเดียว โดยใช้ `updated_at` เป็น optimistic-lock version:
 * อ่านแถวปัจจุบัน → คำนวณค่าใหม่ → UPDATE ... WHERE id = ? AND updated_at = ?
 * (สเตตเมนต์เดียว, atomic ระดับ DB) ถ้า UPDATE นั้นไม่ match แถวไหนเลย แปลว่ามี
 * request อื่นเขียนทับระหว่างเราอ่าน/เขียน — วนอ่านใหม่แล้วลองอีกครั้ง แทนที่จะ
 * read-modify-upsert ทั้งก้อนแบบเดิมซึ่งเกิด lost update ได้เวลามีคนสั่งซื้อพร้อมกัน
 */
async function decrementOneProduct(productId, lines, actor, at) {
  for (let attempt = 0; attempt < DECREMENT_MAX_RETRIES; attempt++) {
    const { data: row, error: fetchError } = await supabase
      .from(TABLE)
      .select('id, data, updated_at')
      .eq('id', productId)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!row) return { outcome: 'missing' };

    const product = rowToProduct(row);
    const expectedUpdatedAt = row.updated_at;

    const totalQtyNeeded = lines.reduce((sum, l) => sum + l.qty, 0);
    const stockBefore = Number(product.stockTotal) || 0;
    let variants = Array.isArray(product.variants) ? product.variants.map((v) => ({ ...v })) : [];

    if (stockBefore < totalQtyNeeded) {
      return { outcome: 'insufficient', name: product.name, available: stockBefore, requested: totalQtyNeeded };
    }

    const variantShortfall = lines.find(({ item, qty }) => {
      if (variants.length === 0 || !item.variant) return false;
      const v = variants.find((vv) => variantMatches(vv, item));
      return v && Number(v.stock || 0) < qty;
    });
    if (variantShortfall) {
      return { outcome: 'insufficient', name: product.name, available: stockBefore, requested: totalQtyNeeded };
    }

    let stockTotal = stockBefore;
    lines.forEach(({ item, qty }) => {
      stockTotal = Math.max(0, stockTotal - qty);
      if (variants.length > 0 && item.variant) {
        variants = variants.map((v) =>
          variantMatches(v, item) ? { ...v, stock: Math.max(0, Number(v.stock || 0) - qty) } : v
        );
      }
    });

    const next = { ...product, stockTotal, variants, updatedAt: at };
    next.statusDetail = { ...product.statusDetail, outOfStock: stockTotal <= 0 };
    next.activityLogs = [
      ...(product.activityLogs || []),
      { who: actor, at, before: { stockTotal: stockBefore }, after: { stockTotal }, note: 'Stock deducted from order' },
    ];

    const { data: updatedRows, error: updateError } = await supabase
      .from(TABLE)
      .update(productToRow(next))
      .eq('id', productId)
      .eq('updated_at', expectedUpdatedAt)
      .select('id');
    if (updateError) throw updateError;

    if (updatedRows && updatedRows.length > 0) {
      return { outcome: 'ok', product: next };
    }
    // updated_at ไม่ match แล้ว = ชนกับ request อื่นระหว่างทาง วนไปอ่านใหม่แล้วลองอีกครั้ง
  }

  throw new Error(`ตัดสต็อกสินค้า ${productId} ไม่สำเร็จ: มีคำสั่งซื้ออื่นชนกันถี่เกินไป กรุณาลองใหม่`);
}

/**
 * ตัดสต็อกหลังจากคำสั่งซื้อชำระเงินสำเร็จ — เรียกจาก checkout endpoint
 * (ให้ CheckoutPage.jsx เรียก backend มาที่ POST /api/products/decrement-stock
 * แทนการเรียก decrementStockForOrder() ตรงๆ จากฝั่ง frontend เหมือนก่อนหน้านี้)
 *
 * ตัดสต็อกทีละสินค้าด้วย optimistic-lock UPDATE (ดู decrementOneProduct) แทนการ
 * read-all → modify-in-memory → upsert-all แบบเดิม ซึ่งไม่ปลอดภัยเวลามีคนสั่งซื้อ
 * สินค้าเดียวกันพร้อมกันหลาย request (oversell). ถ้าสต็อกไม่พอจะ throw
 * InsufficientStockError แทนการ clamp เงียบๆ ที่ 0
 */
async function decrementStockForOrder(items, { actor = 'system:checkout' } = {}) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return fetchAll();

  // ใช้ snapshot แค่สำหรับ resolve id ของ item (ชื่อ/sku อาจ match แบบ fuzzy) —
  // ตัวเลข stock จริงจะอ่านสดใหม่ทุกครั้งใน decrementOneProduct ไม่ใช่จาก snapshot นี้
  const snapshot = await fetchAll();
  function findProduct(item) {
    return (
      snapshot.find((p) => p.id === item.id) ||
      snapshot.find((p) => slugify(p.name || '') === slugify(item.name || '')) ||
      snapshot.find((p) => p.sku === item.sku) ||
      null
    );
  }

  const linesByProductId = new Map();
  list.forEach((item) => {
    const qty = Number(item.qty) || 0;
    if (qty <= 0) return;
    const product = findProduct(item);
    if (!product) return; // ไม่รู้จักสินค้านี้ — เหมือนพฤติกรรมเดิม ไม่ต้องตัดอะไร
    const bucket = linesByProductId.get(product.id) || [];
    bucket.push({ item, qty });
    linesByProductId.set(product.id, bucket);
  });

  const at = nowIso();
  const insufficient = [];

  for (const [productId, lines] of linesByProductId.entries()) {
    const result = await decrementOneProduct(productId, lines, actor, at);
    if (result.outcome === 'insufficient') {
      insufficient.push({ productId, name: result.name, available: result.available, requested: result.requested });
    }
    // 'missing' (ถูกลบไปแล้ว) ก็ถือว่าข้ามไปเหมือน 'ไม่รู้จักสินค้านี้' ด้านบน
  }

  if (insufficient.length > 0) {
    throw new InsufficientStockError(insufficient);
  }

  return fetchAll();
}

function computeDashboardStats(products) {
  const all = products || [];
  const total = all.length;
  const active = all.filter((p) => p.status === 'Active').length;
  const outOfStock = all.filter((p) => Number(p.stockTotal) <= 0).length;
  const hidden = all.filter((p) => p.status === 'Hidden').length;
  const pending = all.filter((p) => p.status === 'Pending').length;
  const rejected = all.filter((p) => p.status === 'Rejected').length;
  const todayNew = all.filter((p) => isNewToday(p.createdAt)).length;
  const bestSellerCandidates = all.filter((p) => Number(p.soldCount) > 0).sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
  const noImage = all.filter((p) => !p.mainImage && (p.gallery?.length || 0) === 0).length;
  const notComplete = all.filter((p) => !p.completeness?.isComplete).length;

  return {
    total, active, outOfStock, hidden, pending, rejected, todayNew,
    bestSellerCount: bestSellerCandidates.length ? 1 : 0,
    noImage, notComplete, bestSellerCandidates,
  };
}


module.exports = {
  listProducts,
  listProductsAdmin,
  getProductById,
  upsertProduct,
  deleteProducts,
  bulkUpdateProducts,
  exportProductsJSON,
  importProductsJSON,
  decrementStockForOrder,
  computeDashboardStats,
};
