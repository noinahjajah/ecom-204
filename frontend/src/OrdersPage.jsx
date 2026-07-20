import React, { useEffect, useMemo, useState } from "react";
import Header from "./Header";
import { getOrders } from "./cart";

function formatTHB(n) {
  return n.toLocaleString("th-TH") + " บาท";
}

function formatDateTH(iso) {
  try {
    return new Date(iso).toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getQueryParam(name) {
  const sp = new URLSearchParams(window.location.search);
  return sp.get(name);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(() => getOrders());

  useEffect(() => {
    // localStorage อาจอัปเดตจากหน้าอื่น
    const onStorage = () => setOrders(getOrders());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const highlightId = getQueryParam("highlight");

  const activeOrder = useMemo(() => {
    if (!highlightId) return null;
    return orders.find((o) => o.id === highlightId) || null;
  }, [orders, highlightId]);

  const latestOrder = orders[0] || null;
  const order = activeOrder || latestOrder;

  const superbetUrl = useMemo(() => {
    // โปรเจกต์นี้ยังไม่มีรูปแบบ URL tracking ของ Superbet ที่ยืนยันได้แน่นอน
    // จึงทำเป็น “ลิงก์ตัวอย่าง” เพื่อให้ใช้งานได้ทันที และคุณสามารถแก้ URL ได้ทีหลัง
    const tn = order?.trackingNumber;
    if (!tn) return "";
    // TODO: แทนที่ด้วย URL tracking จริงของ Superbet
    return `https://example.com/superbet/track?code=${encodeURIComponent(tn)}`;
  }, [order?.trackingNumber]);

  if (!order) {
    return (
      <div className="orders">
        <Header />
        <div style={{ maxWidth: 920, margin: "28px auto", padding: "0 16px" }}>
          <h1>ติดตามคำสั่งซื้อ</h1>
          <p style={{ opacity: 0.85 }}>ยังไม่มีคำสั่งซื้อในระบบ</p>
          <a className="btn-primary" href="/">กลับไปเลือกสินค้า</a>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      <Header />

      <div style={{ maxWidth: 980, margin: "28px auto", padding: "0 16px" }}>
        <nav style={{ marginBottom: 14, opacity: 0.85 }}>
          <a href="/">หน้าแรก</a> / <span>ติดตามคำสั่งซื้อ</span>
        </nav>

        <h1 style={{ margin: "6px 0 6px" }}>ติดตามคำสั่งซื้อ</h1>
        {highlightId && (
          <p style={{ marginTop: 0, opacity: 0.85 }}>
            แสดงผลออเดอร์ที่เพิ่งสั่ง: <b>{highlightId}</b>
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 16,
          }}
        >
          <section style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Order ID</div>
                <div style={{ fontWeight: 700 }}>{order.id}</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                  สร้างเมื่อ {formatDateTH(order.createdAt)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>สถานะ</div>
                <div style={{ fontWeight: 700 }}>{order.status}</div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>พัสดุ</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>ขนส่ง</div>
                  <div>{order.carrier || "-"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Tracking Number</div>
                  <div style={{ fontWeight: 600 }}>{order.trackingNumber || "-"}</div>
                </div>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>คาดว่าจะได้รับ</div>
                <div style={{ fontWeight: 600 }}>
                  {order.estimatedDelivery ? formatDateTH(order.estimatedDelivery) : "-"}
                </div>
              </div>

              {order.trackingNumber && (
                <div style={{ marginTop: 14 }}>
                  <a
                    className="btn-primary"
                    href={superbetUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-block" }}
                  >
                    ติดตามกับ Superbet
                  </a>
                  <p style={{ margin: "8px 0 0", fontSize: 12, opacity: 0.7 }}>
                    ปุ่มนี้เป็นลิงก์ตัวอย่าง—หากต้องการให้ชี้ไป tracking จริง ให้แก้ URL ในไฟล์นี้
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginTop: 18 }}>
              <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>Timeline</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(order.statusHistory || []).map((h, idx) => (
                  <div
                    key={`${h.status}-${idx}`}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: h.status === order.status ? "rgba(0,0,0,0.03)" : "transparent",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <b>{h.status}</b>
                      <span style={{ opacity: 0.7, fontSize: 12 }}>{formatDateTH(h.at)}</span>
                    </div>
                    {h.trackingNumber && (
                      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                        {h.carrier || ""} • {h.trackingNumber}
                      </div>
                    )}
                  </div>
                ))}
                {(!order.statusHistory || order.statusHistory.length === 0) && (
                  <p style={{ opacity: 0.75, margin: 0 }}>ไม่มีข้อมูล timeline</p>
                )}
              </div>
            </div>
          </section>

          <aside style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 16 }}>
            <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>รายการสินค้า</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {order.items?.map((it) => (
                <div
                  key={it.id + it.variant}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    borderBottom: "1px dashed rgba(0,0,0,0.1)",
                    paddingBottom: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {it.name}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      {it.variant ? it.variant : it.category}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>จำนวน: {it.qty}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{formatTHB(it.price * it.qty)}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.75 }}>ยอดรวมสินค้า</span>
                <b>{formatTHB(order.subtotal || 0)}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ opacity: 0.75 }}>ค่าจัดส่ง</span>
                <b>{order.shippingFee === 0 ? "ฟรี" : formatTHB(order.shippingFee || 0)}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ opacity: 0.75 }}>ยอดชำระทั้งหมด</span>
                <b>{formatTHB(order.total || 0)}</b>
              </div>
            </div>
          </aside>
        </div>

        <div style={{ marginTop: 18 }}>
          <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>ออเดอร์ล่าสุด</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {orders.slice(0, 6).map((o) => {
              const isActive = o.id === order.id;
              return (
                <a
                  key={o.id}
                  href={`/orders?highlight=${encodeURIComponent(o.id)}`}
                  style={{
                    textDecoration: "none",
                    borderRadius: 999,
                    padding: "8px 12px",
                    border: isActive ? "1px solid rgba(0,0,0,0.35)" : "1px solid rgba(0,0,0,0.12)",
                    background: isActive ? "rgba(0,0,0,0.03)" : "transparent",
                    fontWeight: 600,
                    opacity: isActive ? 1 : 0.85,
                  }}
                >
                  {o.id}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

