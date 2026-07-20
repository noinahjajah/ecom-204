import React, { useEffect, useMemo, useState } from "react";
import { getProductById, upsertProduct } from "../utils/store";
import { slugify } from "../utils/helpers";
import Header from "../../Header";
import Sidebar from "../components/Sidebar";

function SectionTitle({ children, hint }) {
  return (
    <div
      style={{
        fontFamily: "'Fraunces', serif",
        fontWeight: 500,
        fontSize: 18,
        margin: "30px 0 12px",
        color: "#241f1a",
        display: "flex",
        alignItems: "baseline",
        gap: 8,
      }}
    >
      {children}
      {hint ? (
        <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(36,31,26,0.4)" }}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(36,31,26,0.62)",
          marginBottom: 6,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </div>
      {children}
      {error ? (
        <div style={{ color: "#b23a48", fontSize: 11.5, marginTop: 5 }}>{error}</div>
      ) : null}
    </label>
  );
}

function emptyProduct() {
  const at = new Date().toISOString();
  return {
    id: null, name: "", enName: "", descriptionShort: "", details: "",
    highlights: "", countryOfOrigin: "", manufacturer: "", category: "",
    store: "Maison Véra", brand: "", sku: "", barcode: "",
    price: 0, promoPrice: null, cost: 0, status: "Draft",
    mainImage: "", gallery: [], stockTotal: 0, reservedStock: 0,
    lowStockThreshold: 0, warehouses: [], variantOptions: [], variants: [],
    attributes: [], tags: [], createdAt: at, updatedAt: at,
    soldCount: 0, views: 0, clicks: 0, wishlist: 0, ratingAvg: 0, ratingCount: 0,
    activityLogs: [],
    seo: { metaTitle: "", metaDescription: "", urlSlug: "", keywords: "" },
    shipping: { weightKg: 0, widthCm: 0, heightCm: 0, lengthCm: 0, carrier: "", shippingFee: 0, freeShipping: false },
    completeness: { hasImage: false, isComplete: false },
  };
}

/* ─── Gallery Editor ─── */
function GalleryEditor({ gallery, onChange }) {
  const [draft, setDraft] = useState("");
  const list = gallery || [];

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...list, v]);
    setDraft("");
  };

  return (
    <div>
      {list.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
            gap: 10,
            marginBottom: 10,
          }}
        >
          {list.map((url, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid rgba(36,31,26,0.09)",
                aspectRatio: 1,
              }}
            >
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                type="button"
                onClick={() => onChange(list.filter((_, i) => i !== idx))}
                style={{
                  position: "absolute", top: 4, right: 4,
                  width: 22, height: 22, borderRadius: "50%",
                  border: "none", background: "rgba(36,31,26,0.72)",
                  color: "#fff", fontSize: 12, cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          className="admin-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="https://... (URL รูปเพิ่มเติม)"
        />
        <button type="button" className="admin-add-row-btn" onClick={add}>
          + เพิ่มรูป
        </button>
      </div>
    </div>
  );
}

/* ─── Attributes Editor ─── */
function AttributesEditor({ attributes, onChange }) {
  const list = attributes || [];
  const update = (idx, patch) =>
    onChange(list.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  const remove = (idx) => onChange(list.filter((_, i) => i !== idx));
  const add = () => onChange([...list, { key: "", value: "" }]);

  return (
    <div>
      {list.length === 0 && (
        <div style={{ fontSize: 12.5, color: "rgba(36,31,26,0.4)", padding: "10px 0" }}>
          ยังไม่มีคุณสมบัติเพิ่มเติม
        </div>
      )}
      {list.map((a, idx) => (
        <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <input
            className="admin-input"
            value={a.key}
            onChange={(e) => update(idx, { key: e.target.value })}
            placeholder="ชื่อคุณสมบัติ"
            style={{ flex: "0 0 40%" }}
          />
          <input
            className="admin-input"
            value={a.value}
            onChange={(e) => update(idx, { value: e.target.value })}
            placeholder="ค่า"
          />
          <button
            type="button"
            onClick={() => remove(idx)}
            style={{
              border: "1px solid rgba(36,31,26,0.16)",
              background: "#fff",
              color: "#b23a48",
              borderRadius: 8, width: 36, height: 36, cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className="admin-add-row-btn" onClick={add}>
        + เพิ่มคุณสมบัติ
      </button>
    </div>
  );
}

/* ─── Warehouses Editor ─── */
function WarehousesEditor({ warehouses, onChange }) {
  const list = warehouses || [];
  const update = (idx, patch) =>
    onChange(list.map((w, i) => (i === idx ? { ...w, ...patch } : w)));
  const remove = (idx) => onChange(list.filter((_, i) => i !== idx));
  const add = () => onChange([...list, { name: "", qty: 0 }]);

  return (
    <div>
      {list.length === 0 && (
        <div style={{ fontSize: 12.5, color: "rgba(36,31,26,0.4)", padding: "10px 0" }}>
          ยังไม่มีคลังสินค้า
        </div>
      )}
      {list.map((w, idx) => (
        <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <input
            className="admin-input"
            value={w.name}
            onChange={(e) => update(idx, { name: e.target.value })}
            placeholder="ชื่อคลัง"
            style={{ flex: "0 0 60%" }}
          />
          <input
            className="admin-input"
            type="number"
            value={w.qty ?? 0}
            onChange={(e) => update(idx, { qty: Number(e.target.value) })}
            placeholder="จำนวน"
          />
          <button
            type="button"
            onClick={() => remove(idx)}
            style={{
              border: "1px solid rgba(36,31,26,0.16)",
              background: "#fff",
              color: "#b23a48",
              borderRadius: 8, width: 36, height: 36, cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className="admin-add-row-btn" onClick={add}>
        + เพิ่มคลังสินค้า
      </button>
    </div>
  );
}

/* ─── Variants Editor ─── */
function VariantsEditor({ variantOptions, variants, onOptionsChange, onVariantsChange }) {
  const options = variantOptions || [];
  const rows = variants || [];

  const addOption = () => onOptionsChange([...options, { name: "", values: [] }]);
  const updateOption = (idx, patch) =>
    onOptionsChange(options.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
  const removeOption = (idx) => onOptionsChange(options.filter((_, i) => i !== idx));

  const addVariant = () =>
    onVariantsChange([...rows, { sku: "", price: 0, stock: 0, barcode: "", image: null, options: {} }]);
  const updateVariant = (idx, patch) =>
    onVariantsChange(rows.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  const removeVariant = (idx) => onVariantsChange(rows.filter((_, i) => i !== idx));

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(36,31,26,0.62)", marginBottom: 8, letterSpacing: "0.02em" }}>
        ตัวเลือกสินค้า (เช่น ขนาด, สี)
      </div>
      <div style={{ marginBottom: 16 }}>
        {options.length === 0 && (
          <div style={{ fontSize: 12.5, color: "rgba(36,31,26,0.4)", padding: "10px 0" }}>
            ยังไม่มีตัวเลือกสินค้า
          </div>
        )}
        {options.map((o, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <input
              className="admin-input"
              value={o.name}
              onChange={(e) => updateOption(idx, { name: e.target.value })}
              placeholder="ชื่อตัวเลือก"
              style={{ flex: "0 0 25%" }}
            />
            <input
              className="admin-input"
              value={(o.values || []).join(", ")}
              onChange={(e) =>
                updateOption(idx, {
                  values: e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
                })
              }
              placeholder="ค่าตัวเลือก คั่นด้วย comma"
            />
            <button
              type="button"
              onClick={() => removeOption(idx)}
              style={{
                border: "1px solid rgba(36,31,26,0.16)",
                background: "#fff", color: "#b23a48",
                borderRadius: 8, width: 36, height: 36, cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" className="admin-add-row-btn" onClick={addOption}>
          + เพิ่มตัวเลือก
        </button>
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(36,31,26,0.62)", marginBottom: 8, letterSpacing: "0.02em" }}>
        รายการ Variant
      </div>
      {rows.length === 0 && (
        <div style={{ fontSize: 12.5, color: "rgba(36,31,26,0.4)", padding: "10px 0" }}>
          ยังไม่มี variant — สินค้านี้ขายเป็นรายการเดียว
        </div>
      )}
      {rows.map((v, idx) => (
        <div key={idx} className="admin-panel" style={{ padding: 12, marginBottom: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            <Field label="SKU ย่อย">
              <input className="admin-input" value={v.sku || ""} onChange={(e) => updateVariant(idx, { sku: e.target.value })} />
            </Field>
            <Field label="ราคา">
              <input className="admin-input" type="number" value={v.price ?? 0} onChange={(e) => updateVariant(idx, { price: Number(e.target.value) })} />
            </Field>
            <Field label="สต็อก">
              <input className="admin-input" type="number" value={v.stock ?? 0} onChange={(e) => updateVariant(idx, { stock: Number(e.target.value) })} />
            </Field>
            <Field label="Barcode">
              <input className="admin-input" value={v.barcode || ""} onChange={(e) => updateVariant(idx, { barcode: e.target.value })} />
            </Field>
          </div>
          <Field label={`ตัวเลือก (${options.map((o) => o.name).filter(Boolean).join(", ") || "-"})`}>
            <input
              className="admin-input"
              value={Object.entries(v.options || {}).map(([k, val]) => `${k}:${val}`).join(", ")}
              onChange={(e) => {
                const map = {};
                e.target.value.split(",").forEach((pair) => {
                  const [k, val] = pair.split(":").map((x) => x?.trim());
                  if (k && val) map[k] = val;
                });
                updateVariant(idx, { options: map });
              }}
              placeholder="เช่น ขนาด:30ml"
            />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
            <button type="button" className="admin-mini-btn admin-mini-btn-danger" onClick={() => removeVariant(idx)}>
              ลบ variant นี้
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="admin-add-row-btn" onClick={addVariant}>
        + เพิ่ม variant
      </button>
    </div>
  );
}

export default function AddEditProduct() {
  const id = useMemo(() => {
    const sp = new URLSearchParams(window.location.search);
    return sp.get("id");
  }, []);

  const [product, setProduct] = useState(() =>
    id ? getProductById(id) || null : emptyProduct()
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [saveNote, setSaveNote] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (id) {
      const p = getProductById(id);
      if (p) setProduct(p);
    }
  }, [id]);

  const backToTable = () => {
    window.location.href = "/admin/products";
  };

  if (!product) {
    return (
      <div className="admin-wrap">
        <Header />
        <div style={{ padding: 40, textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}>ไม่พบสินค้า</h1>
          <button className="admin-btn" style={{ marginTop: 12 }} onClick={backToTable}>
            กลับ
          </button>
        </div>
      </div>
    );
  }

  const set = (patch) => setProduct((p) => ({ ...p, ...patch }));
  const setSeo = (patch) => setProduct((p) => ({ ...p, seo: { ...(p.seo || {}), ...patch } }));
  const setShipping = (patch) => setProduct((p) => ({ ...p, shipping: { ...(p.shipping || {}), ...patch } }));

  const validate = ({ draft }) => {
    const e = {};
    if (!product.name?.trim()) e.name = "กรุณากรอกชื่อสินค้า";
    if (!draft) {
      if (!product.sku?.trim()) e.sku = "กรุณากรอก SKU";
      if (!product.category?.trim()) e.category = "กรุณากรอกหมวดหมู่";
      if (!product.price || Number(product.price) <= 0) e.price = "กรุณากรอกราคาที่มากกว่า 0";
    }
    return e;
  };

  const onSave = async ({ draft = false } = {}) => {
    if (saving) return;
    const foundErrors = validate({ draft });
    setErrors(foundErrors);
    setSaveError("");
    if (Object.keys(foundErrors).length > 0) {
      setSaveError("กรุณาแก้ไขข้อมูลที่จำเป็นก่อนบันทึก");
      return;
    }

    setSaving(true);
    try {
      const seoUrl = product.seo?.urlSlug || slugify(product.name);
      const payload = {
        ...product,
        seo: { ...(product.seo || {}), urlSlug: seoUrl, metaTitle: product.seo?.metaTitle || product.name },
        status: draft ? "Draft" : product.status === "Draft" ? "Pending" : product.status || "Active",
        tags: product.tags || [],
        gallery: product.gallery || [],
        variants: product.variants || [],
        variantOptions: product.variantOptions || [],
        attributes: product.attributes || [],
        warehouses: product.warehouses || [],
        price: Number(product.price || 0),
        cost: Number(product.cost || 0),
        stockTotal: Number(product.stockTotal || 0),
        _saveNote: saveNote.trim() || undefined,
      };

      upsertProduct({ product: payload, actor: "Admin" });
      backToTable();
    } catch (err) {
      setSaveError(err?.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const styles = {
    shell: { maxWidth: 980, margin: "0 auto", padding: "0 20px 56px", flex: 1, minWidth: 0 },
    headerRow: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 },
    eyebrow: { fontSize: 11, fontWeight: 600, opacity: 0.6, letterSpacing: "0.14em", textTransform: "uppercase" },
    h1: { margin: "6px 0 0", fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: 30, letterSpacing: "-0.01em", color: "#241f1a" },
    formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    is3: { gridTemplateColumns: "1fr 1fr 1fr" },
    is4: { gridTemplateColumns: "1fr 1fr 1fr 1fr" },
    full: { gridColumn: "1 / -1" },
    actions: { display: "flex", gap: 10, flexWrap: "wrap" },
  };

  return (
    <div className="admin-wrap">
      <Header />
      <div style={{ display: "flex" }}>
        <Sidebar active="products" />
        <div style={styles.shell}>
          <div style={styles.headerRow}>
            <div>
              <div style={styles.eyebrow}>Admin • Product Management</div>
              <h1 style={styles.h1}>{id ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}</h1>
            </div>
            <div style={styles.actions}>
              <button className="admin-btn" type="button" disabled={saving} onClick={() => onSave({ draft: true })}>
                บันทึกเป็น Draft
              </button>
              <button className="admin-btn admin-btn-gold" type="button" disabled={saving} onClick={() => onSave({ draft: false })}>
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button type="button" className="admin-btn" onClick={backToTable}>
                ยกเลิก
              </button>
            </div>
          </div>

          {/* Basic */}
          <SectionTitle>ข้อมูลพื้นฐาน</SectionTitle>
          <div style={styles.formGrid}>
            <Field label="ชื่อสินค้า" error={errors.name}>
              <input
                className={`admin-input${errors.name ? " admin-field-error" : ""}`}
                value={product.name}
                onChange={(e) => set({
                  name: e.target.value,
                  seo: { ...(product.seo || {}), urlSlug: product.seo?.urlSlug ? product.seo.urlSlug : slugify(e.target.value) },
                })}
              />
            </Field>
            <Field label="ชื่ออังกฤษ">
              <input className="admin-input" value={product.enName} onChange={(e) => set({ enName: e.target.value })} />
            </Field>
            <Field label="คำอธิบายสั้น">
              <input className="admin-input" value={product.descriptionShort} onChange={(e) => set({ descriptionShort: e.target.value })} />
            </Field>
            <Field label="หมวดหมู่" error={errors.category}>
              <input className={`admin-input${errors.category ? " admin-field-error" : ""}`} value={product.category} onChange={(e) => set({ category: e.target.value })} />
            </Field>
            <Field label="ร้านค้า">
              <input className="admin-input" value={product.store} onChange={(e) => set({ store: e.target.value })} />
            </Field>
            <Field label="แบรนด์">
              <input className="admin-input" value={product.brand} onChange={(e) => set({ brand: e.target.value })} />
            </Field>
            <Field label="ประเทศแหล่งกำเนิด">
              <input className="admin-input" value={product.countryOfOrigin || ""} onChange={(e) => set({ countryOfOrigin: e.target.value })} />
            </Field>
            <Field label="ผู้ผลิต">
              <input className="admin-input" value={product.manufacturer || ""} onChange={(e) => set({ manufacturer: e.target.value })} />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="รายละเอียดสินค้า">
                <textarea className="admin-textarea" rows={4} value={product.details || ""} onChange={(e) => set({ details: e.target.value })} />
              </Field>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="จุดเด่นสินค้า (แยกบรรทัด)">
                <textarea className="admin-textarea" rows={4} value={product.highlights || ""} onChange={(e) => set({ highlights: e.target.value })} />
              </Field>
            </div>
          </div>

          {/* Status */}
          <SectionTitle>สถานะสินค้า</SectionTitle>
          <div style={styles.formGrid}>
            <Field label="Status">
              <select className="admin-select" value={product.status} onChange={(e) => set({ status: e.target.value })}>
                {["Draft", "Pending", "Active", "Hidden", "OutOfStock", "Deleted", "Rejected"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Tags (คั่นด้วย comma)">
              <input className="admin-input" value={(product.tags || []).join(",")} onChange={(e) => set({ tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} />
            </Field>
          </div>

          {/* Media */}
          <SectionTitle hint="รูปหน้าปก + คลังรูปเพิ่มเติม">รูปภาพสินค้า</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 14, alignItems: "start", marginBottom: 14 }}>
            <img
              src={product.mainImage || "https://placehold.co/160x160"}
              alt="main"
              style={{ width: 160, height: 160, objectFit: "cover", borderRadius: 12, border: "1px solid rgba(36,31,26,0.09)" }}
            />
            <Field label="URL รูปหน้าปก">
              <input className="admin-input" value={product.mainImage || ""} onChange={(e) => set({ mainImage: e.target.value })} placeholder="https://..." />
            </Field>
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(36,31,26,0.62)" }}>คลังรูปเพิ่มเติม (Gallery)</span>
          </div>
          <GalleryEditor gallery={product.gallery} onChange={(gallery) => set({ gallery })} />

          {/* Price */}
          <SectionTitle>ราคาและต้นทุน</SectionTitle>
          <div style={styles.is3}>
            <Field label="ราคาปกติ" error={errors.price}>
              <input className={`admin-input${errors.price ? " admin-field-error" : ""}`} type="number" value={product.price ?? 0} onChange={(e) => set({ price: Number(e.target.value) })} />
            </Field>
            <Field label="ราคาโปร (ถ้ามี)">
              <input className="admin-input" type="number" value={product.promoPrice ?? ""} onChange={(e) => set({ promoPrice: e.target.value === "" ? null : Number(e.target.value) })} />
            </Field>
            <Field label="ต้นทุน (ภายใน)">
              <input className="admin-input" type="number" value={product.cost ?? 0} onChange={(e) => set({ cost: Number(e.target.value) })} />
            </Field>
          </div>

          {/* Inventory */}
          <SectionTitle>สต็อกสินค้า</SectionTitle>
          <div style={styles.is4}>
            <Field label="SKU" error={errors.sku}>
              <input className={`admin-input${errors.sku ? " admin-field-error" : ""}`} value={product.sku || ""} onChange={(e) => set({ sku: e.target.value })} />
            </Field>
            <Field label="Barcode">
              <input className="admin-input" value={product.barcode || ""} onChange={(e) => set({ barcode: e.target.value })} />
            </Field>
            <Field label="จำนวน">
              <input className="admin-input" type="number" value={product.stockTotal ?? 0} onChange={(e) => set({ stockTotal: Number(e.target.value) })} />
            </Field>
            <Field label="Reserved">
              <input className="admin-input" type="number" value={product.reservedStock ?? 0} onChange={(e) => set({ reservedStock: Number(e.target.value) })} />
            </Field>
            <Field label="แจ้งเตือนต่ำกว่า">
              <input className="admin-input" type="number" value={product.lowStockThreshold ?? 0} onChange={(e) => set({ lowStockThreshold: Number(e.target.value) })} />
            </Field>
          </div>
          <div style={{ margin: "12px 0 8px", fontSize: 11, fontWeight: 600, color: "rgba(36,31,26,0.62)" }}>
            คลังสินค้าแยกตามสาขา
          </div>
          <WarehousesEditor warehouses={product.warehouses} onChange={(warehouses) => set({ warehouses })} />

          {/* Variants */}
          <SectionTitle hint="ไม่บังคับ">ตัวเลือกสินค้าและ Variant</SectionTitle>
          <VariantsEditor
            variantOptions={product.variantOptions}
            variants={product.variants}
            onOptionsChange={(variantOptions) => set({ variantOptions })}
            onVariantsChange={(variants) => set({ variants })}
          />

          {/* Attributes */}
          <SectionTitle hint="ไม่บังคับ">คุณสมบัติเพิ่มเติม</SectionTitle>
          <AttributesEditor attributes={product.attributes} onChange={(attributes) => set({ attributes })} />

          {/* Shipping */}
          <SectionTitle>การจัดส่ง</SectionTitle>
          <div style={styles.is4}>
            <Field label="น้ำหนัก (กก.)">
              <input className="admin-input" type="number" value={product.shipping?.weightKg ?? 0} onChange={(e) => setShipping({ weightKg: Number(e.target.value) })} />
            </Field>
            <Field label="กว้าง (ซม.)">
              <input className="admin-input" type="number" value={product.shipping?.widthCm ?? 0} onChange={(e) => setShipping({ widthCm: Number(e.target.value) })} />
            </Field>
            <Field label="สูง (ซม.)">
              <input className="admin-input" type="number" value={product.shipping?.heightCm ?? 0} onChange={(e) => setShipping({ heightCm: Number(e.target.value) })} />
            </Field>
            <Field label="ยาว (ซม.)">
              <input className="admin-input" type="number" value={product.shipping?.lengthCm ?? 0} onChange={(e) => setShipping({ lengthCm: Number(e.target.value) })} />
            </Field>
            <Field label="ขนส่ง">
              <input className="admin-input" value={product.shipping?.carrier || ""} onChange={(e) => setShipping({ carrier: e.target.value })} placeholder="เช่น Kerry" />
            </Field>
            <Field label="ค่าจัดส่ง (บาท)">
              <input className="admin-input" type="number" value={product.shipping?.shippingFee ?? 0} disabled={!!product.shipping?.freeShipping} onChange={(e) => setShipping({ shippingFee: Number(e.target.value) })} />
            </Field>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 0" }}>
              <input type="checkbox" checked={!!product.shipping?.freeShipping} onChange={(e) => setShipping({ freeShipping: e.target.checked })} id="freeShipping" />
              <label htmlFor="freeShipping" style={{ fontSize: 13 }}>ส่งฟรี</label>
            </div>
          </div>

          {/* SEO */}
          <SectionTitle>SEO</SectionTitle>
          <div style={styles.formGrid}>
            <Field label="Meta Title">
              <input className="admin-input" value={product.seo?.metaTitle || ""} onChange={(e) => setSeo({ metaTitle: e.target.value })} />
            </Field>
            <Field label="URL Slug">
              <input className="admin-input" value={product.seo?.urlSlug || ""} onChange={(e) => setSeo({ urlSlug: e.target.value })} />
            </Field>
            <div style={styles.full}>
              <Field label="Meta Description">
                <input className="admin-input" value={product.seo?.metaDescription || ""} onChange={(e) => setSeo({ metaDescription: e.target.value })} />
              </Field>
            </div>
            <div style={styles.full}>
              <Field label="Keywords (คั่นด้วย comma)">
                <input className="admin-input" value={product.seo?.keywords || ""} onChange={(e) => setSeo({ keywords: e.target.value })} />
              </Field>
            </div>
          </div>

          {/* Activity Logs */}
          <SectionTitle>ประวัติการแก้ไข</SectionTitle>
          <div className="admin-panel">
            {(product.activityLogs || []).length === 0 ? (
              <div style={{ color: "rgba(36,31,26,0.4)", fontSize: 13, padding: 16 }}>ยังไม่มีบันทึก</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16 }}>
                {(product.activityLogs || []).slice().reverse().map((l, idx) => (
                  <div key={idx} style={{ borderBottom: "1px dashed rgba(36,31,26,0.09)", paddingBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <b>{l.who || "Admin"}</b>
                      <span style={{ color: "rgba(36,31,26,0.62)", fontSize: 11.5 }}>{new Date(l.at).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(36,31,26,0.62)", marginTop: 5 }}>Note: {l.note}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky save bar */}
          <div
            style={{
              position: "sticky", bottom: 0, marginTop: 26, padding: "14px 16px",
              background: "#fff", border: "1px solid rgba(36,31,26,0.09)",
              borderRadius: 16, boxShadow: "0 1px 2px rgba(36,31,26,0.04)",
              display: "flex", justifyContent: "space-between", gap: 12,
              alignItems: "center", flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(36,31,26,0.62)", marginBottom: 6 }}>
                บันทึกเพิ่มเติม (ไม่บังคับ)
              </div>
              <input
                className="admin-input"
                value={saveNote}
                onChange={(e) => setSaveNote(e.target.value)}
                placeholder="เช่น ปรับราคาตามโปรโมชั่น"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              {saveError && (
                <div style={{ fontSize: 12, color: "#b23a48" }}>{saveError}</div>
              )}
              <div style={styles.actions}>
                <button className="admin-btn" type="button" disabled={saving} onClick={() => onSave({ draft: true })}>
                  บันทึกเป็น Draft
                </button>
                <button className="admin-btn admin-btn-gold" type="button" disabled={saving} onClick={() => onSave({ draft: false })}>
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

