import React, { useEffect, useMemo, useState } from "react";
import { getOrders, updateOrder } from "../utils/store";
import { f, fd } from "../utils/helpers";
import { SHIPPING_OPTIONS } from "../utils/constants";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";

/** Helper: safely get shipping status string from order */
function getShipStatus(o) {
  const s = o?.shipping;
  if (typeof s === "string") return s || "รอดำเนินการ";
  return "รอดำเนินการ";
}

/** Badge component – safe for string labels only */
function Badge({ label, className }) {
  return <span className={className || "badge"}>{String(label ?? "-")}</span>;
}

/** Create a status history entry */
function createStatusHistory(order, fields) {
  const now = new Date().toISOString();
  const history = Array.isArray(order?.statusHistory) ? [...order.statusHistory] : [];
  const merged = { ...order, ...fields };
  const entry = { status: merged.status || order?.status, at: now, who: "Admin" };
  if (merged.trackingNumber) entry.trackingNumber = merged.trackingNumber;
  if (merged.carrier) entry.carrier = merged.carrier;
  return { ...merged, statusHistory: [entry, ...history] };
}

function generateReceiptHTML(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const rows = items.map((it) =>
    `<tr><td>${it.name || "-"}${it.variant ? ` (${it.variant})` : ""}</td><td style="text-align:right">${it.qty || 0}</td><td style="text-align:right">${Number(it.price || 0).toLocaleString()}</td><td style="text-align:right">${(Number(it.qty || 0) * Number(it.price || 0)).toLocaleString()}</td></tr>`
  ).join("");
  const sub = Number(order?.subtotal || 0);
  const ship = Number(order?.shippingFee || 0);
  return `<html><meta charset="utf-8"/><title>Receipt ${order?.id || "-"}</title><style>body{font-family:Arial;padding:24px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border-bottom:1px solid #eee;padding:10px 6px;text-align:left}</style></head><body><h1>ใบเสร็จ</h1><div>${order?.id || "-"} | ${fd(order?.createdAt)}</div><table><thead><tr><th>รายการ</th><th style="text-align:right">จำนวน</th><th style="text-align:right">ราคา</th><th style="text-align:right">รวม</th></tr></thead><tbody>${rows}</tbody></table><div style="margin-top:12px;font-weight:700">รวม: ${(sub + ship).toLocaleString()} บาท</div></body></html>`;
}

function printReceipt(html) {
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

/* ─── Payment badge helper ─── */
function getPayBadge(status) {
  if (status === "paid" || status === "ชำระแล้ว") return { label: "ชำระแล้ว", css: "badge badge-paid" };
  if (status === "ยกเลิก" || status === "cancelled") return { label: "ยกเลิก", css: "badge badge-cancelled" };
  return { label: "รอชำระเงิน", css: "badge badge-pending-pay" };
}

function getShipBadge(ship) {
  const map = {
    "รอดำเนินการ": "badge badge-idle",
    "กำลังเตรียมพัสดุ": "badge badge-preparing",
    "กำลังจัดส่ง": "badge badge-shipping",
    "จัดส่งสำเร็จ": "badge badge-delivered",
    "ยกเลิก": "badge badge-cancelled",
  };
  return { label: ship, css: map[ship] || "badge" };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [shippingFilter, setShippingFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [working, setWorking] = useState(false);

  const loadOrders = () => {
    try {
      const data = getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("OrdersPage: load error", e);
      setOrders([]);
    }
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener("storage", loadOrders);
    return () => window.removeEventListener("storage", loadOrders);
  }, []);

  const filtered = useMemo(() => {
    try {
      let list = orders.length > 0 ? [...orders] : [];
      const query = (searchQuery || "").toLowerCase().trim();
      if (query) {
        list = list.filter((o) => {
          const fields = [o?.id, o?.customer?.fullName, o?.customer?.name, o?.shipping?.fullName, o?.shipping?.phone, o?.trackingNumber];
          return fields.filter(Boolean).map(String).join(" ").toLowerCase().includes(query);
        });
      }
      if (statusFilter !== "All") {
        list = list.filter((o) => {
          const s = o?.status;
          if (statusFilter === "paid") return s === "paid" || s === "ชำระแล้ว";
          if (statusFilter === "cancelled") return s === "ยกเลิก" || s === "cancelled";
          return s === statusFilter;
        });
      }
      if (shippingFilter !== "All") {
        list = list.filter((o) => getShipStatus(o) === shippingFilter);
      }
      list.sort((a, b) => new Date(b?.createdAt || b?.date || 0) - new Date(a?.createdAt || a?.date || 0));
      return list;
    } catch (e) {
      console.error("OrdersPage: filter error", e);
      return [];
    }
  }, [orders, searchQuery, statusFilter, shippingFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paged = filtered.slice(startIndex, startIndex + pageSize);

  const kpis = useMemo(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const revenue = orders.filter((o) =>
        String(o?.createdAt || o?.date || "").slice(0, 10) === today &&
        (o?.status === "paid" || o?.status === "ชำระแล้ว")
      ).reduce((s, o) => s + Number(o?.total || 0), 0);
      return {
        revenue: f(revenue),
        total: orders.length,
        pendingShip: orders.filter((o) => ["รอดำเนินการ", "กำลังเตรียมพัสดุ", "กำลังจัดส่ง"].includes(getShipStatus(o))).length,
        totalRevenue: f(orders.reduce((s, o) => s + Number(o?.total || 0), 0)),
      };
    } catch (e) {
      return { revenue: "0 บาท", total: 0, pendingShip: 0, totalRevenue: "0 บาท" };
    }
  }, [orders]);

  return (
    <div>
      <div className="admin-section-label">📦 จัดการออเดอร์</div>
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-accent gold" />
          <div className="admin-kpi-label">ยอดขายวันนี้</div>
          <div className="admin-kpi-value">{String(kpis.revenue).replace(" บาท", "")}</div>
          <div className="admin-kpi-note">บาท</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-accent blue" />
          <div className="admin-kpi-label">ออเดอร์ทั้งหมด</div>
          <div className="admin-kpi-value">{kpis.total}</div>
          <div className="admin-kpi-note">รายการ</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-accent warm" />
          <div className="admin-kpi-label">รอจัดส่ง</div>
          <div className="admin-kpi-value">{kpis.pendingShip}</div>
          <div className="admin-kpi-note">รายการ</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-accent green" />
          <div className="admin-kpi-label">ยอดรวม</div>
          <div className="admin-kpi-value">{String(kpis.totalRevenue).replace(" บาท", "")}</div>
          <div className="admin-kpi-note">บาท</div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title">รายการออเดอร์</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="admin-btn admin-btn-gold" onClick={() => { setSearchQuery(""); setStatusFilter("paid"); setShippingFilter("All"); setPage(1); }}>ชำระแล้ว</button>
            <button className="admin-btn" onClick={() => { setStatusFilter("All"); setShippingFilter("รอดำเนินการ"); setPage(1); }}>รอจัดส่ง</button>
            <button className="admin-btn" onClick={loadOrders}>🔄</button>
          </div>
        </div>
        <div className="admin-filter-bar">
          <div style={{ flex: 1, minWidth: 180 }}>
            <div className="admin-field-label">ค้นหา</div>
            <input className="admin-input" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} placeholder="ออเดอร์ ID / ชื่อ / เบอร์" />
          </div>
          <div>
            <div className="admin-field-label">ชำระเงิน</div>
            <select className="admin-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="All">ทั้งหมด</option><option value="paid">ชำระแล้ว</option><option value="cancelled">ยกเลิก</option>
            </select>
          </div>
          <div>
            <div className="admin-field-label">จัดส่ง</div>
            <select className="admin-select" value={shippingFilter} onChange={(e) => { setShippingFilter(e.target.value); setPage(1); }}>
              <option value="All">ทั้งหมด</option>
              {SHIPPING_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <div className="admin-field-label">แสดง</div>
            <select className="admin-select" value={String(pageSize)} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {[6, 8, 10, 15].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button className="admin-btn" onClick={() => { setSearchQuery(""); setStatusFilter("All"); setShippingFilter("All"); setPage(1); }}>รีเซ็ต</button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Order ID</th><th>ผู้รับ</th><th>สินค้า</th><th>ยอดรวม</th><th>ชำระเงิน</th><th>จัดส่ง</th><th>วันที่</th><th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={8} style={{ padding: 20, textAlign: "center", opacity: 0.7 }}>ไม่พบออเดอร์</td></tr>
              )}
              {paged.map((o) => {
                const shipStatus = getShipStatus(o);
                const pay = getPayBadge(o?.status);
                const shipB = getShipBadge(shipStatus);
                const items = Array.isArray(o?.items) ? o.items : [];
                const customerName = o?.shipping?.fullName || o?.customer?.fullName || o?.shipping?.name || o?.customer?.name || "-";
                const customerPhone = o?.shipping?.phone || o?.customer?.phone || "";
                return (
                  <tr key={o.id}>
                    <td>
                      <button onClick={() => { setSelected(o); setShowDetail(true); }}
                        style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", fontWeight: 700, color: "#221f1c", textDecoration: "underline" }}>
                        {String(o.id)}
                      </button>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{String(customerName)}</span>
                      {customerPhone ? <div style={{ fontSize: 12, opacity: 0.65 }}>{String(customerPhone)}</div> : null}
                    </td>
                    <td>
                      <span style={{ color: "rgba(92,85,73,0.7)", fontSize: "0.83rem" }}>{items[0]?.name ? String(items[0].name) : "-"}</span>
                      <div style={{ fontSize: 12, opacity: 0.65 }}>{items.length} รายการ</div>
                    </td>
                    <td><span style={{ fontWeight: 600 }}>{f(o.total)}</span></td>
                    <td><Badge label={pay.label} className={pay.css} /></td>
                    <td><Badge label={shipB.label} className={shipB.css} /></td>
                    <td><span style={{ color: "rgba(92,85,73,0.6)", fontSize: "0.8rem" }}>{fd(o.createdAt || o.date)}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="admin-mini-btn" onClick={() => { setSelected(o); setShowEdit(true); }}>แก้ไข</button>
                        <button className="admin-mini-btn" onClick={() => { setSelected(o); setShowPrint(true); }}>พิมพ์</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="admin-pagination-row">
          <div className="admin-pagination-info">
            แสดง {total === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, total)} จาก {total}
          </div>
          <Pagination page={currentPage} totalPages={totalPages} setPage={setPage} />
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={showDetail} title={selected ? "รายละเอียด " + String(selected.id) : "รายละเอียด"} onClose={() => setShowDetail(false)} width={980}>
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <div>
                <div className="admin-field-label">Order ID</div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{String(selected.id)}</div>
                <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>{fd(selected.createdAt)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="admin-field-label">ยอดรวม</div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{f(selected.total)}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ border: "1px solid rgba(229,221,208,0.9)", borderRadius: 12, padding: 12 }}>
                <div className="admin-field-label">📍 ที่อยู่จัดส่ง</div>
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  <b>{String(selected?.shipping?.fullName || "-")}</b><br />
                  {String(selected?.shipping?.phone || "")}<br />
                  {String(selected?.shipping?.address || "")}
                </div>
              </div>
              <div style={{ border: "1px solid rgba(229,221,208,0.9)", borderRadius: 12, padding: 12 }}>
                <div className="admin-field-label">🏷️ สถานะ</div>
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Badge label={getPayBadge(selected?.status).label} className={getPayBadge(selected?.status).css} />
                  <Badge label={getShipBadge(getShipStatus(selected)).label} className={getShipBadge(getShipStatus(selected)).css} />
                </div>
              </div>
            </div>
            <div style={{ border: "1px solid rgba(229,221,208,0.9)", borderRadius: 12, padding: 12 }}>
              <div className="admin-field-label">🛒 สินค้า</div>
              <table className="admin-data-table" style={{ marginTop: 8 }}>
                <thead><tr><th>สินค้า</th><th style={{textAlign:"right"}}>จำนวน</th><th style={{textAlign:"right"}}>ราคา</th><th style={{textAlign:"right"}}>รวม</th></tr></thead>
                <tbody>{(selected.items || []).map((it, i) => (
                  <tr key={i}><td><b>{String(it.name || "-")}</b>{it.variant ? <div style={{fontSize:12,opacity:0.7}}>{String(it.variant)}</div> : null}</td><td style={{textAlign:"right"}}>{it.qty}</td><td style={{textAlign:"right"}}>{Number(it.price || 0).toLocaleString()}</td><td style={{textAlign:"right",fontWeight:800}}>{(Number(it.qty || 0) * Number(it.price || 0)).toLocaleString()}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={showEdit} title={selected ? "แก้ไข " + String(selected.id) : "แก้ไข"} onClose={() => setShowEdit(false)} width={600}>
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div className="admin-field-label">สถานะชำระ</div>
                <div style={{ fontWeight: 700, marginTop: 6 }}>{getPayBadge(selected?.status).label}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="admin-field-label">จัดส่ง</div>
                <div style={{ fontWeight: 700, marginTop: 6 }}>{getShipStatus(selected)}</div>
              </div>
            </div>
            <div className="admin-panel" style={{ padding: 14 }}>
              <div className="admin-field-label">เปลี่ยนสถานะชำระ</div>
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button className="admin-btn admin-btn-gold" disabled={working} onClick={() => {
                  if (!window.confirm("ยืนยันออเดอร์ " + String(selected.id) + "?")) return;
                  setWorking(true);
                  updateOrder(selected.id, (o) => createStatusHistory(o, { status: "paid" }));
                  loadOrders();
                  setWorking(false);
                  setShowEdit(false);
                }}>✅ ยืนยัน</button>
                <button className="admin-btn admin-btn-danger" disabled={working} onClick={() => {
                  if (!window.confirm("ยกเลิก " + String(selected.id) + "?")) return;
                  setWorking(true);
                  updateOrder(selected.id, (o) => createStatusHistory(o, { status: "ยกเลิก" }));
                  loadOrders();
                  setWorking(false);
                  setShowEdit(false);
                }}>❌ ยกเลิก</button>
              </div>
            </div>
            <div className="admin-panel" style={{ padding: 14 }}>
              <div className="admin-field-label">สถานะจัดส่ง</div>
              <select className="admin-select"
                defaultValue={getShipStatus(selected)}
                onChange={(e) => {
                  const val = e.target.value;
                  updateOrder(selected.id, (o) => createStatusHistory(o, { ...o, shipping: val }));
                  loadOrders();
                }}
                style={{ marginTop: 10 }}>
                {SHIPPING_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* Print Modal */}
      <Modal open={showPrint} title={selected ? "พิมพ์ใบเสร็จ " + String(selected.id) : "พิมพ์"} onClose={() => setShowPrint(false)} width={500}>
        {selected && (
          <div>
            <p style={{ opacity: 0.75, fontSize: 12, marginBottom: 12 }}>จะเปิดหน้าต่างใหม่และเรียก print()</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="admin-btn" onClick={() => setShowPrint(false)}>ยกเลิก</button>
              <button className="admin-btn admin-btn-gold" onClick={() => { printReceipt(generateReceiptHTML(selected)); setShowPrint(false); }}>พิมพ์</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

