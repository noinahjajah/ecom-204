// 📄 AddEditProduct.jsx
// ─────────────────────────────────────────────────────────────
// 🔗 Connects to:
//    - productsDataStore.js → getProductById(id), upsertProduct()
//    - productsUtils.js     → slugify()
//    - adminProducts.css    → .admin-* classes (shared with the other two files)
// 🚦 Route: /admin/products/new.html (no ?id) or /admin/products/edit.html?id=...
//    On save, navigates back to /admin/products.html (ProductsTable.jsx).
// 🧩 COMPLETED THIS PASS: productsDataStore.js / the seed data already carry
//    gallery, variants, variantOptions, attributes, shipping, cost, and
//    warehouses — but this form had no inputs for any of them, so anything
//    added here previously could only ever be edited by hand-editing
//    localStorage. Added: Gallery editor, Variant options + Variants table,
//    Attributes key/value editor, Shipping fields, Cost, Warehouses, and
//    basic validation (name / SKU / category / price required to publish;
//    Draft can still be saved incomplete).
// ⚠️ Side effects: upsertProduct() writes to localStorage synchronously and
//    appends an activityLogs entry — see the optional "Note" field below,
//    it's threaded into that log entry instead of the hardcoded
//    "Upsert product" string.
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useMemo, useState } from "react";
import Header from "../Header";
import { getProductById, upsertProduct } from "./productsDataStore";
import { slugify } from "./productsUtils";
import "./adminProducts.css";

function getIdFromQuery() {
  const sp = new URLSearchParams(window.location.search);
  return sp.get("id");
}

function SectionTitle({ children, hint }) {
  return (
    <div className="admin-section-title">
      {children}
      {hint ? <span className="admin-section-hint">{hint}</span> : null}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label>
      <div className="admin-field-label">{label}</div>
      {children}
      {error ? <div className="admin-error-text">{error}</div> : null}
    </label>
  );
}

function emptyProduct() {
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
    cost: 0,
    status: "Draft",
    mainImage: "",
    gallery: [],
    stockTotal: 0,
    reservedStock: 0,
    lowStockThreshold: 0,
    warehouses: [],
    variantOptions: [],
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
}

// ───────────────────────── Repeatable field helpers ─────────────────────────

// 🖼️ Gallery — grid of image URL thumbnails with add/remove
function GalleryEditor({ gallery, onChange }) {
  const [draft, setDraft] = useState("");
  const list = gallery || [];

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...list, v]);
    setDraft("");
  };

  const remove = (idx) => onChange(list.filter((_, i) => i !== idx));

  return (
    <div>
      {list.length > 0 && (
        <div className="admin-gallery-grid" style={{ marginBottom: 10 }}>
          {list.map((url, idx) => (
            <div className="admin-gallery-item" key={idx}>
              <img src={url} alt={`gallery-${idx}`} />
              <button type="button" className="admin-gallery-remove" onClick={() => remove(idx)} aria-label="ลบรูป">×</button>
            </div>
          ))}
        </div>
      )}
      <div className="admin-repeatable-row">
        <input
          className="admin-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="https://... (URL รูปเพิ่มเติม)"
        />
        <button type="button" className="admin-add-row-btn" onClick={add}>+ เพิ่มรูป</button>
      </div>
    </div>
  );
}

// 🏷️ Attributes — free-form key/value pairs (เช่น "ผิวที่เหมาะ" → "ทุกสภาพผิว")
function AttributesEditor({ attributes, onChange }) {
  const list = attributes || [];
  const update = (idx, patch) => onChange(list.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  const remove = (idx) => onChange(list.filter((_, i) => i !== idx));
  const add = () => onChange([...list, { key: "", value: "" }]);

  return (
    <div className="admin-repeatable">
      {list.length === 0 && <div className="admin-repeatable-empty">ยังไม่มีคุณสมบัติเพิ่มเติม</div>}
      {list.map((a, idx) => (
        <div className="admin-repeatable-row" key={idx}>
          <input className="admin-input" value={a.key} onChange={(e) => update(idx, { key: e.target.value })} placeholder="ชื่อคุณสมบัติ เช่น ผิวที่เหมาะ" style={{ flex: "0 0 40%" }} />
          <input className="admin-input" value={a.value} onChange={(e) => update(idx, { value: e.target.value })} placeholder="ค่า เช่น ทุกสภาพผิว" />
          <button type="button" className="admin-remove-btn" onClick={() => remove(idx)} aria-label="ลบ">×</button>
        </div>
      ))}
      <button type="button" className="admin-add-row-btn" onClick={add}>+ เพิ่มคุณสมบัติ</button>
    </div>
  );
}

// 🏭 Warehouses — name + qty
function WarehousesEditor({ warehouses, onChange }) {
  const list = warehouses || [];
  const update = (idx, patch) => onChange(list.map((w, i) => (i === idx ? { ...w, ...patch } : w)));
  const remove = (idx) => onChange(list.filter((_, i) => i !== idx));
  const add = () => onChange([...list, { name: "", qty: 0 }]);

  return (
    <div className="admin-repeatable">
      {list.length === 0 && <div className="admin-repeatable-empty">ยังไม่มีคลังสินค้า</div>}
      {list.map((w, idx) => (
        <div className="admin-repeatable-row" key={idx}>
          <input className="admin-input" value={w.name} onChange={(e) => update(idx, { name: e.target.value })} placeholder="ชื่อคลัง เช่น Bangkok" style={{ flex: "0 0 60%" }} />
          <input className="admin-input" type="number" value={w.qty ?? 0} onChange={(e) => update(idx, { qty: Number(e.target.value) })} placeholder="จำนวน" />
          <button type="button" className="admin-remove-btn" onClick={() => remove(idx)} aria-label="ลบ">×</button>
        </div>
      ))}
      <button type="button" className="admin-add-row-btn" onClick={add}>+ เพิ่มคลังสินค้า</button>
    </div>
  );
}

// 🎛️ Variant options (เช่น "ขนาด" → 30ml, 50ml) + the resulting variants table
function VariantsEditor({ variantOptions, variants, onOptionsChange, onVariantsChange }) {
  const options = variantOptions || [];
  const rows = variants || [];

  const updateOption = (idx, patch) => onOptionsChange(options.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
  const removeOption = (idx) => onOptionsChange(options.filter((_, i) => i !== idx));
  const addOption = () => onOptionsChange([...options, { name: "", values: [] }]);

  const updateVariant = (idx, patch) => onVariantsChange(rows.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  const removeVariant = (idx) => onVariantsChange(rows.filter((_, i) => i !== idx));
  const addVariant = () => onVariantsChange([...rows, { sku: "", price: 0, stock: 0, barcode: "", image: null, options: {} }]);

  return (
    <div>
      <div className="admin-field-label" style={{ marginBottom: 8 }}>ตัวเลือกสินค้า (เช่น ขนาด, สี)</div>
      <div className="admin-repeatable" style={{ marginBottom: 16 }}>
        {options.length === 0 && <div className="admin-repeatable-empty">ยังไม่มีตัวเลือกสินค้า</div>}
        {options.map((o, idx) => (
          <div className="admin-repeatable-row" key={idx}>
            <input className="admin-input" value={o.name} onChange={(e) => updateOption(idx, { name: e.target.value })} placeholder="ชื่อตัวเลือก เช่น ขนาด" style={{ flex: "0 0 30%" }} />
            <input
              className="admin-input"
              value={(o.values || []).join(", ")}
              onChange={(e) => updateOption(idx, { values: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
              placeholder="ค่าตัวเลือก คั่นด้วย comma เช่น 30ml, 50ml"
            />
            <button type="button" className="admin-remove-btn" onClick={() => removeOption(idx)} aria-label="ลบ">×</button>
          </div>
        ))}
        <button type="button" className="admin-add-row-btn" onClick={addOption}>+ เพิ่มตัวเลือก</button>
      </div>

      <div className="admin-field-label" style={{ marginBottom: 8 }}>รายการ Variant (SKU ย่อยต่อรายการ)</div>
      <div className="admin-repeatable">
        {rows.length === 0 && <div className="admin-repeatable-empty">ยังไม่มี variant — สินค้านี้ขายเป็นรายการเดียว</div>}
        {rows.map((v, idx) => (
          <div key={idx} className="admin-panel" style={{ padding: 12 }}>
            <div className="admin-form-grid is-4">
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
              <button type="button" className="admin-mini-btn admin-mini-btn-danger" onClick={() => removeVariant(idx)}>ลบ variant นี้</button>
            </div>
          </div>
        ))}
        <button type="button" className="admin-add-row-btn" onClick={addVariant}>+ เพิ่ม variant</button>
      </div>
    </div>
  );
}

export default function AddEditProduct() {
  const id = useMemo(() => getIdFromQuery(), []);
  const [product, setProduct] = useState(() => (id ? getProductById(id) || null : emptyProduct()));
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
    window.location.href = "/admin/products.html";
  };

  if (!product) {
    return (
      <div className="admin-wrap">
        <Header />
        <div className="admin-page admin-form-shell">
          <h1 className="admin-h1">ไม่พบสินค้า</h1>
          <button className="btn-primary" onClick={backToTable} style={{ cursor: "pointer", marginTop: 12 }}>กลับ</button>
        </div>
      </div>
    );
  }

  const set = (patch) => setProduct((p) => ({ ...p, ...patch }));
  const setSeo = (patch) => setProduct((p) => ({ ...p, seo: { ...(p.seo || {}), ...patch } }));
  const setShipping = (patch) => setProduct((p) => ({ ...p, shipping: { ...(p.shipping || {}), ...patch } }));

  // ✅ Validation — publishing (non-draft) requires the core fields; Draft
  // can be saved incomplete on purpose so a merchandiser can come back later.
  const validate = ({ draft }) => {
    const e = {};
    if (!product.name?.trim()) e.name = "กรุณากรอกชื่อสินค้า";
    if (!draft) {
      if (!product.sku?.trim()) e.sku = "กรุณากรอก SKU ก่อนเผยแพร่";
      if (!product.category?.trim()) e.category = "กรุณาเลือก/กรอกหมวดหมู่ก่อนเผยแพร่";
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
        promoPrice: product.promoPrice === "" ? null : product.promoPrice,
        price: Number(product.price || 0),
        cost: Number(product.cost || 0),
        stockTotal: Number(product.stockTotal || 0),
        reservedStock: Number(product.reservedStock || 0),
        // 📝 custom note (optional) threaded into the activityLogs entry
        // that upsertProduct() appends — falls back to its own default.
        _saveNote: saveNote.trim() || undefined,
      };

      upsertProduct({ product: payload, actor: "Admin" });
      backToTable();
    } catch (err) {
      setSaveError(err?.message || "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-wrap">
      <Header />
      <div className="admin-page admin-form-shell">
        <div className="admin-header-row">
          <div>
            <div className="admin-eyebrow">Admin • Product Management</div>
            <h1 className="admin-h1">{id ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}</h1>
          </div>
          <div className="admin-header-actions">
            <button className="admin-btn" type="button" disabled={saving} onClick={() => onSave({ draft: true })}>
              บันทึกเป็น Draft
            </button>
            <button className="admin-btn admin-btn-gold" type="button" disabled={saving} onClick={() => onSave({ draft: false })}>
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button type="button" className="admin-btn" onClick={backToTable}>ยกเลิก</button>
          </div>
        </div>

        {/* Basic */}
        <SectionTitle>ข้อมูลพื้นฐาน</SectionTitle>
        <div className="admin-form-grid">
          <Field label="ชื่อสินค้า" error={errors.name}>
            <input
              className={"admin-input" + (errors.name ? " admin-field-error" : "")}
              value={product.name}
              onChange={(e) => set({ name: e.target.value, seo: { ...(product.seo || {}), urlSlug: product.seo?.urlSlug ? product.seo.urlSlug : slugify(e.target.value) } })}
            />
          </Field>
          <Field label="ชื่ออังกฤษ">
            <input className="admin-input" value={product.enName} onChange={(e) => set({ enName: e.target.value })} />
          </Field>
          <Field label="คำอธิบายสั้น" >
            <input className="admin-input" value={product.descriptionShort} onChange={(e) => set({ descriptionShort: e.target.value })} />
          </Field>
          <Field label="หมวดหมู่" error={errors.category}>
            <input className={"admin-input" + (errors.category ? " admin-field-error" : "")} value={product.category} onChange={(e) => set({ category: e.target.value })} />
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
          <Field label="รายละเอียดสินค้า">
            <textarea className="admin-textarea" rows={4} value={product.details || ""} onChange={(e) => set({ details: e.target.value })} />
          </Field>
          <Field label="จุดเด่นสินค้า (แยกบรรทัด)">
            <textarea className="admin-textarea" rows={4} value={product.highlights || ""} onChange={(e) => set({ highlights: e.target.value })} />
          </Field>
        </div>

        {/* Status */}
        <SectionTitle>สถานะสินค้า</SectionTitle>
        <div className="admin-form-grid">
          <Field label="Status">
            <select className="admin-select" value={product.status} onChange={(e) => set({ status: e.target.value })}>
              {["Draft", "Pending", "Active", "Hidden", "OutOfStock", "Deleted", "Rejected"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Tags (คั่นด้วย comma)">
            <input
              className="admin-input"
              value={(product.tags || []).join(",")}
              onChange={(e) => set({ tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
            />
          </Field>
        </div>

        {/* Media */}
        <SectionTitle hint="รูปหน้าปก + คลังรูปเพิ่มเติม">รูปภาพสินค้า</SectionTitle>
        <div className="admin-cover-row" style={{ marginBottom: 14 }}>
          <img src={product.mainImage || "https://placehold.co/160x160"} alt="main" className="admin-cover-preview" />
          <Field label="URL รูปหน้าปก">
            <input className="admin-input" value={product.mainImage || ""} onChange={(e) => set({ mainImage: e.target.value })} placeholder="https://..." />
          </Field>
        </div>
        <div className="admin-field-label" style={{ marginBottom: 8 }}>คลังรูปเพิ่มเติม (Gallery)</div>
        <GalleryEditor gallery={product.gallery} onChange={(gallery) => set({ gallery })} />

        {/* Price */}
        <SectionTitle>ราคาและต้นทุน</SectionTitle>
        <div className="admin-form-grid is-3">
          <Field label="ราคาปกติ" error={errors.price}>
            <input
              className={"admin-input" + (errors.price ? " admin-field-error" : "")}
              type="number"
              value={product.price ?? 0}
              onChange={(e) => set({ price: Number(e.target.value) })}
            />
          </Field>
          <Field label="ราคาโปร (ถ้ามี)">
            <input
              className="admin-input"
              type="number"
              value={product.promoPrice ?? ""}
              onChange={(e) => set({ promoPrice: e.target.value === "" ? null : Number(e.target.value) })}
              placeholder="(optional)"
            />
          </Field>
          <Field label="ต้นทุน (ภายใน — ไม่แสดงหน้าร้าน)">
            <input className="admin-input" type="number" value={product.cost ?? 0} onChange={(e) => set({ cost: Number(e.target.value) })} />
          </Field>
        </div>

        {/* Inventory */}
        <SectionTitle hint="MVP">สต็อกสินค้า</SectionTitle>
        <div className="admin-form-grid is-4">
          <Field label="SKU" error={errors.sku}>
            <input className={"admin-input" + (errors.sku ? " admin-field-error" : "")} value={product.sku || ""} onChange={(e) => set({ sku: e.target.value })} />
          </Field>
          <Field label="Barcode">
            <input className="admin-input" value={product.barcode || ""} onChange={(e) => set({ barcode: e.target.value })} />
          </Field>
          <Field label="จำนวน">
            <input className="admin-input" type="number" value={product.stockTotal ?? 0} onChange={(e) => set({ stockTotal: Number(e.target.value) })} />
          </Field>
          <Field label="Reserved Stock">
            <input className="admin-input" type="number" value={product.reservedStock ?? 0} onChange={(e) => set({ reservedStock: Number(e.target.value) })} />
          </Field>
          <Field label="แจ้งเตือนเมื่อสต็อกต่ำกว่า">
            <input className="admin-input" type="number" value={product.lowStockThreshold ?? 0} onChange={(e) => set({ lowStockThreshold: Number(e.target.value) })} />
          </Field>
        </div>
        <div className="admin-field-label" style={{ margin: "12px 0 8px" }}>คลังสินค้าแยกตามสาขา</div>
        <WarehousesEditor warehouses={product.warehouses} onChange={(warehouses) => set({ warehouses })} />

        {/* Variants */}
        <SectionTitle hint="ไม่บังคับ — เว้นว่างได้ถ้าสินค้าขายเป็นรายการเดียว">ตัวเลือกสินค้าและ Variant</SectionTitle>
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
        <div className="admin-form-grid is-4">
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
            <input className="admin-input" value={product.shipping?.carrier || ""} onChange={(e) => setShipping({ carrier: e.target.value })} placeholder="เช่น Kerry, Flash" />
          </Field>
          <Field label="ค่าจัดส่ง (บาท)">
            <input
              className="admin-input"
              type="number"
              value={product.shipping?.shippingFee ?? 0}
              onChange={(e) => setShipping({ shippingFee: Number(e.target.value) })}
              disabled={!!product.shipping?.freeShipping}
            />
          </Field>
          <div className="admin-form-full admin-checkbox-field">
            <input
              type="checkbox"
              checked={!!product.shipping?.freeShipping}
              onChange={(e) => setShipping({ freeShipping: e.target.checked })}
              id="freeShipping"
            />
            <label htmlFor="freeShipping">ส่งฟรี</label>
          </div>
        </div>

        {/* SEO */}
        <SectionTitle>SEO</SectionTitle>
        <div className="admin-form-grid">
          <Field label="Meta Title">
            <input className="admin-input" value={product.seo?.metaTitle || ""} onChange={(e) => setSeo({ metaTitle: e.target.value })} />
          </Field>
          <Field label="URL Slug">
            <input className="admin-input" value={product.seo?.urlSlug || ""} onChange={(e) => setSeo({ urlSlug: e.target.value })} />
          </Field>
          <div className="admin-form-full">
            <Field label="Meta Description">
              <input className="admin-input" value={product.seo?.metaDescription || ""} onChange={(e) => setSeo({ metaDescription: e.target.value })} />
            </Field>
          </div>
          <div className="admin-form-full">
            <Field label="Keywords (คั่นด้วย comma)">
              <input className="admin-input" value={product.seo?.keywords || ""} onChange={(e) => setSeo({ keywords: e.target.value })} />
            </Field>
          </div>
        </div>

        {/* Activity logs */}
        <SectionTitle>ประวัติการแก้ไข (Activity Logs)</SectionTitle>
        <div className="admin-panel">
          {(product.activityLogs || []).length === 0 ? (
            <div className="admin-empty-note">ยังไม่มีบันทึก</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(product.activityLogs || []).slice().reverse().map((l, idx) => (
                <div key={idx} className="admin-log-entry">
                  <div className="admin-log-head">
                    <b>{l.who || "Admin"}</b>
                    <span className="admin-log-time">{new Date(l.at).toLocaleString()}</span>
                  </div>
                  <div className="admin-log-note">Note: {l.note}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky save bar */}
        <div className="admin-save-bar">
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="admin-field-label" style={{ marginBottom: 6 }}>บันทึกเพิ่มเติมสำหรับ Activity Log (ไม่บังคับ)</div>
            <input className="admin-input" value={saveNote} onChange={(e) => setSaveNote(e.target.value)} placeholder="เช่น ปรับราคาตามโปรโมชั่นเดือนนี้" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {saveError && <div className="admin-save-status is-error">{saveError}</div>}
            <div className="admin-header-actions">
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
  );
}