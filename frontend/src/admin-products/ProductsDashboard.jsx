import React, { useEffect, useMemo, useState } from "react";
import { computeDashboardStats, listProducts } from "./productsDataStore";
import "./adminProducts.css";
import AdminHeader from "./AdminHeader";

// 🧩 StatCard — one clickable KPI tile. `tone` just recolors the number
// (default / warning / alert) so problem-counts (no image, incomplete,
// out of stock) read differently from healthy counts at a glance.

function StatCard({ label, value, onClick, tone }) {
  return (
    <button type="button" className="admin-stat-card" onClick={onClick}>
      <div className="admin-stat-label">{label}</div>
      <div className={"admin-stat-value" + (tone ? ` is-${tone}` : "")}>{value}</div>
    </button>
  );
}

export default function ProductsDashboard() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts(listProducts());
    // 🔁 lightweight polling — see side-effect note above
    const t = setInterval(() => setProducts(listProducts()), 1500);
    return () => clearInterval(t);
  }, []);

  const stats = useMemo(() => computeDashboardStats(products), [products]);

  // 🔗 go() → navigates to the table view (ProductsTable.jsx) with filters
  // pre-applied via querystring. Keep keys identical to what getQuery()/
  // the `filtered` useMemo in ProductsTable.jsx expect.
  const go = (query) => {
    window.location.href = `/admin/products.html?${new URLSearchParams(query).toString()}`;
  };

  const bestSeller = stats.bestSellerCandidates?.[0] || null;

  return (
    <div className="admin-wrap">
      <AdminHeader />

      <div className="admin-page">
        <div className="admin-header-row">
          <div>
            <div className="admin-eyebrow">Admin • Product Management</div>
            <h1 className="admin-h1">Dashboard สินค้า</h1>
          </div>
          <a className="btn-primary" href="/admin/products/new.html" style={{ textDecoration: "none" }}>
            เพิ่มสินค้า
          </a>
        </div>

        <div className="admin-stat-grid">
          <StatCard label="จำนวนสินค้าทั้งหมด" value={stats.total} onClick={() => go({})} />
          <StatCard label="สินค้าที่กำลังขาย" value={stats.active} onClick={() => go({ status: "Active" })} />
          <StatCard label="สินค้าหมด" value={stats.outOfStock} tone="alert" onClick={() => go({ status: "OutOfStock" })} />
          <StatCard label="สินค้าถูกซ่อน" value={stats.hidden} tone="warning" onClick={() => go({ status: "Hidden" })} />
          <StatCard label="สินค้ารออนุมัติ" value={stats.pending} tone="warning" onClick={() => go({ status: "Pending" })} />
          <StatCard label="สินค้าถูกปฏิเสธ" value={stats.rejected} tone="alert" onClick={() => go({ status: "Rejected" })} />
          <StatCard label="สินค้าใหม่วันนี้" value={stats.todayNew} onClick={() => go({ createdToday: "1" })} />
          <StatCard label="สินค้าขายดีที่สุด" value={stats.bestSellerCount} onClick={() => go({ sort: "bestSelling" })} />
          <StatCard label="สินค้าที่ไม่มีรูป" value={stats.noImage} tone="warning" onClick={() => go({ noImage: "1" })} />
          <StatCard label="สินค้าที่ข้อมูลไม่ครบ" value={stats.notComplete} tone="alert" onClick={() => go({ incomplete: "1" })} />

          {/* 🏆 Best-seller spotlight — spans 2 cols, sits in the grid flow */}
          <div className="admin-panel admin-bestseller-card">
            <div className="admin-stat-label">Top best-seller (MVP)</div>
            {bestSeller ? (
              <div className="admin-bestseller-row">
                <img
                  src={bestSeller.mainImage || "https://placehold.co/60x60"}
                  alt={bestSeller.name}
                  className="admin-bestseller-thumb"
                />
                <div>
                  <div className="admin-bestseller-name">{bestSeller.name}</div>
                  <div className="admin-bestseller-meta">Sold: {bestSeller.soldCount || 0}</div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  {/* แก้ไขตรงนี้: เติมแท็ก <a กลับเข้าไป */}
                  <a
                    href={`/admin/products.html?search=${encodeURIComponent(bestSeller.name || "")}`}
                    className="btn-primary"
                    style={{ textDecoration: "none", padding: "10px 18px" }}
                  >
                    ดูในตาราง
                  </a>
                </div>
              </div>
            ) : (
              <div className="admin-bestseller-empty">ไม่มีข้อมูล best-seller</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}