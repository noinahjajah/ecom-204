// salesMetrics.js
//
// This MVP store has no separate "orders" table — every completed
// checkout is recorded as a "system:checkout" entry inside a product's
// own activityLogs (see productsDataStore.js), where stockTotal drops
// from `before` to `after`. We treat each such log entry as one order
// line and price it at the product's promoPrice (if set) else its
// regular price, and cost it at the product's `cost`. That gives us
// real revenue/profit/date data to build the dashboard from, without
// inventing anything.

function toDateKey(iso) {
  return iso.slice(0, 10); // "YYYY-MM-DD"
}

// ISO week (Mon–Sun) bucket key, expressed as that week's Monday date.
function startOfWeekKey(iso) {
  const d = new Date(iso);
  const day = d.getUTCDay(); // 0 = Sun ... 6 = Sat
  const diffToMonday = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function extractOrderEvents(products) {
  const events = [];
  for (const p of products || []) {
    const price = p.promoPrice ?? p.price ?? 0;
    const cost = Number(p.cost) || 0;
    for (const log of p.activityLogs || []) {
      if (log?.who !== "system:checkout") continue;
      const before = log.before?.stockTotal;
      const after = log.after?.stockTotal;
      if (typeof before !== "number" || typeof after !== "number") continue;
      const qty = before - after;
      if (qty <= 0) continue;
      events.push({
        at: log.at,
        productId: p.id,
        productName: p.name,
        qty,
        revenue: qty * price,
        cost: qty * cost,
        profit: qty * (price - cost),
      });
    }
  }
  events.sort((a, b) => new Date(a.at) - new Date(b.at));
  return events;
}

function buildBuckets(events, keyFn, count) {
  const map = new Map();
  for (const ev of events) {
    const key = keyFn(ev.at);
    const bucket = map.get(key) || { key, revenue: 0, orders: 0 };
    bucket.revenue += ev.revenue;
    bucket.orders += 1;
    map.set(key, bucket);
  }
  const sortedKeys = [...map.keys()].sort();
  return sortedKeys.slice(-count).map((k) => map.get(k));
}

function computeTopProducts(events, limit = 5) {
  const map = new Map();
  for (const e of events) {
    const row = map.get(e.productId) || { productId: e.productId, name: e.productName, qty: 0, revenue: 0 };
    row.qty += e.qty;
    row.revenue += e.revenue;
    map.set(e.productId, row);
  }
  return [...map.values()].sort((a, b) => b.qty - a.qty || b.revenue - a.revenue).slice(0, limit);
}

function pctChange(curr, prev) {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return ((curr - prev) / prev) * 100;
}

// Compares the trailing `windowDays` against the `windowDays` before that,
// anchored on the real current time (not the last event) so it reflects
// "this week vs last week" as the app is actually used live.
function computeWeekOverWeek(events, windowDays = 7) {
  const now = Date.now();
  const startCurrent = now - windowDays * 86400000;
  const startPrevious = startCurrent - windowDays * 86400000;

  const current = events.filter((e) => {
    const t = new Date(e.at).getTime();
    return t > startCurrent && t <= now;
  });
  const previous = events.filter((e) => {
    const t = new Date(e.at).getTime();
    return t > startPrevious && t <= startCurrent;
  });

  const sumRevenue = (arr) => arr.reduce((s, e) => s + e.revenue, 0);
  const curRevenue = sumRevenue(current);
  const prevRevenue = sumRevenue(previous);
  const curOrders = current.length;
  const prevOrders = previous.length;
  const curAov = curOrders ? curRevenue / curOrders : 0;
  const prevAov = prevOrders ? prevRevenue / prevOrders : 0;

  return {
    revenuePct: pctChange(curRevenue, prevRevenue),
    ordersPct: pctChange(curOrders, prevOrders),
    aovPct: pctChange(curAov, prevAov),
  };
}

// dailyDays / weeklyWeeks control how many trailing buckets are shown,
// so the chart doesn't grow unbounded as the store accumulates history.
export function computeSalesMetrics(products, { dailyDays = 14, weeklyWeeks = 8 } = {}) {
  const events = extractOrderEvents(products);

  const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0);
  const totalProfit = events.reduce((sum, e) => sum + e.profit, 0);
  const orderCount = events.length;
  const avgOrderValue = orderCount ? totalRevenue / orderCount : 0;
  const marginPct = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalProfit,
    marginPct,
    orderCount,
    avgOrderValue,
    daily: buildBuckets(events, toDateKey, dailyDays),
    weekly: buildBuckets(events, startOfWeekKey, weeklyWeeks),
    topProducts: computeTopProducts(events, 5),
    weekOverWeek: computeWeekOverWeek(events, 7),
    events,
  };
}

// Low-stock alert — separate from sales, sourced directly from each
// product's own stockTotal vs. its lowStockThreshold (both already
// set per-product in AddEditProduct.jsx). Excludes items already at 0
// since those are a different, more urgent state than "running low".
export function computeLowStock(products) {
  return (products || [])
    .filter((p) => {
      const stock = Number(p.stockTotal);
      const threshold = Number(p.lowStockThreshold);
      return Number.isFinite(stock) && Number.isFinite(threshold) && stock > 0 && stock <= threshold;
    })
    .sort((a, b) => Number(a.stockTotal) - Number(b.stockTotal))
    .map((p) => ({
      id: p.id,
      name: p.name,
      stockTotal: Number(p.stockTotal),
      lowStockThreshold: Number(p.lowStockThreshold),
    }));
}