import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../Header";
import { listProducts, deleteProducts, bulkUpdateProducts, exportProductsJSON, importProductsJSON } from "./productsDataStore";
import { compareBySort, matchesSearch } from "./productsUtils";
import "./adminProducts.css";

const TABLE_COLS = 17;

function getQuery() {
  const sp = new URLSearchParams(window.location.search);
  const obj = {};
  for (const [k, v] of sp.entries()) obj[k] = v;
  return obj;
}

function pushQuery(patch, { resetPage = true } = {}) {
  const params = new URLSearchParams(window.location.search);
  Object.entries(patch).forEach(([k, v]) => {
    if (v === "" || v === null || v === undefined) params.delete(k);
    else params.set(k, v);
  });
  if (resetPage) params.delete("page");
  window.location.href = `/admin/products?${params.toString()}`;
}

function statusMatch(p, status) {
  if (!status || status === "All") return true;
  if (status === "OutOfStock") return Number(p.stockTotal) <= 0;
  return p.status === status;
}

function statusBadgeClass(status) {
  switch (status) {
    case "Active": return "admin-badge-active";
    case "Draft": return "admin-badge-draft";
    case "Hidden": return "admin-badge-hidden";
    case "Pending": return "admin-badge-pending";
    case "Rejected": return "admin-badge-rejected";
    case "Deleted": return "admin-badge-deleted";
    default: return "admin-badge-draft";
  }
}

function SearchBox({ initialValue }) {
  const [value, setValue] = useState(initialValue || "");
  const timerRef = useRef(null);

  useEffect(() => {
    setValue(initialValue || "");
  }, [initialValue]);

  const commit = (v) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    pushQuery({ search: v });
  };

  const onChange = (e) => {
    const v = e.target.value;
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => commit(v), 450);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") commit(value);
  };

  return (
    <input
      className="admin-input"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder="ชื่อสินค้า / SKU / Barcode / แบรนด์"
    />
  );
}

export default function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState(() => getQuery());
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkMode, setBulkMode] = useState("hide");
  const [importText, setImportText] = useState("");

  const allCategories = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b), "th"));
  }, [products]);

  const allBrands = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) => p.brand && set.add(p.brand));
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b), "th"));
  }, [products]);

  const allStores = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) => p.store && set.add(p.store));
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b), "th"));
  }, [products]);

  const refresh = () => setProducts(listProducts());

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setQuery(getQuery());
      setSelectedIds([]);
    };
    window.addEventListener("popstate", onPopState);
    // Also use a MutationObserver or interval to detect query changes
    const interval = setInterval(() => {
      const newQuery = getQuery();
      if (JSON.stringify(newQuery) !== JSON.stringify(query)) {
        setQuery(newQuery);
        setSelectedIds([]);
      }
    }, 300);
    return () => {
      window.removeEventListener("popstate", onPopState);
      clearInterval(interval);
    };
  }, [query]);

  const filtered = useMemo(() => {
    const q = query;
    const searchText = q.search || q.q || "";

    let rows = products.filter((p) => matchesSearch(p, searchText));

    if (q.status) rows = rows.filter((p) => statusMatch(p, q.status));
    if (q.category) rows = rows.filter((p) => String(p.category || "") === String(q.category));
    if (q.brand) rows = rows.filter((p) => String(p.brand || "") === String(q.brand));
    if (q.store) rows = rows.filter((p) => String(p.store || "") === String(q.store));
    if (q.noImage === "1") rows = rows.filter((p) => !p.mainImage && (p.gallery?.length || 0) === 0);
    if (q.incomplete === "1") rows = rows.filter((p) => !p.completeness?.isComplete);

    if (q.createdToday === "1") {
      const now = new Date();
      rows = rows.filter((p) => {
        const d = new Date(p.createdAt);
        if (Number.isNaN(d.getTime())) return false;
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
      });
    }

    const sortKey = q.sort || "newest";
    rows = [...rows].sort((a, b) => compareBySort(a, b, sortKey));
    return rows;
  }, [products, query]);

  const page = Number(query.page || 1);
  const pageSize = Number(query.pageSize || 10);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const start = (pageSafe - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllCurrent = () => {
    const ids = paged.map((p) => p.id);
    const allSelected = ids.every((id) => selectedSet.has(id));
    setSelectedIds((prev) => (allSelected ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]))));
  };

  const onBulkApply = () => {
    const ids = selectedIds;
    if (!ids.length) return;

    if (bulkMode === "delete") deleteProducts(ids, { actor: "Admin" });
    else if (bulkMode === "hide") bulkUpdateProducts(ids, (p) => ({ ...p, status: "Hidden" }), { actor: "Admin" });
    else if (bulkMode === "show" || bulkMode === "activate" || bulkMode === "approve")
      bulkUpdateProducts(ids, (p) => ({ ...p, status: "Active" }), { actor: "Admin" });
    else if (bulkMode === "reject") bulkUpdateProducts(ids, (p) => ({ ...p, status: "Rejected" }), { actor: "Admin" });
    else if (bulkMode === "outofstock") bulkUpdateProducts(ids, (p) => ({ ...p, stockTotal: 0, reservedStock: 0 }), { actor: "Admin" });

    setSelectedIds([]);
    refresh();
  };

  const downloadText = (filename, text, mime) => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => downloadText(`products_export_${Date.now()}.json`, exportProductsJSON(), "application/json");

  const doImport = () => {
    try {
      importProductsJSON(importText, { actor: "Admin" });
      setImportText("");
      refresh();
    } catch (e) {
      alert(e?.message || "Import failed");
    }
  };

  return (
    <div className="admin-wrap">
      <Header />
      <div className="admin-page">
        <div className="admin-header-row">
          <div>
            <div className="admin-eyebrow">Admin • Product Management</div>
            <h1 className="admin-h1">รายการสินค้า</h1>
          </div>
          <div className="admin-header-actions">
            <a href="/admin/products/new" className="btn-primary" style={{ textDecoration: "none" }}>
              เพิ่มสินค้า
            </a>
            <button type="button" className="admin-btn" onClick={exportJSON}>Export JSON</button>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-filter-grid">
            <div>
              <div className="admin-field-label">ค้นหา</div>
              <SearchBox initialValue={query.search || ""} />
            </div>

            <div>
              <div className="admin-field-label">Status</div>
              <select className="admin-select" value={query.status || "All"} onChange={(e) => pushQuery({ status: e.target.value })}>
                {["All", "Active", "Draft", "Pending", "Rejected", "Hidden", "OutOfStock"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="admin-field-label">Category</div>
              <select className="admin-select" value={query.category || ""} onChange={(e) => pushQuery({ category: e.target.value })}>
                <option value="">All</option>
                {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <div className="admin-field-label">Brand</div>
              <select className="admin-select" value={query.brand || ""} onChange={(e) => pushQuery({ brand: e.target.value })}>
                <option value="">All</option>
                {allBrands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <div className="admin-field-label">Store</div>
              <select className="admin-select" value={query.store || ""} onChange={(e) => pushQuery({ store: e.target.value })}>
                <option value="">All</option>
                {allStores.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <div className="admin-field-label">Sort</div>
              <select className="admin-select" value={query.sort || "newest"} onChange={(e) => pushQuery({ sort: e.target.value })}>
                {[
                  { value: "newest", label: "ใหม่ล่าสุด" },
                  { value: "oldest", label: "เก่าสุด" },
                  { value: "priceHigh", label: "ราคาสูงสุด" },
                  { value: "priceLow", label: "ราคาต่ำสุด" },
                  { value: "bestSelling", label: "ขายดีที่สุด" },
                  { value: "ratingHigh", label: "รีวิวสูงสุด" },
                  { value: "stockHigh", label: "จำนวนสต็อก" },
                  { value: "viewsHigh", label: "ยอดวิว" },
                ].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <div className="admin-field-label">Page size</div>
              <select className="admin-select" value={String(query.pageSize || 10)} onChange={(e) => pushQuery({ pageSize: e.target.value })}>
                {[10, 20, 30, 50].map((n) => <option key={n} value={String(n)}>{n}</option>)}
              </select>
            </div>

            <div>
              <div className="admin-field-label">Quick</div>
              <button type="button" className="admin-btn" style={{ width: "100%" }} onClick={() => { window.location.href = "/admin/products"; }}>
                รีเซ็ตตัวกรอง
              </button>
            </div>
          </div>
        </div>

        <div className="admin-panel" style={{ marginTop: 14 }}>
          <div className="admin-toolbar">
            <div className="admin-toolbar-left">
              <label className="admin-checkbox-label">
                <input type="checkbox" checked={paged.length > 0 && paged.every((p) => selectedSet.has(p.id))} onChange={selectAllCurrent} />
                เลือกทั้งหมด (เฉพาะหน้า)
              </label>
              <div className="admin-selected-count">เลือก {selectedIds.length} รายการ</div>
            </div>
            <div className="admin-toolbar-left">
              <select className="admin-select" style={{ width: "auto" }} value={bulkMode} onChange={(e) => setBulkMode(e.target.value)}>
                <option value="hide">ซ่อน</option>
                <option value="activate">เปิดขาย</option>
                <option value="approve">อนุมัติ</option>
                <option value="reject">ปฏิเสธ</option>
                <option value="outofstock">ทำให้สินค้าหมด</option>
                <option value="delete">ลบ</option>
              </select>
              <button
                type="button"
                className="admin-btn admin-btn-gold"
                disabled={!selectedIds.length}
                onClick={onBulkApply}
              >
                ทำรายการ
              </button>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }} />
                  <th>รูป</th>
                  <th>SKU</th>
                  <th>ชื่อสินค้า</th>
                  <th>หมวดหมู่</th>
                  <th>ร้านค้า</th>
                  <th>แบรนด์</th>
                  <th>ราคา</th>
                  <th>ราคาโปร</th>
                  <th>คงเหลือ</th>
                  <th>จำนวนขาย</th>
                  <th>ยอดวิว</th>
                  <th>คะแนนรีวิว</th>
                  <th>สถานะ</th>
                  <th>วันที่สร้าง</th>
                  <th>วันที่แก้ไข</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((p) => (
                  <tr key={p.id}>
                    <td><input type="checkbox" checked={selectedSet.has(p.id)} onChange={() => toggleSelected(p.id)} /></td>
                    <td><img src={p.mainImage || "https://placehold.co/40x40"} alt={p.name} className="admin-cell-thumb" /></td>
                    <td className="admin-mono">
                      <div>{p.sku || "-"}</div>
                      <div style={{ opacity: 0.6 }}>{p.barcode || ""}</div>
                    </td>
                    <td>
                      <div className="admin-cell-title">{p.name || "-"}</div>
                      <div className="admin-cell-subtitle">{p.enName || ""}</div>
                      {!p.mainImage && (p.gallery?.length || 0) === 0 && (
                        <div className="admin-cell-flag is-warning">ไม่มีรูป</div>
                      )}
                      {!p.completeness?.isComplete && (
                        <div className="admin-cell-flag is-alert">ข้อมูลไม่ครบ</div>
                      )}
                    </td>
                    <td>{p.category || "-"}</td>
                    <td>{p.store || "-"}</td>
                    <td>{p.brand || "-"}</td>
                    <td>{p.price ?? "-"}</td>
                    <td>{p.promoPrice ?? "-"}</td>
                    <td>{p.stockTotal ?? 0}</td>
                    <td>{p.soldCount ?? 0}</td>
                    <td>{p.views ?? 0}</td>
                    <td>{p.ratingAvg ?? 0} / 5</td>
                    <td>
                      <span className={"admin-badge " + statusBadgeClass(Number(p.stockTotal) <= 0 ? "OutOfStock" : p.status)}>
                        {Number(p.stockTotal) <= 0 && p.status === "Active" ? "OutOfStock" : (p.status || "-")}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, opacity: 0.75 }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontSize: 12, opacity: 0.75 }}>{new Date(p.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div className="admin-actions-row">
                          <button type="button" className="admin-mini-btn admin-mini-btn-strong" onClick={() => { bulkUpdateProducts([p.id], (pp) => ({ ...pp, status: "Active" }), { actor: "Admin" }); refresh(); }}>
                            เปิดขาย
                          </button>
                          <button type="button" className="admin-mini-btn" onClick={() => { bulkUpdateProducts([p.id], (pp) => ({ ...pp, status: "Hidden" }), { actor: "Admin" }); refresh(); }}>
                            ซ่อน
                          </button>
                          <button type="button" className="admin-mini-btn" onClick={() => { bulkUpdateProducts([p.id], (pp) => ({ ...pp, status: "Rejected" }), { actor: "Admin" }); refresh(); }}>
                            ปฏิเสธ
                          </button>
                        </div>
                        <div className="admin-actions-row">
                          <button
                            type="button"
                            className="admin-mini-btn admin-mini-btn-danger"
                            onClick={() => { bulkUpdateProducts([p.id], (pp) => ({ ...pp, stockTotal: 0, reservedStock: 0, status: "OutOfStock" }), { actor: "Admin" }); refresh(); }}
                          >
                            หมดสต็อก
                          </button>
                          <a href={`/admin/products/edit?id=${encodeURIComponent(p.id)}`} className="admin-mini-btn" style={{ textDecoration: "none" }}>
                            แก้ไข
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={TABLE_COLS} className="admin-table-empty">ไม่พบข้อมูลตามตัวกรองนี้</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination-row">
            <div className="admin-pagination-hint">Showing {total === 0 ? 0 : start + 1}-{Math.min(start + pageSize, total)} of {total}</div>
            <div className="admin-pagination">
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const n = i + 1;
                const params = new URLSearchParams(window.location.search);
                params.set("page", String(n));
                return (
                  <a key={n} href={`/admin/products?${params.toString()}`} className={"admin-page-link" + (n === pageSafe ? " is-current" : "")}>
                    {n}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="admin-panel" style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 700 }}>Import JSON (MVP)</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>วาง JSON ที่เคย Export มาก่อนหน้า แล้วกด Import</div>
          <textarea
            className="admin-textarea"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste products JSON here..."
            style={{ minHeight: 120, marginTop: 10 }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button type="button" className="admin-btn admin-btn-gold" disabled={!importText.trim()} onClick={doImport}>
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

