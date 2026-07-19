import React, { useEffect, useMemo, useState } from "react";
import Header from "../Header";
import { computeDashboardStats, listProducts } from "./productsDataStore";

function StatCard({ label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 16,
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "white",
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800 }}>{value}</div>
    </button>
  );
}

export default function ProductsDashboard() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    setProducts(listProducts());
    const t = setInterval(() => setProducts(listProducts()), 1500);
    return () => clearInterval(t);
  }, []);

  const stats = useMemo(() => computeDashboardStats(products), [products]);

  const go = (query) => {
    window.location.href = `/admin/products.html?${new URLSearchParams(query).toString()}`;
  };

  const bestSeller = stats.bestSellerCandidates?.[0] || null;

  return (
    <div style={{ background: "#fbfaf8", minHeight: "100vh" }}>
      <Header />
      <div style={{ maxWidth: 1200, margin: "18px auto", padding: "0 16px 40px" }}>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 0.12, textTransform: "uppercase" }}>
              Admin • Product Management
            </div>
            <h1 style={{ margin: "6px 0 0", fontSize: 26 }}>Dashboard สินค้า</h1>
          </div>
          <a
            className="btn-primary"
            href="/admin/products/new.html"
            style={{ textDecoration: "none" }}
          >
            เพิ่มสินค้า
          </a>
        </div>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          <StatCard label="จำนวนสินค้าทั้งหมด" value={stats.total} onClick={() => go({})} />
          <StatCard label="สินค้าที่กำลังขาย" value={stats.active} onClick={() => go({ status: "Active" })} />
          <StatCard label="สินค้าหมด" value={stats.outOfStock} onClick={() => go({ status: "OutOfStock" })} />
          <StatCard label="สินค้าถูกซ่อน" value={stats.hidden} onClick={() => go({ status: "Hidden" })} />
          <StatCard label="สินค้ารออนุมัติ" value={stats.pending} onClick={() => go({ status: "Pending" })} />
          <StatCard label="สินค้าถูกปฏิเสธ" value={stats.rejected} onClick={() => go({ status: "Rejected" })} />
          <StatCard label="สินค้าใหม่วันนี้" value={stats.todayNew} onClick={() => go({ createdToday: "1" })} />
          <StatCard label="สินค้าขายดีที่สุด" value={stats.bestSellerCount} onClick={() => go({ sort: "bestSelling" })} />
          <StatCard label="สินค้าที่ไม่มีรูป" value={stats.noImage} onClick={() => go({ noImage: "1" })} />
          <StatCard label="สินค้าที่ข้อมูลไม่ครบ" value={stats.notComplete} onClick={() => go({ incomplete: "1" })} />
          <div style={{ gridColumn: "span 2", marginTop: 0 }} />
          <div
            style={{
              gridColumn: "span 2",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 14,
              padding: 16,
              background: "white",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>Top best-seller (MVP)</div>
            {bestSeller ? (
              <div style={{ marginTop: 8, display: "flex", gap: 12, alignItems: "center" }}>
                <img
                  src={bestSeller.mainImage || "https://placehold.co/60x60"}
                  alt={bestSeller.name}
                  style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)" }}
                />
                <div>
                  <div style={{ fontWeight: 800 }}>{bestSeller.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Sold: {bestSeller.soldCount || 0}</div>
                </div>
                <div style={{ marginLeft: "auto" }}>
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
              <div style={{ marginTop: 10, opacity: 0.7 }}>ไม่มีข้อมูล best-seller</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

