import React, { useEffect, useMemo, useState } from "react";
import { listProducts } from "./productsDataStore";
import { computeSalesMetrics, computeLowStock } from "./salesMetrics";
import SalesTrendChart from "./SalesTrendChart";
import "./adminProducts.css";
import AdminHeader from "./AdminHeader";

// ▲▼ small % badge next to a KPI value, comparing trailing 7 days vs
// the 7 days before that. Omitted entirely when there's nothing to
// compare against (both periods 0) rather than showing a misleading 0%.
function TrendBadge({ pct }) {
  if (!Number.isFinite(pct)) return null;
  const isUp = pct >= 0;
  return (
    <span className={"admin-trend-badge" + (isUp ? " is-up" : " is-down")}>
      {isUp ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

// 🧩 StatCard — plain KPI tile (no longer clickable — this dashboard is
// sales-only now, not a shortcut into the filtered product table).
function StatCard({ label, value, trend, tone }) {
  return (
    <div className={"admin-stat-card admin-stat-card--static" + (tone ? ` is-${tone}` : "")}>
      <div className="admin-stat-label">{label}</div>
      <div className={"admin-stat-value" + (tone ? ` is-${tone}` : "")}>{value}</div>
      {trend !== undefined && <TrendBadge pct={trend} />}
    </div>
  );
}

const baht = (n) => `฿${Math.round(n || 0).toLocaleString("th-TH")}`;

const dailyLabel = (key) => {
  const d = new Date(`${key}T00:00:00Z`);
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", timeZone: "UTC" });
};

const weeklyLabel = (key) => {
  const d = new Date(`${key}T00:00:00Z`);
  return `wk ${d.toLocaleDateString("th-TH", { day: "numeric", month: "short", timeZone: "UTC" })}`;
};

export default function ProductsDashboard() {
  const [products, setProducts] = useState([]);
  const [range, setRange] = useState("daily"); // "daily" | "weekly"

  useEffect(() => {
    setProducts(listProducts());
    // 🔁 lightweight polling — keeps sales numbers fresh as checkouts happen
    const t = setInterval(() => setProducts(listProducts()), 1500);
    return () => clearInterval(t);
  }, []);

  const metrics = useMemo(() => computeSalesMetrics(products), [products]);
  const lowStock = useMemo(() => computeLowStock(products), [products]);
  const chartPoints = range === "daily" ? metrics.daily : metrics.weekly;
  const chartLabelFn = range === "daily" ? dailyLabel : weeklyLabel;

  return (
    <div className="admin-wrap">
      <AdminHeader />

      <div className="admin-page">
        <div className="admin-header-row">
          <div>
            <div className="admin-eyebrow">Admin • Product Management</div>
            <h1 className="admin-h1">Dashboard ยอดขาย</h1>
          </div>
        </div>

        <div className="admin-stat-grid">
          <StatCard label="ยอดขายรวม" value={baht(metrics.totalRevenue)} trend={metrics.weekOverWeek.revenuePct} />
          <StatCard label="จำนวนออเดอร์" value={metrics.orderCount.toLocaleString("th-TH")} trend={metrics.weekOverWeek.ordersPct} />
          <StatCard label="ยอดซื้อเฉลี่ย" value={baht(metrics.avgOrderValue)} trend={metrics.weekOverWeek.aovPct} />
          <StatCard
            label="กำไรรวม"
            value={baht(metrics.totalProfit)}
            tone={metrics.totalProfit < 0 ? "alert" : undefined}
          />
          <StatCard
            label="มาร์จิ้นเฉลี่ย"
            value={`${metrics.marginPct.toFixed(1)}%`}
            tone={metrics.marginPct < 20 ? "warning" : undefined}
          />
        </div>
        <div className="admin-kpi-note">เทียบยอดขาย 7 วันล่าสุด กับ 7 วันก่อนหน้า</div>

        <div className="admin-panel admin-chart-panel">
          <div className="admin-chart-head">
            <div className="admin-stat-label">แนวโน้มยอดขาย</div>
            <div className="admin-range-toggle" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={range === "daily"}
                className={"admin-range-btn" + (range === "daily" ? " is-active" : "")}
                onClick={() => setRange("daily")}
              >
                รายวัน
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={range === "weekly"}
                className={"admin-range-btn" + (range === "weekly" ? " is-active" : "")}
                onClick={() => setRange("weekly")}
              >
                รายสัปดาห์
              </button>
            </div>
          </div>
          <SalesTrendChart points={chartPoints} formatLabel={chartLabelFn} />
        </div>

        <div className="admin-secondary-grid">
          <div className="admin-panel">
            <div className="admin-stat-label">สินค้าขายดี Top 5</div>
            {metrics.topProducts.length === 0 ? (
              <div className="admin-empty-note">ยังไม่มีข้อมูลการขาย</div>
            ) : (
              <div className="admin-top-products">
                {metrics.topProducts.map((p, i) => (
                  <div className="admin-top-product-row" key={p.productId}>
                    <div className="admin-top-product-rank">#{i + 1}</div>
                    <div className="admin-top-product-info">
                      <div className="admin-top-product-name">{p.name}</div>
                      <div className="admin-top-product-meta">ขายแล้ว {p.qty.toLocaleString("th-TH")} ชิ้น</div>
                    </div>
                    <div className="admin-top-product-revenue">{baht(p.revenue)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-panel">
            <div className="admin-lowstock-head">
              <div className="admin-stat-label">สต็อกใกล้หมด</div>
              {lowStock.length > 0 && <span className="admin-badge-count is-warning">{lowStock.length}</span>}
            </div>
            {lowStock.length === 0 ? (
              <div className="admin-empty-note">ไม่มีสินค้าใกล้หมดสต็อก</div>
            ) : (
              <div className="admin-lowstock-list">
                {lowStock.map((p) => (
                  <div className="admin-lowstock-row" key={p.id}>
                    <div className="admin-lowstock-name">{p.name}</div>
                    <div className="admin-lowstock-qty">
                      เหลือ {p.stockTotal.toLocaleString("th-TH")} / เกณฑ์ {p.lowStockThreshold.toLocaleString("th-TH")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}