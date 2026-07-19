export function slugify(input) {
  const s = String(input ?? "").trim().toLowerCase();
  if (!s) return "";
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function parseMoneyToNumber(v) {
  if (v === null || v === undefined) return 0;
  const s = String(v).replace(/,/g, "").trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoneyTHB(n) {
  const num = typeof n === "number" ? n : parseMoneyToNumber(n);
  return num.toLocaleString("th-TH") + " บาท";
}

export function isNewToday(isoOrDate, now = new Date()) {
  if (!isoOrDate) return false;
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return false;

  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function safeLower(s) {
  return String(s ?? "").toLowerCase();
}

export function matchesSearch(product, query) {
  const q = safeLower(query).trim();
  if (!q) return true;

  const hay = [
    product.name,
    product.enName,
    product.sku,
    product.barcode,
    product.id,
    product.store,
    product.category,
    product.brand,
    product.tag,
    ...(product.tags || []),
  ]
    .flat()
    .filter(Boolean)
    .map((x) => safeLower(x))
    .join(" ");

  return hay.includes(q);
}

export function productCompleteness(product) {
  // flags ที่ dashboard/แจ้งเตือนจะใช้
  const hasImage = Boolean(product.mainImage) || (product.gallery?.length || 0) > 0;

  // ข้อมูลไม่ครบ: ใน MVP ให้เช็คฟิลด์สำคัญ 5 อย่าง
  const requiredOk =
    Boolean(product.name) &&
    Boolean(product.sku) &&
    Boolean(product.category) &&
    Boolean(product.brand) &&
    Boolean(product.price);

  return {
    hasImage,
    isComplete: requiredOk,
  };
}

export function compareBySort(a, b, sortKey) {
  // sortKey: newest/oldest/priceHigh/priceLow/bestSelling/ratingHigh/stockHigh/viewsHigh
  const num = (x) => (typeof x === "number" ? x : parseMoneyToNumber(x));

  const toTime = (d) => {
    const t = new Date(d).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  switch (sortKey) {
    case "newest":
      return toTime(b.createdAt) - toTime(a.createdAt);
    case "oldest":
      return toTime(a.createdAt) - toTime(b.createdAt);
    case "priceHigh":
      return num(b.price) - num(a.price);
    case "priceLow":
      return num(a.price) - num(b.price);
    case "bestSelling":
      return num(b.soldCount) - num(a.soldCount);
    case "ratingHigh":
      return num(b.ratingAvg) - num(a.ratingAvg);
    case "stockHigh":
      return num(b.stockTotal) - num(a.stockTotal);
    case "viewsHigh":
      return num(b.views) - num(a.views);
    default:
      return 0;
  }
}