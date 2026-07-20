// ─── Formatting utilities ───

export function f(n) {
  try {
    return (Number(n || 0)).toLocaleString("th-TH") + " บาท";
  } catch {
    return (Number(n || 0)).toLocaleString() + " บาท";
  }
}

export function fd(iso) {
  try {
    return new Date(iso).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso || "-";
    }
  }
}

export function sl(s) {
  return String(s ?? "").toLowerCase();
}

export function cl(o) {
  return JSON.parse(JSON.stringify(o));
}

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

export function parsePrice(v) {
  if (v === null || v === undefined) return 0;
  const s = String(v).replace(/,/g, "").trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
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
    ...(product.tags || []),
  ]
    .flat()
    .filter(Boolean)
    .map((x) => safeLower(x))
    .join(" ");
  return hay.includes(q);
}

export function compareBySort(a, b, sortKey) {
  const num = (x) => (typeof x === "number" ? x : parsePrice(x));
  const toTime = (d) => {
    const t = new Date(d).getTime();
    return Number.isFinite(t) ? t : 0;
  };
  switch (sortKey) {
    case "newest": return toTime(b.createdAt) - toTime(a.createdAt);
    case "oldest": return toTime(a.createdAt) - toTime(b.createdAt);
    case "priceHigh": return num(b.price) - num(a.price);
    case "priceLow": return num(a.price) - num(b.price);
    case "bestSelling": return num(b.soldCount) - num(a.soldCount);
    case "ratingHigh": return num(b.ratingAvg) - num(a.ratingAvg);
    case "stockHigh": return num(b.stockTotal) - num(a.stockTotal);
    case "viewsHigh": return num(b.views) - num(a.views);
    default: return 0;
  }
}

export function productCompleteness(product) {
  const hasImage = Boolean(product.mainImage) || (product.gallery?.length || 0) > 0;
  const requiredOk =
    Boolean(product.name) &&
    Boolean(product.sku) &&
    Boolean(product.category) &&
    Boolean(product.brand) &&
    Boolean(product.price);
  return { hasImage, isComplete: requiredOk };
}

export function copyToClipboard(text) {
  navigator.clipboard?.writeText(text);
}

export function generateId() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

