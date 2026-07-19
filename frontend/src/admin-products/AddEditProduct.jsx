import React, { useEffect, useMemo, useState } from "react";
import Header from "../Header";
import { getProductById, upsertProduct } from "./productsDataStore";
import { slugify } from "./productsUtils";

function getIdFromQuery() {
  const sp = new URLSearchParams(window.location.search);
  return sp.get("id");
}

function SectionTitle({ children }) {
  return <div style={{ fontWeight: 900, margin: "18px 0 10px" }}>{children}</div>;
}

export default function AddEditProduct() {
  const id = useMemo(() => getIdFromQuery(), []);
  const [product, setProduct] = useState(() => {
    if (id) {
      return getProductById(id) || null;
    }
    const at = new Date().toISOString();
    return {
      id: null,
      name: "",
      enName: "",
      descriptionShort: "",
      details: "",
      highlights: "",
      countryOfOrigin: "",
      manufacturer: "",
      category: "",
      store: "Maison Véra",
      brand: "",
      sku: "",
      barcode: "",
      price: 0,
      promoPrice: null,
      status: "Draft",
      mainImage: "",
      gallery: [],
      stockTotal: 0,
      reservedStock: 0,
      lowStockThreshold: 0,
      variants: [],
      attributes: [],
      tags: [],
      createdAt: at,
      updatedAt: at,
      soldCount: 0,
      views: 0,
      clicks: 0,
      wishlist: 0,
      ratingAvg: 0,
      ratingCount: 0,
      activityLogs: [],
      seo: { metaTitle: "", metaDescription: "", urlSlug: "", keywords: "" },
      shipping: { weightKg: 0, widthCm: 0, heightCm: 0, lengthCm: 0, carrier: "", shippingFee: 0, freeShipping: false },
      completeness: { hasImage: false, isComplete: false },
    };
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const p = getProductById(id);
      if (p) setProduct(p);
    }
  }, [id]);

  const backToTable = () => {
    window.location.href = "/admin/products.html";
  };

  if (!product) {
    return (
      <div style={{ background: "#fbfaf8", minHeight: "100vh" }}>
        <Header />
        <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>
          <h1 style={{ fontSize: 22 }}>ไม่พบสินค้า</h1>
          <button className="btn-primary" onClick={backToTable} style={{ cursor: "pointer" }}>กลับ</button>
        </div>
      </div>
    );
  }

  const onSave = async ({ draft = false } = {}) => {
    if (saving) return;
    setSaving(true);
    try {
      const seoUrl = product.seo?.urlSlug || slugify(product.name);
      const payload = {
        ...product,
        seo: {
          ...(product.seo || {}),
          urlSlug: seoUrl,
          metaTitle: product.seo?.metaTitle || product.name,
        },
        status: draft ? "Draft" : product.status || "Active",
        tags: product.tags || [],
        gallery: product.gallery || [],
        variants: product.variants || [],
        attributes: product.attributes || [],
        promoPrice: product.promoPrice === "" ? null : product.promoPrice,
        price: Number(product.price || 0),
        stockTotal: Number(product.stockTotal || 0),
        reservedStock: Number(product.reservedStock || 0),
      };

      upsertProduct({ product: payload, actor: "Admin" });
      backToTable();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: "#fbfaf8", minHeight: "100vh" }}>
      <Header />
      <div style={{ maxWidth: 980, margin: "18px auto", padding: "0 16px 40px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 0.12, textTransform: "uppercase" }}>
              Admin • Product Management
            </div>
            <h1 style={{ margin: "6px 0 0", fontSize: 26 }}>{id ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}</h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn-primary" type="button" style={{ cursor: "pointer" }} onClick={() => onSave({ draft: true })}>
              บันทึกเป็น Draft
            </button>
            <button className="btn-primary" type="button" style={{ cursor: "pointer" }} onClick={() => onSave({ draft: false })}>
              บันทึก
            </button>
            <button type="button" className="btn-ghost" style={{ cursor: "pointer", borderBottom: "1px solid rgba(0,0,0,0.3)" }} onClick={backToTable}>
              ยกเลิก
            </button>
          </div>
        </div>

        {/* Basic */}
        <SectionTitle>ข้อมูลพื้นฐาน</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>ชื่อสินค้า</div>
            <input
              value={product.name}
              onChange={(e) => setProduct((p) => ({ ...p, name: e.target.value, seo: { ...(p.seo || {}), urlSlug: slugify(e.target.value) } }))}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }}
            />
          </label>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>ชื่ออังกฤษ</div>
            <input
              value={product.enName}
              onChange={(e) => setProduct((p) => ({ ...p, enName: e.target.value }))}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }}
            />
          </label>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>คำอธิบายสั้น</div>
            <input
              value={product.descriptionShort}
              onChange={(e) => setProduct((p) => ({ ...p, descriptionShort: e.target.value }))}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }}
            />
          </label>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>หมวดหมู่</div>
            <input
              value={product.category}
              onChange={(e) => setProduct((p) => ({ ...p, category: e.target.value }))}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }}
            />
          </label>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>ร้านค้า</div>
            <input
              value={product.store}
              onChange={(e) => setProduct((p) => ({ ...p, store: e.target.value }))}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }}
            />
          </label>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>แบรนด์</div>
            <input
              value={product.brand}
              onChange={(e) => setProduct((p) => ({ ...p, brand: e.target.value }))}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }}
            />
          </label>
        </div>

        {/* Status */}
        <SectionTitle>สถานะสินค้า</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Status</div>
            <select
              value={product.status}
              onChange={(e) => setProduct((p) => ({ ...p, status: e.target.value }))}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }}
            >
              {['Draft','Pending','Active','Hidden','OutOfStock','Deleted','Rejected'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Tags (คั่นด้วย comma)</div>
            <input
              value={(product.tags || []).join(",")}
              onChange={(e) => setProduct((p) => ({ ...p, tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }))}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }}
            />
          </label>
        </div>

        {/* Media */}
        <SectionTitle>รูปภาพสินค้า (MVP)</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, alignItems: "start" }}>
          <div>
            <img
              src={product.mainImage || "https://placehold.co/160x160"}
              alt="main"
              style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 14, border: "1px solid rgba(0,0,0,0.08)" }}
            />
          </div>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>URL รูปหน้าปก</div>
            <input
              value={product.mainImage || ""}
              onChange={(e) => setProduct((p) => ({ ...p, mainImage: e.target.value }))}
              placeholder="https://..."
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }}
            />
          </label>
        </div>

        {/* Price */}
        <SectionTitle>ราคา</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>ราคาปกติ</div>
            <input
              type="number"
              value={product.price ?? 0}
              onChange={(e) => setProduct((p) => ({ ...p, price: Number(e.target.value) }))}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }}
            />
          </label>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>ราคาโปร</div>
            <input
              type="number"
              value={product.promoPrice ?? ""}
              onChange={(e) => setProduct((p) => ({ ...p, promoPrice: e.target.value === "" ? null : Number(e.target.value) }))}
              placeholder="(optional)"
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }}
            />
          </label>
        </div>

        {/* Inventory */}
        <SectionTitle>สต็อกสินค้า (MVP)</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>SKU</div>
            <input value={product.sku || ""} onChange={(e) => setProduct((p) => ({ ...p, sku: e.target.value }))} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }} />
          </label>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Barcode</div>
            <input value={product.barcode || ""} onChange={(e) => setProduct((p) => ({ ...p, barcode: e.target.value }))} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }} />
          </label>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>จำนวน</div>
            <input type="number" value={product.stockTotal ?? 0} onChange={(e) => setProduct((p) => ({ ...p, stockTotal: Number(e.target.value) }))} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }} />
          </label>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Reserved Stock</div>
            <input type="number" value={product.reservedStock ?? 0} onChange={(e) => setProduct((p) => ({ ...p, reservedStock: Number(e.target.value) }))} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }} />
          </label>
        </div>

        {/* SEO */}
        <SectionTitle>SEO</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Meta Title</div>
            <input
              value={product.seo?.metaTitle || ""}
              onChange={(e) => setProduct((p) => ({ ...p, seo: { ...(p.seo || {}), metaTitle: e.target.value } }))}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }}
            />
          </label>
          <label>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>URL Slug</div>
            <input
              value={product.seo?.urlSlug || ""}
              onChange={(e) => setProduct((p) => ({ ...p, seo: { ...(p.seo || {}), urlSlug: e.target.value } }))}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }}
            />
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Meta Description</div>
            <input
              value={product.seo?.metaDescription || ""}
              onChange={(e) => setProduct((p) => ({ ...p, seo: { ...(p.seo || {}), metaDescription: e.target.value } }))}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white" }}
            />
          </label>
        </div>

        {/* Activity logs */}
        <SectionTitle>ประวัติการแก้ไข (Activity Logs)</SectionTitle>
        <div style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: 12 }}>
          {(product.activityLogs || []).length === 0 ? (
            <div style={{ opacity: 0.7, fontSize: 13 }}>ยังไม่มีบันทึก</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(product.activityLogs || []).slice().reverse().map((l, idx) => (
                <div key={idx} style={{ borderBottom: "1px dashed rgba(0,0,0,0.08)", paddingBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <b>{l.who || "Admin"}</b>
                    <span style={{ opacity: 0.7, fontSize: 12 }}>{new Date(l.at).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                    <div>Note: {l.note}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

