import React, { useEffect, useMemo, useState } from "react";
import { getOrders } from "../utils/store";
import { listProducts } from "../utils/store";
import { f, fd } from "../utils/helpers";
import { BarChart, Donut } from "../components/Charts";

export default function OverviewPage() {
  const [orders, setOrders] = useState(() => getOrders());
  const [products, setProducts] = useState(() => listProducts());

  useEffect(() => {
    const refresh = () => {
      setOrders(getOrders());
      setProducts(listProducts());
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    window.addEventListener("storage", refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const kpi = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const orderList = Array.isArray(orders) ? orders : [];
    const revenue = orderList
      .filter(
        (o) =>
          String(o?.createdAt || o?.date || "").slice(0, 10) === today &&
          (o?.status === "paid" || o?.status === "ชำระแล้ว")
      )
      .reduce((s, o) => s + Number(o?.total || 0), 0);
    return {
      revenue,
      totalOrders: orderList.length,
      pendingShip: orderList.filter((o) =>
        ["รอดำเนินการ", "กำลังเตรียมพัสดุ", "กำลังจัดส่ง"].includes(o?.shipping)
      ).length,
      totalProducts: (Array.isArray(products) ? products : []).length,
      outOfStock: (Array.isArray(products) ? products : []).filter(
        (p) => Number(p.stockTotal || 0) <= 0
      ).length,
      activeProducts: (Array.isArray(products) ? products : []).filter(
        (p) => p.status === "Active"
      ).length,
    };
  }, [orders, products]);

  const chartData = useMemo(() => {
    const data = [];
    const orderList = Array.isArray(orders) ? orders : [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(Date.now() - i * 86400000);
      const key = dt.toISOString().slice(0, 10);
      const label = dt.toLocaleDateString("th-TH", {
        weekday: "short",
        day: "numeric",
      });
      const val = orderList
        .filter(
          (o) =>
            String(o?.createdAt || o?.date || "").slice(0, 10) === key &&
            (o?.status === "paid" || o?.status === "ชำระแล้ว")
        )
        .reduce((s, o) => s + Number(o?.total || 0), 0);
      data.push({ l: label, v: val });
    }
    return data;
  }, [orders]);

  const stats = useMemo(() => {
    const orderList = Array.isArray(orders) ? orders : [];
    const paid = orderList.filter(
      (o) => o?.status === "paid" || o?.status === "ชำระแล้ว"
    ).length;
    const waiting = orderList.filter(
      (o) => o?.status === "รอชำระเงิน"
    ).length;
    const cancelled = orderList.filter(
      (o) => o?.status === "ยกเลิก"
    ).length;
    return [
      { l: "ชำระแล้ว", v: paid },
      { l: "รอชำระ", v: waiting },
      { l: "ยกเลิก", v: cancelled },
    ];
  }, [orders]);

  const top5 = useMemo(() => {
    const productList = Array.isArray(products) ? products : [];
    return productList
      .filter((p) => Number(p.soldCount || 0) > 0)
      .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
      .slice(0, 5);
  }, [products]);

  return (
    <>
      <div className="admin-section-label">📊 ภาพรวมวันนี้</div>
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-accent gold" />
          <div className="admin-kpi-label">ยอดขายวันนี้</div>
          <div className="admin-kpi-value">
            {f(kpi.revenue).replace(" บาท", "")}
          </div>
          <div className="admin-kpi-note">บาท</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-accent blue" />
          <div className="admin-kpi-label">คำสั่งซื้อ</div>
          <div className="admin-kpi-value">{kpi.totalOrders}</div>
          <div className="admin-kpi-note">ออเดอร์</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-accent warm" />
          <div className="admin-kpi-label">รอจัดส่ง</div>
          <div className="admin-kpi-value">{kpi.pendingShip}</div>
          <div className="admin-kpi-note">รายการ</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-accent green" />
          <div className="admin-kpi-label">สินค้าทั้งหมด</div>
          <div className="admin-kpi-value">{kpi.totalProducts}</div>
          <div className="admin-kpi-note">
            Active {kpi.activeProducts} / หมด {kpi.outOfStock}
          </div>
        </div>
      </div>

      <div className="admin-content-grid">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div className="admin-panel-title">📈 ยอดขาย 7 วันล่าสุด</div>
          </div>
          <div style={{ padding: "1rem" }}>
            <BarChart data={chartData} height={160} />
          </div>
        </div>
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div className="admin-panel-title">สถานะออเดอร์</div>
          </div>
          <div
            style={{
              padding: "1.2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <Donut data={stats} size={130} />
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {stats.map((d, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: ["#b8975a", "#946200", "#b13030"][i],
                    }}
                  />
                  <span style={{ fontSize: 11 }}>
                    {d.l}: {d.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content-grid">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div className="admin-panel-title">🏆 สินค้าขายดีที่สุด</div>
          </div>
          <div>
            {top5.length === 0 && (
              <div style={{ padding: "1.5rem", textAlign: "center", opacity: 0.7 }}>
                ไม่มีข้อมูล
              </div>
            )}
            {top5.map((p, i) => {
              const mx = top5[0]?.soldCount || 1;
              return (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    padding: "0.7rem 1.2rem",
                    borderBottom: "1px solid rgba(229,221,208,0.5)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Fraunces',serif",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "#b8975a",
                      width: 22,
                      textAlign: "center",
                    }}
                  >
                    {i + 1}
                  </span>
                  <img
                    src={
                      p.mainImage || "https://placehold.co/36x36"
                    }
                    alt=""
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      objectFit: "cover",
                      border: "1px solid #e5ddd0",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 500 }}>
                      {p.name || "-"}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(92,85,73,0.55)" }}>
                      ขายแล้ว {p.soldCount || 0} ชิ้น
                    </div>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    {f(p.price)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div className="admin-panel-title">🕐 ออเดอร์ล่าสุด</div>
          </div>
          <div>
            {(
              Array.isArray(orders) ? orders : []
            ).slice(0, 5).map((o) => (
              <div
                key={o.id}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                  padding: "0.7rem 1.2rem",
                  borderBottom: "1px solid rgba(229,221,208,0.5)",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    flexShrink: 0,
                    marginTop: 5,
                    background:
                      o?.status === "paid" || o?.status === "ชำระแล้ว"
                        ? "#40a860"
                        : "#c84040",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.8rem" }}>
                    <b>{o.id}</b> —{" "}
                    {o?.shipping?.fullName || o?.customer?.fullName || "-"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "rgba(92,85,73,0.5)",
                      marginTop: 2,
                    }}
                  >
                    {f(o.total)} • {fd(o.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            {(!orders || orders.length === 0) && (
              <div
                style={{
                  padding: "1.5rem",
                  textAlign: "center",
                  opacity: 0.7,
                }}
              >
                ยังไม่มีออเดอร์
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

