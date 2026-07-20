import React, { useEffect, useMemo, useState } from "react";
import {
  listProducts,
  deleteProducts,
  bulkUpdateProducts,
  exportProductsJSON,
  importProductsJSON,
} from "../utils/store";
import { matchesSearch, compareBySort } from "../utils/helpers";
import { PRODUCT_STATUS, PRODUCT_FILTER_OPTIONS, SORT_OPTIONS, BULK_ACTIONS } from "../utils/constants";
import Pagination from "../components/Pagination";

function psc(status) {
  return PRODUCT_STATUS[status] || "admin-badge-draft";
}

function toCSV(rows) {
  const headers = [
    "id", "name", "sku", "barcode", "category", "store", "brand",
    "price", "promoPrice", "stockTotal", "soldCount", "views",
    "ratingAvg", "status", "createdAt", "updatedAt",
  ];
  const esc = (s) => '"' + String(s ?? "").replace(/"/g, '""') + '"';
  const lines = [headers.join(",")];
  rows.forEach((r) =>
    lines.push(headers.map((h) => esc(h in r ? r[h] : "")).join(","))
  );
  return lines.join("\n");
}

export default function ProductsPage() {
  const [products, setProducts] = useState(() => listProducts());
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState([]);
  const [bulkAction, setBulkAction] = useState("hide");
  const [importText, setImportText] = useState("");

  const refresh = () => setProducts(listProducts());

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    let result = products.filter((p) => matchesSearch(p, search));
    if (statusFilter !== "All") {
      result =
        statusFilter === "OutOfStock"
          ? result.filter((p) => Number(p.stockTotal) <= 0)
          : result.filter((p) => p.status === statusFilter);
    }
    return [...result].sort((a, b) => compareBySort(a, b, sort));
  }, [products, sort, search, statusFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paged = filtered.slice(startIndex, startIndex + pageSize);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggle = (id) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const selectAll = () => {
    const ids = paged.map((p) => p.id);
    const allSelected = ids.every((id) => selectedSet.has(id));
    setSelected((prev) =>
      allSelected
        ? prev.filter((id) => !ids.includes(id))
        : Array.from(new Set([...prev, ...ids]))
    );
  };

  const handleBulk = () => {
    if (!selected.length) return;
    if (bulkAction === "delete") {
      deleteProducts(selected);
    } else {
      bulkUpdateProducts(selected, (p) => {
        switch (bulkAction) {
          case "hide": return { ...p, status: "Hidden" };
          case "activate":
          case "approve": return { ...p, status: "Active" };
          case "reject": return { ...p, status: "Rejected" };
          case "outofstock": return { ...p, stockTotal: 0, reservedStock: 0 };
          default: return p;
        }
      });
    }
    setSelected([]);
    refresh();
  };

  const exportJSON = () => {
    const blob = new Blob([exportProductsJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `products_${Date.now()}.json`;
    a.click();
  };

  const exportCSV = () => {
    const blob = new Blob([toCSV(filtered)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `products_${Date.now()}.csv`;
    a.click();
  };

  const doImport = () => {
    try {
      importProductsJSON(importText);
      setImportText("");
      refresh();
    } catch (e) {
      alert(e?.message || "Import failed");
    }
  };

  const totalCount = products.length;
  const activeCount = products.filter((p) => p.status === "Active").length;
  const pendingCount = products.filter((p) => p.status === "Pending").length;
  const outOfStockCount = products.filter((p) => Number(p.stockTotal || 0) <= 0).length;

  return (
    <>
      <div className="admin-section-label">🏷️ จัดการสินค้า</div>
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-accent green" />
          <div className="admin-kpi-label">สินค้าทั้งหมด</div>
          <div className="admin-kpi-value">{totalCount}</div>
          <div className="admin-kpi-note">รายการ</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-accent gold" />
          <div className="admin-kpi-label">กำลังขาย</div>
          <div className="admin-kpi-value">{activeCount}</div>
          <div className="admin-kpi-note">Active</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-accent warm" />
          <div className="admin-kpi-label">รออนุมัติ</div>
          <div className="admin-kpi-value">{pendingCount}</div>
          <div className="admin-kpi-note">Pending</div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-accent rose" />
          <div className="admin-kpi-label">สินค้าหมด</div>
          <div className="admin-kpi-value is-alert">{outOfStockCount}</div>
          <div className="admin-kpi-note">สต็อก 0</div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title">รายการสินค้า</div>
          <div style={{ display: "flex", gap: 8 }}>
            <a
              href="/admin/products/new"
              className="admin-btn admin-btn-gold"
              style={{ textDecoration: "none", fontSize: 12, padding: "8px 14px" }}
            >
              + เพิ่ม
            </a>
            <button className="admin-btn" onClick={exportJSON}>
              JSON
            </button>
            <button className="admin-btn" onClick={exportCSV}>
              CSV
            </button>
          </div>
        </div>
        <div
          style={{
            padding: "10px 16px",
            borderBottom: "1px solid rgba(229,221,208,0.5)",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={paged.length > 0 && paged.every((p) => selectedSet.has(p.id))}
              onChange={selectAll}
            />{" "}
            เลือก
          </label>
          <span style={{ fontSize: 12, color: "rgba(92,85,73,0.62)" }}>
            {selected.length} รายการ
          </span>
          <select
            className="admin-select"
            style={{ width: "auto" }}
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
          >
            {BULK_ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          <button
            className="admin-btn admin-btn-gold"
            disabled={!selected.length}
            onClick={handleBulk}
          >
            ทำ
          </button>
        </div>
        <div className="admin-filter-bar">
          <div style={{ flex: 1, minWidth: 160 }}>
            <div className="admin-field-label">ค้นหา</div>
            <input
              className="admin-input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="ชื่อ / SKU / แบรนด์"
            />
          </div>
          <div>
            <div className="admin-field-label">Status</div>
            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              {PRODUCT_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="admin-field-label">เรียง</div>
            <select
              className="admin-select"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="admin-field-label">แสดง</div>
            <select
              className="admin-select"
              value={String(pageSize)}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 30, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <button
            className="admin-btn"
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setSort("newest");
              setPage(1);
            }}
          >
            รีเซ็ต
          </button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th style={{ width: 36 }} />
                <th>รูป</th>
                <th>SKU</th>
                <th>ชื่อสินค้า</th>
                <th>หมวด</th>
                <th>ราคา</th>
                <th>โปร</th>
                <th>สต็อก</th>
                <th>ขาย</th>
                <th>วิว</th>
                <th>คะแนน</th>
                <th>สถานะ</th>
                <th>วันที่</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p) => (
                <tr key={p.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSet.has(p.id)}
                      onChange={() => toggle(p.id)}
                    />
                  </td>
                  <td>
                    <img
                      src={p.mainImage || "https://placehold.co/40x40"}
                      alt=""
                      className="admin-cell-thumb"
                    />
                  </td>
                  <td className="admin-mono">
                    <div>{p.sku || "-"}</div>
                    <div style={{ opacity: 0.6, fontSize: 11 }}>
                      {p.barcode || ""}
                    </div>
                  </td>
                  <td>
                    <div className="admin-cell-title">{p.name || "-"}</div>
                    <div className="admin-cell-subtitle">{p.enName || ""}</div>
                    {!p.mainImage && (
                      <div className="admin-cell-flag is-warning">
                        ⚠️ ไม่มีรูป
                      </div>
                    )}
                    {!p.completeness?.isComplete && (
                      <div className="admin-cell-flag is-alert">
                        ⚠️ ข้อมูลไม่ครบ
                      </div>
                    )}
                  </td>
                  <td>{p.category || "-"}</td>
                  <td className="admin-mono">
                    {p.price?.toLocaleString() || "-"}
                  </td>
                  <td className="admin-mono">
                    {p.promoPrice?.toLocaleString() || "-"}
                  </td>
                  <td>{p.stockTotal ?? 0}</td>
                  <td>{p.soldCount ?? 0}</td>
                  <td>{p.views ?? 0}</td>
                  <td>{p.ratingAvg ?? 0}</td>
                  <td>
                    <span
                      className={
                        "admin-badge " +
                        psc(
                          Number(p.stockTotal) <= 0 && p.status === "Active"
                            ? "OutOfStock"
                            : p.status
                        )
                      }
                    >
                      {Number(p.stockTotal) <= 0 && p.status === "Active"
                        ? "หมด"
                        : p.status || "-"}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, opacity: 0.75 }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <button
                          className="admin-mini-btn admin-mini-btn-strong"
                          onClick={() => {
                            bulkUpdateProducts([p.id], (pp) => ({
                              ...pp,
                              status: "Active",
                            }));
                            refresh();
                          }}
                        >
                          เปิด
                        </button>
                        <button
                          className="admin-mini-btn"
                          onClick={() => {
                            bulkUpdateProducts([p.id], (pp) => ({
                              ...pp,
                              status: "Hidden",
                            }));
                            refresh();
                          }}
                        >
                          ซ่อน
                        </button>
                        <button
                          className="admin-mini-btn admin-mini-btn-danger"
                          onClick={() => {
                            bulkUpdateProducts([p.id], (pp) => ({
                              ...pp,
                              status: "Rejected",
                            }));
                            refresh();
                          }}
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                      <a
                        href={`/admin/products/edit?id=${encodeURIComponent(p.id)}`}
                        className="admin-btn"
                        style={{
                          textDecoration: "none",
                          padding: "8px 12px",
                          fontSize: 12,
                          width: "fit-content",
                        }}
                      >
                        แก้ไข
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td
                    colSpan={14}
                    style={{
                      padding: "32px 10px",
                      textAlign: "center",
                      color: "rgba(36,31,26,0.4)",
                      fontSize: 13,
                    }}
                  >
                    ไม่พบสินค้า
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="admin-pagination-row">
          <div className="admin-pagination-info">
            แสดง {total === 0 ? 0 : startIndex + 1}-
            {Math.min(startIndex + pageSize, total)} จาก {total}
          </div>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            setPage={setPage}
          />
        </div>
      </div>

      {/* Import */}
      <div className="admin-panel" style={{ marginTop: 14 }}>
        <div className="admin-panel-header">
          <div className="admin-panel-title">📥 Import JSON</div>
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
            วาง JSON แล้วกด Import
          </div>
          <textarea
            className="admin-textarea"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste JSON..."
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <button
              className="admin-btn admin-btn-gold"
              disabled={!importText.trim()}
              onClick={doImport}
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

