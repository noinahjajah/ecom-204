import React, { useEffect, useState, useMemo, useCallback } from "react";
import Header from "./Header";
import { supabase } from "./supabaseClient";
import { getCart, addToCart, getOrders, getSuperbetStatus } from "./cart";
import { listProducts } from "./admin-products/productsDataStore";
import "./OrdersPage.css";

/* ═══════════════════════════════════════
   OrdersPage — การซื้อของฉัน (ใช้งานได้จริง)
   ═══════════════════════════════════════ */

const ORDER_STATUS_MAP = {
  "รอดำเนินการ": { key: "pending", label: "ที่ต้องชำระ", color: "#e89c38", step: 1 },
  "กำลังจัดส่ง": { key: "shipping", label: "ที่ต้องจัดส่ง", color: "#4a90d9", step: 2 },
  "จัดส่งสำเร็จ": { key: "delivered", label: "ที่ต้องได้รับ", color: "#5f7a5e", step: 3 },
  "สำเร็จ": { key: "completed", label: "สำเร็จ", color: "#ad8a55", step: 4 },
  "ยกเลิก": { key: "cancelled", label: "ยกเลิก", color: "#b23a48", step: 0 },
};

const STATUS_TABS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "ที่ต้องชำระ" },
  { key: "shipping", label: "ที่ต้องจัดส่ง" },
  { key: "delivered", label: "ที่ต้องได้รับ" },
  { key: "completed", label: "สำเร็จ" },
  { key: "cancelled", label: "ยกเลิก" },
];

function formatTHB(n) {
  return (Number(n) || 0).toLocaleString("th-TH") + " บาท";
}

function formatDateTH(iso) {
  try {
    return new Date(iso).toLocaleString("th-TH", {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso || "-"; }
}

function formatDateShort(iso) {
  try {
    return new Date(iso).toLocaleDateString("th-TH", {
      year: "numeric", month: "short", day: "2-digit",
    });
  } catch { return iso || "-"; }
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function getStatusClass(status) {
  switch (status) {
    case "รอดำเนินการ": return "is-pending";
    case "กำลังจัดส่ง": return "is-shipping";
    case "จัดส่งสำเร็จ": return "is-delivered";
    case "สำเร็จ": return "is-success";
    case "ยกเลิก": return "is-cancelled";
    default: return "is-pending";
  }
}

/* ─── StarRating Component ─── */
function StarRating({ orderId, itemId, onRate }) {
  const storageKey = `mv_rating_${orderId}_${itemId}`;
  const [rating, setRating] = useState(() => {
    try { return Number(window.localStorage.getItem(storageKey)) || 0; } catch { return 0; }
  });
  const [hover, setHover] = useState(0);

  const handleRate = (star) => {
    window.localStorage.setItem(storageKey, String(star));
    setRating(star);
    onRate?.(orderId, itemId, star);
  };

  return (
    <div className="op-rating-stars" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`op-star ${star <= (hover || rating) ? "filled" : ""}`}
          onMouseEnter={() => setHover(star)}
          onClick={() => handleRate(star)}
          aria-label={`ให้คะแนน ${star} ดาว`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={star <= (hover || rating) ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
      {rating > 0 && <span className="op-rating-label">{rating}/5</span>}
    </div>
  );
}

/* ─── CoinsPromo Component ─── */
function CoinsPromo({ orderId, status }) {
  const storageKey = `mv_coins_${orderId}`;
  const [claimed, setClaimed] = useState(() => {
    try { return window.localStorage.getItem(storageKey) === "claimed"; } catch { return false; }
  });
  const [showClaimed, setShowClaimed] = useState(false);

  const isDelivered = status === "จัดส่งสำเร็จ" || status === "สำเร็จ";
  if (!isDelivered) return null;

  const handleClaim = () => {
    window.localStorage.setItem(storageKey, "claimed");
    setClaimed(true);
    setShowClaimed(true);
    setTimeout(() => setShowClaimed(false), 2000);
  };

  return (
    <div className="op-coins-promo">
      <div className="op-coins-icon"></div>
      <div className="op-coins-text">
        {showClaimed ? (
          <span className="op-coins-success">✓ ได้รับ Coins แล้ว!</span>
        ) : claimed ? (
          <span>ได้รับ Coins แล้ว</span>
        ) : (
          <>
            ให้คะแนนภายใน <b>8 ส.ค.</b> รับ <span className="op-coins-amount">3 Coins</span>
          </>
        )}
      </div>
      {!claimed && (
        <button className="op-coins-claim" onClick={handleClaim}>
          รับเลย
        </button>
      )}
    </div>
  );
}

/* ─── BuyAgainPromo Component ─── */
function BuyAgainPromo({ onBuyAll }) {
  return (
    <div className="op-buyagain-promo">
      <div className="op-buyagain-promo-tag"></div>
      <div className="op-buyagain-promo-text">
        <span className="op-buyagain-promo-title">ซื้ออีกครั้ง ประหยัดเพิ่ม 12%</span>
        <span className="op-buyagain-promo-sub">สำหรับสินค้าในคำสั่งซื้อนี้</span>
      </div>
      <button className="op-buyagain-promo-btn" onClick={onBuyAll}>
        ดูทั้งหมด ›
      </button>
    </div>
  );
}

/* ─── OrderItem Component ─── */
function OrderItem({ item, orderId, canRate, onRate }) {
  return (
    <div className="op-item-row">
      <div className="op-item-thumb">
        {item.image ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <span className="op-item-fallback">
            {item.category === "เมคอัพ" ? "MU" : "SK"}
          </span>
        )}
      </div>
      <div className="op-item-info">
        <div className="op-item-name">{item.name}</div>
        <div className="op-item-variant">{item.variant || ""}</div>
        <div className="op-item-qty">x{item.qty}</div>
      </div>
      <div className="op-item-price-section">
        {item.oldPrice && (
          <span className="op-item-old-price">
            ฿{Number(item.oldPrice).toLocaleString("th-TH")}
          </span>
        )}
        <span className="op-item-price">
          ฿{Number(item.price * item.qty).toLocaleString("th-TH")}
        </span>
      </div>
      {canRate && (
        <div className="op-item-rating">
          <StarRating orderId={orderId} itemId={item.id} onRate={onRate} />
        </div>
      )}
    </div>
  );
}

/* ─── TrackingPanel Component ─── */
function TrackingPanel({ order, trackingStatus, isLoading }) {
  if (!order.trackingNumber) return null;

  return (
    <div className="orders-tracking-live">
      <h4>📦 สถานะพัสดุล่าสุด</h4>
      {isLoading ? (
        <p className="orders-tracking-loading">กำลังโหลดสถานะ...</p>
      ) : trackingStatus ? (
        <div className="orders-tracking-status">
          <div className={`orders-status-pill ${trackingStatus.status}`}>
            {trackingStatus.status_th || trackingStatus.status}
          </div>
          <p className="orders-tracking-location">
            📍 {trackingStatus.location || "กำลังจัดส่ง"}
          </p>
          <p className="orders-tracking-time">
            อัปเดตล่าสุด: {trackingStatus.updated_at ? formatDateTH(trackingStatus.updated_at) : "-"}
          </p>
          {trackingStatus.events?.length > 0 && (
            <div className="orders-tracking-events">
              {trackingStatus.events.slice(0, 3).map((evt, i) => (
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
  );
}

/* ─── Timeline Component ─── */
function Timeline({ history, currentStatus }) {
  if (!history || history.length === 0) {
    return <p className="orders-timeline-empty">ไม่มีข้อมูล timeline</p>;
  }

  return (
    <div className="orders-timeline">
      {history.map((h, idx) => (
        <div
          key={h.status + "-" + idx}
          className={`orders-timeline-item ${h.status === currentStatus ? "is-current" : ""}`}
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
    </div>
  );
}

/* ─── OrderCard Component ─── */
function OrderCard({ order, isActive, products, onBuyAgain, onRate, showToast }) {
  const itemCount = (order.items || []).reduce((n, it) => n + (it.qty || 0), 0);
  const canRate = order.status === "จัดส่งสำเร็จ" || order.status === "สำเร็จ";
  const isDelivered = canRate;
  const isCancelled = order.status === "ยกเลิก";
  const isPending = order.status === "รอดำเนินการ";
  const isShipping = order.status === "กำลังจัดส่ง";

  const handleBuyAll = () => {
    (order.items || []).forEach((it) => {
      const product = products.find((p) => p.id === it.id) ||
                      products.find((p) => p.name === it.name);
      if (product) {
        addToCart({ ...product, variant: it.variant || "" });
      } else {
        addToCart({
          id: it.id, name: it.name, category: it.category || "",
          variant: it.variant || "", price: it.price, image: it.image || null,
        });
      }
    });
    showToast(`เพิ่มสินค้าทั้งหมดจากออเดอร์ ${order.id} ลงตะกร้าแล้ว`);
  };

  const handleCancel = () => {
    const allOrders = getOrders();
    const idx = allOrders.findIndex((o) => o.id === order.id);
    if (idx === -1) return;
    allOrders[idx] = {
      ...allOrders[idx],
      status: "ยกเลิก",
      cancelledAt: new Date().toISOString(),
      cancelReason: "ยกเลิกโดยผู้ใช้",
    };
    localStorage.setItem("mv_orders", JSON.stringify(allOrders));
    showToast("ยกเลิกคำสั่งซื้อสำเร็จ");
    window.dispatchEvent(new StorageEvent("storage", { key: "mv_orders" }));
  };

  const handleConfirmReceived = () => {
    const allOrders = getOrders();
    const idx = allOrders.findIndex((o) => o.id === order.id);
    if (idx === -1) return;
    allOrders[idx] = {
      ...allOrders[idx],
      status: "สำเร็จ",
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem("mv_orders", JSON.stringify(allOrders));
    showToast("ยืนยันการรับสินค้าสำเร็จ");
    window.dispatchEvent(new StorageEvent("storage", { key: "mv_orders" }));
  };

  const handlePayNow = () => {
    localStorage.setItem("mv_pending_payment_order", JSON.stringify(order));
    window.location.href = "/checkout";
  };

  return (
    <div className={`op-order-card ${isActive ? "is-highlight" : ""}`}>
      {/* Header */}
      <div className="op-order-header">
        <div className="op-order-shop">
          <span className="op-shop-icon"></span>
          <span className="op-shop-name">{order.shopName || "MAISON Véra"}</span>
          <span className={`op-status-badge ${getStatusClass(order.status)}`}>
            {order.status}
          </span>
        </div>
        <div className="op-order-meta">
          <span className="op-order-id">{order.id}</span>
          <span className="op-order-date">{formatDateShort(order.createdAt)}</span>
        </div>
      </div>

      {/* Coins */}
      <CoinsPromo orderId={order.id} status={order.status} />

      {/* Items */}
      <div className="op-order-items">
        {(order.items || []).map((it) => (
          <OrderItem
            key={it.id + (it.variant || "")}
            item={it}
            orderId={order.id}
            canRate={canRate}
            onRate={onRate}
          />
        ))}
      </div>

      {/* Buy Again Promo */}
      {isDelivered && <BuyAgainPromo onBuyAll={handleBuyAll} />}

      {/* Footer */}
      <div className="op-order-footer">
        <div className="op-order-total">
          <span>สินค้ารวม {itemCount} รายการ:</span>
          <span className="op-total-amount">{formatTHB(order.total || 0)}</span>
        </div>

        <div className="op-order-actions">
          <a
            href={`/orders.html?highlight=${encodeURIComponent(order.id)}`}
            className="op-btn-detail"
          >
            ดูรายละเอียด
          </a>

          {isPending && (
            <button className="op-btn-primary" onClick={handlePayNow}>
              ชำระเงิน
            </button>
          )}

          {isShipping && (
            <button className="op-btn-primary" onClick={handleConfirmReceived}>
              ยืนยันการรับสินค้า
            </button>
          )}

          {canRate && (
            <button className="op-btn-rate" onClick={() => showToast(`ไปที่หน้าให้คะแนน ${order.id}`)}>
              ให้คะแนน
            </button>
          )}

          {!isCancelled && (
            <button className="op-btn-buyagain" onClick={handleBuyAll}>
              ซื้ออีกครั้ง
            </button>
          )}

          {isCancelled && (
            <button className="op-btn-buyagain" onClick={handleBuyAll}>
              สั่งซื้ออีกครั้ง
            </button>
          )}

          {isPending && (
            <button className="op-btn-danger" onClick={handleCancel}>
              ยกเลิกคำสั่งซื้อ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════ */
export default function OrdersPage() {
  const [orders, setOrders] = useState(() => getOrders());
  const [trackingStatus, setTrackingStatus] = useState({});
  const [loadingTracking, setLoadingTracking] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [toast, setToast] = useState("");
  const [products] = useState(() => listProducts());
  const [user, setUser] = useState(null);

  /* Auth check */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.localStorage.setItem("mv_redirect_after_login", "/orders");
        window.location.href = "/login";
        return;
      }
      setUser(data.session.user);
    });
  }, []);

  /* Listen to localStorage changes */
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

  /* Load tracking status */
  const fetchTrackingStatus = useCallback(async (trackingNumber) => {
    if (!trackingNumber || trackingStatus[trackingNumber]) return;
    setLoadingTracking((prev) => ({ ...prev, [trackingNumber]: true }));
    try {
      const status = await getSuperbetStatus(trackingNumber);
      if (status) setTrackingStatus((prev) => ({ ...prev, [trackingNumber]: status }));
    } catch (err) { console.warn(err); }
    finally { setLoadingTracking((prev) => ({ ...prev, [trackingNumber]: false })); }
  }, [trackingStatus]);

  useEffect(() => {
    if (order?.trackingNumber) fetchTrackingStatus(order.trackingNumber);
  }, [order?.trackingNumber, fetchTrackingStatus]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const handleBuyAgain = (item) => {
    const product = products.find((p) => p.id === item.id) ||
                    products.find((p) => p.name === item.name);
    if (product) {
      addToCart({ ...product, variant: item.variant || "" });
      showToast(`เพิ่ม "${item.name}" ลงตะกร้าแล้ว`);
    } else {
      addToCart({
        id: item.id, name: item.name, category: item.category || "",
        variant: item.variant || "", price: item.price, image: item.image || null,
      });
      showToast(`เพิ่ม "${item.name}" ลงตะกร้าแล้ว`);
    }
  };

  const handleRate = (orderId, itemId, rating) => {
    showToast(`ให้คะแนน ${rating} ดาว สำหรับสินค้าในออเดอร์ ${orderId}`);
  };

  /* Categories */
  const allCategories = useMemo(() => {
    const cats = new Set();
    orders.forEach((o) => {
      (o.items || []).forEach((it) => cats.add(it.category || "อื่นๆ"));
    });
    return Array.from(cats);
  }, [orders]);

  /* Filter by status tab */
  const statusFilteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((o) => {
      switch (activeTab) {
        case "pending": return o.status === "รอดำเนินการ";
        case "shipping": return o.status === "กำลังจัดส่ง";
        case "delivered": return o.status === "จัดส่งสำเร็จ";
        case "completed": return o.status === "สำเร็จ";
        case "cancelled": return o.status === "ยกเลิก";
        default: return true;
      }
    });
  }, [orders, activeTab]);

  /* Filter by category */
  const filteredOrders = useMemo(() => {
    if (activeCategory === "all") return statusFilteredOrders;
    return statusFilteredOrders.filter((o) =>
      (o.items || []).some((it) => (it.category || "อื่นๆ") === activeCategory)
    );
  }, [statusFilteredOrders, activeCategory]);

  /* Tab counts */
  const tabCounts = useMemo(() => {
    const counts = { all: orders.length };
    counts.pending = orders.filter((o) => o.status === "รอดำเนินการ").length;
    counts.shipping = orders.filter((o) => o.status === "กำลังจัดส่ง").length;
    counts.delivered = orders.filter((o) => o.status === "จัดส่งสำเร็จ").length;
    counts.completed = orders.filter((o) => o.status === "สำเร็จ").length;
    counts.cancelled = orders.filter((o) => o.status === "ยกเลิก").length;
    return counts;
  }, [orders]);

  if (!user) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <div className="orders-spinner" />
          <p>กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="orders-page">
        <Header />
        <div className="orders-container">
          <div className="orders-empty">
            <div className="orders-empty-icon"></div>
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
        {/* Toast */}
        {toast && (
          <div className="op-toast">
            <span>✓</span> {toast}
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="orders-breadcrumb">
          <a href="/">หน้าแรก</a>
          <span>/</span>
          <span>การซื้อของฉัน</span>
        </nav>

        <h1 className="orders-title">การซื้อของฉัน</h1>
        {highlightId && (
          <p className="orders-subtitle">
            แสดงผลออเดอร์ที่เพิ่งสั่ง: <b>{highlightId}</b>
          </p>
        )}

        {/* Status Tabs */}
        <div className="op-tabs">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              className={`op-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              {tabCounts[t.key] > 0 && (
                <span className="op-tab-badge">{tabCounts[t.key]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        {allCategories.length > 0 && (
          <div className="op-category-tabs">
            <button
              className={`op-cat-tab ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              ทั้งหมด
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                className={`op-cat-tab ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Orders List */}
        <div className="op-orders-list">
          {filteredOrders.length === 0 && (
            <div className="op-empty-tab">
              <p>ไม่มีคำสั่งซื้อในหมวดนี้</p>
            </div>
          )}

          {filteredOrders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              isActive={o.id === order.id}
              products={products}
              onBuyAgain={handleBuyAgain}
              onRate={handleRate}
              showToast={showToast}
            />
          ))}
        </div>

        {/* Order Detail Panel */}
        {order && (
          <div className="orders-grid" style={{ marginTop: 40 }}>
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

                {/* Shipping */}
                <div className="orders-section">
                  <h2 className="orders-section-title">📦 พัสดุ</h2>
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

                  <TrackingPanel 
                    order={order} 
                    trackingStatus={currentTracking} 
                    isLoading={isTrackingLoading} 
                  />

                  {order.trackingUrl && (
                    <div style={{ marginTop: 14 }}>
                      <a className="btn-primary" href={order.trackingUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block" }}>
                        ติดตามพัสดุ
                      </a>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="orders-section">
                  <h2 className="orders-section-title">📋 Timeline</h2>
                  <Timeline 
                    history={order.statusHistory} 
                    currentStatus={order.status} 
                  />
                </div>
              </div>
            </section>

            {/* Sidebar */}
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
                    <span className="orders-total-value" style={{ color: "#ee4d2d" }}>
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
        )}
      </div>
    </div>
  );
}