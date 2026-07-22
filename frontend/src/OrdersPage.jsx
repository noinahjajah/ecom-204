import React, { useEffect, useMemo, useState, useCallback } from "react";
import Header from "./Header";
import { getOrders, getSuperbetStatus } from "./cart";
import "./OrdersPage.css";

function formatTHB(n) {
  return (Number(n) || 0).toLocaleString("th-TH") + " บาท";
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
    return iso || "-";
  }
}

function getQueryParam(name) {
  const sp = new URLSearchParams(window.location.search);
  return sp.get(name);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(() => getOrders());
  const [trackingStatus, setTrackingStatus] = useState({});
  const [loadingTracking, setLoadingTracking] = useState({});

  useEffect(() => {
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

  // 🔄 ดึงสถานะ tracking จาก Superbet แบบ real-time
  const fetchTrackingStatus = useCallback(async (trackingNumber) => {
    if (!trackingNumber || trackingStatus[trackingNumber]) return;
    setLoadingTracking((prev) => ({ ...prev, [trackingNumber]: true }));
    try {
      const status = await getSuperbetStatus(trackingNumber);
      if (status) {
        setTrackingStatus((prev) => ({ ...prev, [trackingNumber]: status }));
      }
    } catch (err) {
      console.warn("Tracking fetch failed:", err);
    } finally {
      setLoadingTracking((prev) => ({ ...prev, [trackingNumber]: false }));
    }
  }, [trackingStatus]);

  useEffect(() => {
    if (order?.trackingNumber) {
      fetchTrackingStatus(order.trackingNumber);
    }
  }, [order?.trackingNumber, fetchTrackingStatus]);

  if (!order) {
    return (
      <div className="orders-page">
        <Header />
        <div className="orders-container">
          <div className="orders-empty">
            <p>ยังไม่มีคำสั่งซื้อในระบบ</p>
            <a className="orders-empty-cta" href="/">กลับไปเลือกสินค้า</a>
          </div>
        </div>
      </div>
    );
  }

  const currentTracking = order.trackingNumber ? trackingStatus[order.trackingNumber] : null;
  const isTrackingLoading = order.trackingNumber ? loadingTracking[order.trackingNumber] : false;

  return (
    <div className="orders-page">
      <Header />
      <div className="orders-container">
        <nav className="orders-breadcrumb">
          <a href="/">หน้าแรก</a>
          <span>/</span>
          <span>ติดตามคำสั่งซื้อ</span>
        </nav>

        <h1 className="orders-title">ติดตามคำสั่งซื้อ</h1>
        {highlightId && (
          <p className="orders-subtitle">
            แสดงผลออเดอร์ที่เพิ่งสั่ง: <b>{highlightId}</b>
          </p>
        )}

        <div className="orders-grid">
          <section>
            <div className="orders-card">
              <div className="orders-card-header">
                <div>
                  <div className="orders-card-label">Order ID</div>
                  <div className="orders-card-value orders-card-value-mono">{order.id}</div>
                  <div className="orders-card-label" style={{ marginTop: 4 }}>
                    สร้างเมื่อ {formatDateTH(order.createdAt)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="orders-card-label">สถานะ</div>
                  <div className={`orders-status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </div>
                </div>
              </div>

              {/* ── พัสดุ + Tracking ── */}
              <div className="orders-section">
                <h2 className="orders-section-title"> พัสดุ</h2>
                <div className="orders-shipping-grid">
                  <div>
                    <div className="orders-card-label">ขนส่ง</div>
                    <div className="orders-card-value">{order.carrier || "-"}</div>
                  </div>
                  <div>
                    <div className="orders-card-label">Tracking Number</div>
                    <div className="orders-card-value">{order.trackingNumber || "-"}</div>
                  </div>
                </div>

                {order.estimatedDelivery && (
                  <div className="orders-tracking-row">
                    <div className="orders-card-label">คาดว่าจะได้รับ</div>
                    <div className="orders-card-value">
                      {formatDateTH(order.estimatedDelivery)}
                    </div>
                  </div>
                )}

                {/* 🔄 สถานะ tracking สดจาก Superbet */}
                {order.trackingNumber && (
                  <div className="orders-tracking-live">
                    <h4>สถานะล่าสุด</h4>
                    {isTrackingLoading ? (
                      <p className="orders-tracking-loading">กำลังโหลดสถานะ...</p>
                    ) : currentTracking ? (
                      <div className="orders-tracking-status">
                        <div className={`orders-status-pill ${currentTracking.status}`}>
                          {currentTracking.status_th || currentTracking.status}
                        </div>
                        <p className="orders-tracking-location">
                          📍 {currentTracking.location || "กำลังจัดส่ง"}
                        </p>
                        <p className="orders-tracking-time">
                          อัปเดตล่าสุด: {currentTracking.updated_at ? formatDateTH(currentTracking.updated_at) : "-"}
                        </p>
                        {currentTracking.events?.length > 0 && (
                          <div className="orders-tracking-events">
                            {currentTracking.events.slice(0, 3).map((evt, i) => (
                              <div key={i} className="orders-tracking-event">
                                <span className="event-time">{formatDateTH(evt.timestamp)}</span>
                                <span className="event-desc">{evt.description}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="orders-tracking-fallback">
                        ไม่สามารถดึงสถานะได้ในขณะนี้
                        <a href={order.trackingUrl || `https://superbet.com/track?code=${order.trackingNumber}`} target="_blank" rel="noreferrer">
                          ติดตามที่เว็บไซต์ขนส่ง
                        </a>
                      </p>
                    )}
                  </div>
                )}

                {order.trackingUrl && (
                  <div style={{ marginTop: 14 }}>
                    <a
                      className="btn-primary"
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "inline-block" }}
                    >
                      ติดตามพัสดุ
                    </a>
                  </div>
                )}
              </div>

              {/* ── Timeline ── */}
              <div className="orders-section">
                <h2 className="orders-section-title">📋 Timeline</h2>
                <div className="orders-timeline">
                  {(order.statusHistory || []).map((h, idx) => (
                    <div
                      key={h.status + "-" + idx}
                      className={`orders-timeline-item ${h.status === order.status ? "is-current" : ""}`}
                    >
                      <div className="orders-timeline-head">
                        <span className="orders-timeline-status">{h.status}</span>
                        <span className="orders-timeline-time">{formatDateTH(h.at)}</span>
                      </div>
                      {h.note && <div className="orders-timeline-note">{h.note}</div>}
                      {h.trackingNumber && (
                        <div className="orders-timeline-meta">
                          {h.carrier || ""} - {h.trackingNumber}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!order.statusHistory || order.statusHistory.length === 0) && (
                    <p className="orders-timeline-empty">ไม่มีข้อมูล timeline</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ── Sidebar: รายการสินค้า ── */}
          <aside className="orders-sidebar">
            <h2 className="orders-section-title">รายการสินค้า</h2>
            <div className="orders-items">
              {order.items?.map((it) => (
                <div key={it.id + (it.variant || "")} className="orders-item">
                  <div className="orders-item-info">
                    <div className="orders-item-name">{it.name}</div>
                    <div className="orders-item-meta">{it.variant ? it.variant : it.category}</div>
                    <div className="orders-item-qty">จำนวน: {it.qty}</div>
                  </div>
                  <div className="orders-item-price">{formatTHB(it.price * it.qty)}</div>
                </div>
              ))}
            </div>
            <div className="orders-totals">
              <div className="orders-total-row">
                <span className="orders-total-label">ยอดรวมสินค้า</span>
                <span className="orders-total-value">{formatTHB(order.subtotal || 0)}</span>
              </div>
              {order.discount > 0 && (
                <div className="orders-total-row">
                  <span className="orders-total-label">ส่วนลด</span>
                  <span className="orders-total-value" style={{ color: "var(--gold)" }}>
                    -{formatTHB(order.discount)}
                  </span>
                </div>
              )}
              <div className="orders-total-row">
                <span className="orders-total-label">ค่าจัดส่ง</span>
                <span className="orders-total-value">
                  {order.shippingFee === 0 ? "ฟรี" : formatTHB(order.shippingFee || 0)}
                </span>
              </div>
              <div className="orders-total-row is-grand">
                <span className="orders-total-label">ยอดชำระทั้งหมด</span>
                <span className="orders-total-value">{formatTHB(order.total || 0)}</span>
              </div>
            </div>
          </aside>
        </div>

        {/* ── ประวัติคำสั่งซื้อ ── */}
        <div className="orders-history">
          <h2 className="orders-history-title">ประวัติคำสั่งซื้อ</h2>
          <div className="orders-history-list">
            {orders.length === 0 && (
              <p className="orders-history-empty">ยังไม่มีประวัติคำสั่งซื้อ</p>
            )}
            {orders.map((o) => {
              const isActive = o.id === order.id;
              const itemCount = (o.items || []).reduce((n, it) => n + (it.qty || 0), 0);
              return (
                <a
                  key={o.id}
                  href={"/orders.html?highlight=" + encodeURIComponent(o.id)}
                  className={`orders-history-item ${isActive ? "is-active" : ""}`}
                >
                  <div>
                    <div className="orders-history-id">{o.id}</div>
                    <div className="orders-history-meta">
                      {formatDateTH(o.createdAt)} - {itemCount} ชิ้n
                    </div>
                  </div>
                  <div className="orders-history-right">
                    <div className="orders-history-total">{formatTHB(o.total || 0)}</div>
                    <div className={`orders-history-status ${getStatusClass(o.status)}`}>
                      {o.status}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusClass(status) {
  switch (status) {
    case "รอดำเนินการ": return "is-pending";
    case "กำลังจัดส่ง": return "is-shipping";
    case "จัดส่งสำเร็จ": return "is-delivered";
    case "ยกเลิก": return "is-cancelled";
    default: return "is-pending";
  }
}
