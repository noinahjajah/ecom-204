import React, { useEffect, useMemo, useState } from "react";
import Header from "../Header";
import { listProducts, deleteProducts, bulkUpdateProducts, exportProductsJSON, importProductsJSON } from "./productsDataStore";
import { compareBySort, matchesSearch } from "./productsUtils";
import "./adminProducts.css";


function getQuery() {
  const sp = new URLSearchParams(window.location.search);
  const obj = {};
  for (const [k, v] of sp.entries()) obj[k] = v;
  return obj;
}

function statusMatch(p, status) {
  if (!status || status === "All") return true;
  if (status === "OutOfStock") return Number(p.stockTotal) <= 0;
  return p.status === status;
}

function toCSV(rows) {
  // MVP minimal export
  const headers = [
    "id",
    "name",
    "sku",
    "barcode",
    "category",
    "store",
    "brand",
    "price",
    "promoPrice",
    "stockTotal",
    "soldCount",
    "views",
    "ratingAvg",
    "status",
    "createdAt",
    "updatedAt",
  ];
  const escape = (s) => {
    const str = String(s ?? "");
    return '"' + str.replace(/"/g, '""') + '"';
  };
  const lines = [headers.join(",")];
  rows.forEach((r) => {
    lines.push(
      headers
        .map((h) => {
          const v = h in r ? r[h] : "";
          return escape(v);
        })
        .join(",")
    );
  });
  return lines.join("\n");
}

export default function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState(() => getQuery());
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkMode, setBulkMode] = useState("hide");

  const allCategories = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b), "th"));
  }, [products]);

  const allBrands = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b), "th"));
  }, [products]);

  const allStores = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) => {
      if (p.store) set.add(p.store);
    });
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b), "th"));
  }, [products]);

  const selectedCount = selectedIds.length;

  const refresh = () => {

    setProducts(listProducts());
  };

  useEffect(() => {
    refresh();
    const t = setInterval(() => {
      // keep lightweight
      refresh();
    }, 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setQuery(getQuery());
    setSelectedIds([]);
  }, [window.location.search]);

  const filtered = useMemo(() => {
    const q = query;
    const searchText = q.search || q.q || "";

    let rows = products.filter((p) => matchesSearch(p, searchText));

    if (q.status) {
      rows = rows.filter((p) => statusMatch(p, q.status));
    }
    if (q.category) rows = rows.filter((p) => String(p.category || "") === String(q.category));
    if (q.brand) rows = rows.filter((p) => String(p.brand || "") === String(q.brand));
    if (q.store) rows = rows.filter((p) => String(p.store || "") === String(q.store));

    if (q.noImage === "1") {
      rows = rows.filter((p) => !p.mainImage && (p.gallery?.length || 0) === 0);
    }

    if (q.incomplete === "1") {
      rows = rows.filter((p) => !p.completeness?.isComplete);
    }

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
    setSelectedIds((prev) => {
      if (allSelected) return prev.filter((id) => !ids.includes(id));
      return Array.from(new Set([...prev, ...ids]));
    });
  };

  const onBulkApply = () => {
    const ids = selectedIds;
    if (!ids.length) return;

    if (bulkMode === "delete") {
      deleteProducts(ids, { actor: "Admin" });
    } else if (bulkMode === "hide") {
      bulkUpdateProducts(ids, (p) => ({ ...p, status: "Hidden" }), { actor: "Admin" });
    } else if (bulkMode === "show") {
      bulkUpdateProducts(ids, (p) => ({ ...p, status: "Active" }), { actor: "Admin" });
    } else if (bulkMode === "activate") {
      bulkUpdateProducts(ids, (p) => ({ ...p, status: "Active" }), { actor: "Admin" });
    } else if (bulkMode === "approve") {
      bulkUpdateProducts(ids, (p) => ({ ...p, status: "Active" }), { actor: "Admin" });
    } else if (bulkMode === "reject") {
      bulkUpdateProducts(ids, (p) => ({ ...p, status: "Rejected" }), { actor: "Admin" });
    } else if (bulkMode === "outofstock") {
      bulkUpdateProducts(ids, (p) => ({ ...p, stockTotal: 0, reservedStock: 0 }), { actor: "Admin" });
    }

    setSelectedIds([]);
    refresh();
  };

  const exportJSON = () => {
    const txt = exportProductsJSON();
    downloadText(`products_export_${Date.now()}.json`, txt, "application/json");
  };

  const exportCSV = () => {
    const csv = toCSV(filtered);
    downloadText(`products_export_${Date.now()}.csv`, csv, "text/csv");
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

  const [importText, setImportText] = useState("");
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
    <div style={{ background: "#fbfaf8", minHeight: "100vh" }}>
      <Header />
      <div style={{ maxWidth: 1400, margin: "18px auto", padding: "0 16px 40px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 0.12, textTransform: "uppercase" }}>
              Admin • Product Management
            </div>
            <h1 style={{ margin: "6px 0 0", fontSize: 26 }}>รายการสินค้า</h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/admin/products/new.html" className="btn-primary" style={{ textDecoration: "none" }}>
              เพิ่มสินค้า
            </a>
            <button type="button" className="btn-primary" style={{ cursor: "pointer" }} onClick={exportJSON}>
              Export JSON
            </button>
            <button type="button" className="btn-primary" style={{ cursor: "pointer" }} onClick={exportCSV}>
              Export CSV
            </button>
          </div>
        </div>

        <div className="admin-filter-grid">
          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>ค้นหา</div>
            <input
              className="admin-input"
              value={query.search || ""}
              onChange={(e) => {
                const params = new URLSearchParams(window.location.search);
                params.set("search", e.target.value);
                params.delete("page");
                window.location.href = `/admin/products.html?${params.toString()}`;
              }}
              placeholder="ชื่อสินค้า / SKU / Barcode / แบรนด์"
            />
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Status</div>
            <select
              className="admin-select"
              value={query.status || "All"}
              onChange={(e) => {
                const params = new URLSearchParams(window.location.search);
                params.set("status", e.target.value);
                params.delete("page");
                window.location.href = `/admin/products.html?${params.toString()}`;
              }}
            >
              {[
                "All",
                "Active",
                "Pending",
                "Rejected",
                "Hidden",
                "OutOfStock",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Category</div>
            <select
              className="admin-select"
              value={query.category || ""}
              onChange={(e) => {
                const params = new URLSearchParams(window.location.search);
                const v = e.target.value;
                if (v) params.set("category", v);
                else params.delete("category");
                params.delete("page");
                window.location.href = `/admin/products.html?${params.toString()}`;
              }}
            >
              <option value="">All</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Brand</div>
            <select
              className="admin-select"
              value={query.brand || ""}
              onChange={(e) => {
                const params = new URLSearchParams(window.location.search);
                const v = e.target.value;
                if (v) params.set("brand", v);
                else params.delete("brand");
                params.delete("page");
                window.location.href = `/admin/products.html?${params.toString()}`;
              }}
            >
              <option value="">All</option>
              {allBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Store</div>
            <select
              className="admin-select"
              value={query.store || ""}
              onChange={(e) => {
                const params = new URLSearchParams(window.location.search);
                const v = e.target.value;
                if (v) params.set("store", v);
                else params.delete("store");
                params.delete("page");
                window.location.href = `/admin/products.html?${params.toString()}`;
              }}
            >
              <option value="">All</option>
              {allStores.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Sort</div>
            <select
              className="admin-select"
              value={query.sort || "newest"}
              onChange={(e) => {
                const params = new URLSearchParams(window.location.search);
                params.set("sort", e.target.value);
                params.delete("page");
                window.location.href = `/admin/products.html?${params.toString()}`;
              }}
            >
              {[
                { value: "newest", label: "ใหม่ล่าสุด" },
                { value: "oldest", label: "เก่าสุด" },
                { value: "priceHigh", label: "ราคาสูงสุด" },
                { value: "priceLow", label: "ราคาต่ำสุด" },
                { value: "bestSelling", label: "ขายดีที่สุด" },
                { value: "ratingHigh", label: "รีวิวสูงสุด" },
                { value: "stockHigh", label: "จำนวนสต็อก" },
                { value: "viewsHigh", label: "ยอดวิว" },
              ].map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Page size</div>
            <select
              className="admin-select"
              value={String(query.pageSize || 10)}
              onChange={(e) => {
                const params = new URLSearchParams(window.location.search);
                params.set("pageSize", e.target.value);
                params.delete("page");
                window.location.href = `/admin/products.html?${params.toString()}`;
              }}
            >
              {[10, 20, 30, 50].map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Quick</div>
            <button
              type="button"
              className="admin-mini-btn"
              style={{ width: "100%" }}
              onClick={() => {
                window.location.href = "/admin/products.html";
              }}
            >
              รีเซ็ตตัวกรอง
            </button>
          </div>
        </div>


        <div style={{ marginTop: 14, background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={paged.length > 0 && paged.every((p) => selectedSet.has(p.id))} onChange={selectAllCurrent} />
                เลือกทั้งหมด (เฉพาะหน้า)
              </label>
              <div style={{ fontSize: 12, opacity: 0.7 }}>เลือก {selectedIds.length} รายการ</div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <select value={bulkMode} onChange={(e) => setBulkMode(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }}>
                <option value="hide">ซ่อน</option>
                <option value="activate">เปิดขาย</option>
                <option value="approve">อนุมัติ</option>
                <option value="reject">ปฏิเสธ</option>
                <option value="outofstock">ทำให้สินค้าหมด</option>
                <option value="delete">ลบ</option>
              </select>
              <button type="button" className="btn-primary" style={{ cursor: selectedIds.length ? "pointer" : "not-allowed", opacity: selectedIds.length ? 1 : 0.6 }} onClick={onBulkApply}>
                ทำรายการ
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto", marginTop: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                  <th style={{ padding: 10, width: 40 }} />
                  <th style={{ padding: 10 }}>รูป</th>
                  <th style={{ padding: 10 }}>SKU</th>
                  <th style={{ padding: 10 }}>ชื่อสินค้า</th>
                  <th style={{ padding: 10 }}>หมวดหมู่</th>
                  <th style={{ padding: 10 }}>ร้านค้า</th>
                  <th style={{ padding: 10 }}>แบรนด์</th>
                  <th style={{ padding: 10 }}>ราคา</th>
                  <th style={{ padding: 10 }}>ราคาโปร</th>
                  <th style={{ padding: 10 }}>คงเหลือ</th>
                  <th style={{ padding: 10 }}>จำนวนขาย</th>
                  <th style={{ padding: 10 }}>ยอดวิว</th>
                  <th style={{ padding: 10 }}>คะแนนรีวิว</th>
                  <th style={{ padding: 10 }}>สถานะ</th>
                  <th style={{ padding: 10 }}>วันที่สร้าง</th>
                  <th style={{ padding: 10 }}>วันที่แก้ไข</th>
                  <th style={{ padding: 10 }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px dashed rgba(0,0,0,0.08)" }}>
                    <td style={{ padding: 10 }}>
                      <input type="checkbox" checked={selectedSet.has(p.id)} onChange={() => toggleSelected(p.id)} />
                    </td>
                    <td style={{ padding: 10 }}>
                      <img src={p.mainImage || "https://placehold.co/40x40"} alt={p.name} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)" }} />
                    </td>
                    <td style={{ padding: 10, fontFamily: "monospace", fontSize: 12 }}>
                      <div>{p.sku || "-"}</div>
                      <div style={{ opacity: 0.7 }}>{p.barcode || ""}</div>
                    </td>
                    <td style={{ padding: 10 }}>
                      <div style={{ fontWeight: 800 }}>{p.name || "-"}</div>
                      <div style={{ opacity: 0.7, fontSize: 12 }}>{p.enName || ""}</div>
                      {!p.mainImage && (p.gallery?.length || 0) === 0 && (
                        <div style={{ color: "#ad8a55", fontSize: 12, marginTop: 2 }}>ไม่มีรูป</div>
                      )}
                      {!p.completeness?.isComplete && (
                        <div style={{ color: "#b23a48", fontSize: 12, marginTop: 2 }}>ข้อมูลไม่ครบ</div>
                      )}
                    </td>
                    <td style={{ padding: 10 }}>{p.category || "-"}</td>
                    <td style={{ padding: 10 }}>{p.store || "-"}</td>
                    <td style={{ padding: 10 }}>{p.brand || "-"}</td>
                    <td style={{ padding: 10 }}>{p.price ?? "-"}</td>
                    <td style={{ padding: 10 }}>{p.promoPrice ?? "-"}</td>
                    <td style={{ padding: 10 }}>{p.stockTotal ?? 0}</td>
                    <td style={{ padding: 10 }}>{p.soldCount ?? 0}</td>
                    <td style={{ padding: 10 }}>{p.views ?? 0}</td>
                    <td style={{ padding: 10 }}>{p.ratingAvg ?? 0} / 5</td>
                    <td style={{ padding: 10 }}>
                      <span
                        className={"admin-badge " + (
                          p.status === "Active"
                            ? "admin-badge-active"
                            : p.status === "Hidden"
                              ? "admin-badge-hidden"
                              : p.status === "Pending"
                                ? "admin-badge-pending"
                                : p.status === "Rejected"
                                  ? "admin-badge-rejected"
                                  : p.status === "OutOfStock"
                                    ? "admin-badge-outofstock"
                                    : ""
                        )}
                      >
                        {p.status || "-"}
                      </span>
                    </td>

                    <td style={{ padding: 10, fontSize: 12, opacity: 0.75 }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: 10, fontSize: 12, opacity: 0.75 }}>{new Date(p.updatedAt).toLocaleDateString()}</td>
                    <td style={{ padding: 10 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <a href={`/product?id=${encodeURIComponent(p.seo?.urlSlug || p.id)}`} style={{ fontSize: 12, opacity: 0.8, textDecoration: "none" }}>
                          ดูตัวอย่าง
                        </a>
                        <div className="admin-actions-row" style={{ gap: 6 }}>
                          <button
                            type="button"
                            className="admin-mini-btn admin-mini-btn-strong"
                            onClick={() => {
                              bulkUpdateProducts([p.id], (pp) => ({ ...pp, status: "Active" }), { actor: "Admin" });
                              refresh();
                            }}
                          >
                            เปิดขาย
                          </button>
                          <button
                            type="button"
                            className="admin-mini-btn"
                            onClick={() => {
                              bulkUpdateProducts([p.id], (pp) => ({ ...pp, status: "Hidden" }), { actor: "Admin" });
                              refresh();
                            }}
                          >
                            ซ่อน
                          </button>
                          <button
                            type="button"
                            className="admin-mini-btn"
                            onClick={() => {
                              bulkUpdateProducts([p.id], (pp) => ({ ...pp, status: "Rejected" }), { actor: "Admin" });
                              refresh();
                            }}
                          >
                            ปฏิเสธ
                          </button>
                        </div>
                        <button
                          type="button"
                          className="admin-mini-btn admin-mini-btn-danger"
                          onClick={() => {
                            bulkUpdateProducts(
                              [p.id],
                              (pp) => ({ ...pp, stockTotal: 0, reservedStock: 0, status: "OutOfStock" }),
                              { actor: "Admin" }
                            );
                            refresh();
                          }}
                        >
                          หมดสต็อก
                        </button>
                        <a
                          href={`/admin/products/edit.html?id=${encodeURIComponent(p.id)}`}
                          className="btn-primary"
                          style={{ textDecoration: "none", padding: "8px 12px", fontSize: 12, width: "fit-content" }}
                        >
                          แก้ไข
                        </a>
                      </div>
                    </td>

                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={17} style={{ padding: 20, opacity: 0.7 }}>
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Showing {start + 1}-{Math.min(start + pageSize, total)} of {total}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                const n = i + 1;
                return (
                  <a
                    key={n}
                    href={(() => {
                      const params = new URLSearchParams(window.location.search);
                      params.set("page", String(n));
                      return `/admin/products.html?${params.toString()}`;
                    })()}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid rgba(0,0,0,0.12)",
                      background: n === pageSafe ? "rgba(0,0,0,0.04)" : "transparent",
                      textDecoration: "none",
                      fontSize: 12,
                    }}
                  >
                    {n}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 12 }}>
            <div style={{ fontWeight: 800 }}>Import JSON (MVP)</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              วาง JSON ที่เคย Export มาก่อนหน้า แล้วกด Import
            </div>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste products JSON here..."
              style={{ width: "100%", minHeight: 120, marginTop: 10, padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <button type="button" className="btn-primary" style={{ cursor: importText.trim() ? "pointer" : "not-allowed", opacity: importText.trim() ? 1 : 0.6 }} onClick={doImport}>
                Import
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

