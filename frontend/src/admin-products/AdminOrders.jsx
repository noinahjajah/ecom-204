// 📄 AdminOrders.jsx
// ─────────────────────────────────────────────────────────────
// 🔗 Connects to:
//    - ordersDataStore.js → listOrdersAdmin / updateOrderAdmin (backend
//      REST API, protected by requireAdmin — see orders_router.js)
//    - adminProducts.css  → shared .admin-* classes + order-specific
//      additions (.order-badge-*, .admin-modal-*, .order-detail-*)
// 🚦 Route: /admin/orders — lists every order from every customer with
//    the products they bought and their shipping address, so admin can
//    manage fulfillment status without digging through Supabase directly.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useMemo, useState } from "react";
import { listOrdersAdmin, updateOrderAdmin } from "./ordersDataStore";
import AdminHeader from "./AdminHeader";
import "./adminProducts.css";

const ORDER_STATUSES = ["รอดำเนินการ", "กำลังจัดส่ง", "จัดส่งสำเร็จ", "ยกเลิก"];

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

function statusBadgeClass(status) {
  switch (status) {
    case "รอดำเนินการ": return "order-badge-pending";
    case "กำลังจัดส่ง": return "order-badge-shipping";
    case "จัดส่งสำเร็จ": return "order-badge-delivered";
    case "ยกเลิก": return "order-badge-cancelled";
    default: return "order-badge-pending";
  }
}

function StatCard({ label, value }) {
  return (
    <div className="admin-stat-card admin-stat-card--static">
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value}</div>
    </div>
  );
}

function addressSummary(addr) {
  if (!addr) return "-";
  return [addr.district, addr.province].filter(Boolean).join(", ") || "-";
}

function OrderDetailModal({ order, onClose, onStatusChange, saving }) {
  if (!order) return null;
  const addr = order.shippingAddress || order.shipping_address || {};
  const items = order.items || [];

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <div className="admin-eyebrow">รายละเอียดคำสั่งซื้อ</div>
            <h2 className="admin-h2 admin-mono">{order.id}</h2>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="ปิด">✕</button>
        </div>

        <div className="order-detail-row">
          <span className="admin-field-label">สถานะ</span>
          <div className="order-detail-status-row">
            <span className={"admin-badge " + statusBadgeClass(order.status)}>{order.status}</span>
            <select
              className="admin-select"
              style={{ width: "auto" }}
              value={order.status}
              disabled={saving}
              onChange={(e) => onStatusChange(order, e.target.value)}
            >
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="order-detail-grid">
          <div>
            <div className="admin-field-label">สร้างเมื่อ</div>
            <div>{formatDateTH(order.createdAt || order.created_at)}</div>
          </div>
          <div>
            <div className="admin-field-label">การชำระเงิน</div>
            <div>{order.paymentMethod || order.payment_method || "-"}</div>
          </div>
          <div>
            <div className="admin-field-label">ขนส่ง</div>
            <div>{order.carrier || "-"}</div>
          </div>
          <div>
            <div className="admin-field-label">เลข Tracking</div>
            <div>{order.trackingNumber || order.tracking_number || "-"}</div>
          </div>
        </div>

        <div className="order-detail-section">
          <h3 className="admin-field-label order-detail-heading">ลูกค้า &amp; ที่อยู่จัดส่ง</h3>
          <div className="order-address-card">
            <div className="order-address-name">{addr.fullName || order.customerName || order.customer_name || "-"}</div>
            <div>{addr.phone || "-"} {addr.email || order.customerEmail || order.customer_email ? `· ${addr.email || order.customerEmail || order.customer_email}` : ""}</div>
            <div className="order-address-lines">
              {addr.address || "-"}<br />
              {[addr.district, addr.province, addr.postcode].filter(Boolean).join(" ")}
            </div>
            {addr.note && <div className="order-address-note">หมายเหตุ: {addr.note}</div>}
          </div>
        </div>

        <div className="order-detail-section">
          <h3 className="admin-field-label order-detail-heading">สินค้าที่สั่งซื้อ ({items.length} รายการ)</h3>
          <div className="order-items-list">
            {items.map((it, idx) => (
              <div key={(it.id || idx) + (it.variant || "")} className="order-item-row">
                <img src={it.image || "https://placehold.co/48x48"} alt={it.name} className="admin-cell-thumb" />
                <div className="order-item-info">
                  <div className="admin-cell-title">{it.name}</div>
                  <div className="admin-cell-subtitle">{it.variant || it.category || ""} · จำนวน {it.qty}</div>
                </div>
                <div className="order-item-price">{formatTHB((it.price || 0) * (it.qty || 0))}</div>
              </div>
            ))}
            {items.length === 0 && <div className="admin-table-empty">ไม่มีรายการสินค้า</div>}
          </div>

          <div className="order-totals">
            <div className="order-totals-row">
              <span>ยอดรวมสินค้า</span><span>{formatTHB(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="order-totals-row">
                <span>ส่วนลด</span><span>-{formatTHB(order.discount)}</span>
              </div>
            )}
            <div className="order-totals-row">
              <span>ค่าจัดส่ง</span><span>{order.shippingFee || order.shipping_fee ? formatTHB(order.shippingFee || order.shipping_fee) : "ฟรี"}</span>
            </div>
            <div className="order-totals-row is-grand">
              <span>ยอดชำระทั้งหมด</span><span>{formatTHB(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [detailOrder, setDetailOrder] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      const data = await listOrdersAdmin();
      setOrders(data);
      setError("");
    } catch (err) {
      console.error("โหลดรายการคำสั่งซื้อไม่สำเร็จ", err);
      setError(err?.message || "โหลดรายการคำสั่งซื้อไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "All" && o.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [o.id, o.customerName || o.customer_name, o.customerEmail || o.customer_email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "รอดำเนินการ").length;
    const shipping = orders.filter((o) => o.status === "กำลังจัดส่ง").length;
    const delivered = orders.filter((o) => o.status === "จัดส่งสำเร็จ").length;
    const revenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    return { total, pending, shipping, delivered, revenue };
  }, [orders]);

  const handleStatusChange = async (order, newStatus) => {
    if (newStatus === order.status) return;
    setSavingId(order.id);
    try {
      const nextHistory = [
        ...(order.statusHistory || order.status_history || []),
        { status: newStatus, at: new Date().toISOString(), note: "อัปเดตโดยแอดมิน" },
      ];
      await updateOrderAdmin(order.id, { status: newStatus, statusHistory: nextHistory });
      await refresh();
      setDetailOrder((prev) => (prev && prev.id === order.id ? { ...prev, status: newStatus, statusHistory: nextHistory } : prev));
    } catch (err) {
      alert(err?.message || "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="admin-wrap">
      <AdminHeader />
      <div className="admin-page">
        <div className="admin-header-row">
          <div>
            <div className="admin-eyebrow">Admin • Order Management</div>
            <h1 className="admin-h1">คำสั่งซื้อทั้งหมด</h1>
          </div>
        </div>

        <div className="admin-stat-grid">
          <StatCard label="คำสั่งซื้อทั้งหมด" value={stats.total.toLocaleString("th-TH")} />
          <StatCard label="รอดำเนินการ" value={stats.pending.toLocaleString("th-TH")} />
          <StatCard label="กำลังจัดส่ง" value={stats.shipping.toLocaleString("th-TH")} />
          <StatCard label="ยอดขายรวม" value={formatTHB(stats.revenue)} />
        </div>

        <div className="admin-panel">
          <div className="admin-filter-grid">
            <div>
              <div className="admin-field-label">ค้นหา</div>
              <input
                className="admin-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Order ID / ชื่อลูกค้า / อีเมล"
              />
            </div>
            <div>
              <div className="admin-field-label">สถานะ</div>
              <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">ทั้งหมด</option>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="admin-panel" style={{ marginTop: 14 }}>
          {error && <div className="order-address-note" style={{ marginBottom: 12 }}>{error}</div>}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>วันที่สั่งซื้อ</th>
                  <th>ลูกค้า</th>
                  <th>ที่อยู่จัดส่ง</th>
                  <th>สินค้า</th>
                  <th>ยอดรวม</th>
                  <th>สถานะ</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const addr = o.shippingAddress || o.shipping_address || {};
                  const itemCount = (o.items || []).reduce((n, it) => n + (Number(it.qty) || 0), 0);
                  return (
                    <tr key={o.id}>
                      <td className="admin-mono">{o.id}</td>
                      <td style={{ fontSize: 12, opacity: 0.75 }}>{formatDateTH(o.createdAt || o.created_at)}</td>
                      <td>
                        <div className="admin-cell-title">{o.customerName || o.customer_name || "-"}</div>
                        <div className="admin-cell-subtitle">{o.customerEmail || o.customer_email || ""}</div>
                      </td>
                      <td>{addressSummary(addr)}</td>
                      <td>{itemCount} ชิ้น</td>
                      <td>{formatTHB(o.total)}</td>
                      <td>
                        <select
                          className="admin-select"
                          style={{ width: "auto", fontSize: 12 }}
                          value={o.status}
                          disabled={savingId === o.id}
                          onChange={(e) => handleStatusChange(o, e.target.value)}
                        >
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <button type="button" className="admin-mini-btn admin-mini-btn-strong" onClick={() => setDetailOrder(o)}>
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="admin-table-empty">ไม่พบคำสั่งซื้อตามตัวกรองนี้</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={8} className="admin-table-empty">กำลังโหลด...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <OrderDetailModal
        order={detailOrder}
        onClose={() => setDetailOrder(null)}
        onStatusChange={handleStatusChange}
        saving={detailOrder ? savingId === detailOrder.id : false}
      />
    </div>
  );
}
