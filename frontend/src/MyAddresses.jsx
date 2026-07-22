import React, { useEffect, useState } from "react";
import "./MyAddresses.css";
import Header from "./Header";
import {
  getSavedAddresses,
  saveAddress,
  removeSavedAddress,
  setDefaultAddress,
  subscribeAddresses,
} from "./cart";
import { supabase } from "./supabaseClient";

/**
 * MyAddresses — หน้าจัดการที่อยู่จัดส่ง
 * เชื่อมต่อกับ Rouvo (CRM) และ Superbet (ขนส่ง)
 * ฟีเจอร์: เพิ่ม/แก้ไข/ลบ/ตั้งค่า default/เลือกขนส่งที่ชอบ
 */

const CARRIERS = [
  { id: "superbet", label: "Superbet Express", icon: "🚚", eta: "1-2 วัน" },
  { id: "kerry", label: "Kerry Express", icon: "📦", eta: "1-3 วัน" },
  { id: "flash", label: "Flash Express", icon: "⚡", eta: "1-2 วัน" },
  { id: "thailandpost", label: "Thailand Post EMS", icon: "✉️", eta: "2-3 วัน" },
  { id: "j&t", label: "J&T Express", icon: "🚀", eta: "1-2 วัน" },
];

const PROVINCES = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร",
  "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท",
  "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง",
  "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม",
  "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส",
  "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์",
  "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา",
  "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์",
  "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน",
  "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง",
  "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย",
  "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ",
  "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี",
  "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย",
  "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์",
  "อุทัยธานี", "อุบลราชธานี",
];

function emptyForm() {
  return {
    id: "",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    province: "",
    postcode: "",
    preferredCarrier: "superbet",
    isDefault: false,
    note: "",
  };
}

function validateForm(form) {
  const errors = {};
  if (!form.fullName?.trim()) errors.fullName = "กรุณากรอกชื่อ-นามสกุล";
  if (!form.phone?.trim()) errors.phone = "กรุณากรอกเบอร์โทรศัพท์";
  else if (!/^0[0-9]{8,9}$/.test(form.phone.replace(/\s/g, ""))) errors.phone = "เบอร์โทรศัพท์ไม่ถูกต้อง";
  if (!form.email?.trim()) errors.email = "กรุณากรอกอีเมล";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "อีเมลไม่ถูกต้อง";
  if (!form.address?.trim()) errors.address = "กรุณากรอกที่อยู่";
  if (!form.district?.trim()) errors.district = "กรุณากรอกเขต/อำเภอ";
  if (!form.province?.trim()) errors.province = "กรุณาเลือกจังหวัด";
  if (!form.postcode?.trim()) errors.postcode = "กรุณากรอกรหัสไปรษณีย์";
  else if (!/^\d{5}$/.test(form.postcode)) errors.postcode = "รหัสไปรษณีย์ไม่ถูกต้อง";
  return errors;
}

export default function MyAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState("");
  const [user, setUser] = useState(null);

  // โหลดข้อมูลผู้ใช้
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.localStorage.setItem("mv_redirect_after_login", "/myaddresses");
        window.location.href = "/login";
        return;
      }
      setUser(data.session.user);
    });
  }, []);

  // โหลดที่อยู่
  useEffect(() => {
    const addrs = getSavedAddresses();
    setAddresses(addrs);
    setLoading(false);

    const unsub = subscribeAddresses((next) => {
      setAddresses(next);
    });
    return () => unsub();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundErrors = validateForm(form);
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) {
      setSaveStatus("กรุณาแก้ไขข้อมูลที่จำเป็น");
      return;
    }

    const payload = {
      ...form,
      id: editingId || undefined,
      isDefault: form.isDefault || addresses.length === 0,
    };

    // บันทึกลง localStorage + sync กับ Rouvo (ถ้ามี API)
    const saved = saveAddress(payload);

    // 🔄 Sync กับ Rouvo CRM (ถ้ามีการตั้งค่า)
    syncWithRouvo(saved, user);

    setSaveStatus("บันทึกที่อยู่สำเร็จ");
    setTimeout(() => {
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      setSaveStatus("");
    }, 800);
  };

  const handleEdit = (addr) => {
    setForm({
      id: addr.id,
      fullName: addr.fullName || addr.name || "",
      phone: addr.phone || "",
      email: addr.email || "",
      address: addr.address || addr.line1 || "",
      district: addr.district || addr.city || "",
      province: addr.province || addr.state || "",
      postcode: addr.postcode || "",
      preferredCarrier: addr.preferredCarrier || "superbet",
      isDefault: addr.isDefault || false,
      note: addr.note || "",
    });
    setEditingId(addr.id);
    setShowForm(true);
    setErrors({});
    setSaveStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("ต้องการลบที่อยู่นี้ใช่หรือไม่?")) return;
    removeSavedAddress(id);
  };

  const handleSetDefault = (id) => {
    setDefaultAddress(id);
  };

  const handleAddNew = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(true);
    setErrors({});
    setSaveStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
    setErrors({});
    setSaveStatus("");
  };

  // 🔄 Sync กับ Rouvo CRM
  async function syncWithRouvo(address, userData) {
    try {
      // ตรวจสอบว่ามี Rouvo API key หรือไม่
      const rouvoKey = import.meta.env?.VITE_ROUVO_API_KEY;
      if (!rouvoKey) return; // ยังไม่ได้ตั้งค่า → ข้าม

      await fetch("https://api.rouvo.com/v1/customers/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${rouvoKey}`,
        },
        body: JSON.stringify({
          customer_email: userData?.email,
          customer_id: userData?.id,
          address: {
            name: address.fullName,
            phone: address.phone,
            line1: address.address,
            city: address.district,
            state: address.province,
            postal_code: address.postcode,
            country: "TH",
            preferred_carrier: address.preferredCarrier,
          },
        }),
      });
    } catch (err) {
      console.warn("Rouvo sync failed (non-critical):", err.message);
    }
  }

  if (loading) {
    return (
      <div className="myaddresses">
        <Header />
        <div className="ma-container">
          <p style={{ textAlign: "center", padding: "4rem", color: "var(--taupe)" }}>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="myaddresses">
      <Header />

      <div className="ma-container">
        <nav className="ma-breadcrumb">
          <a href="/">หน้าแรก</a>
          <span>/</span>
          <span>ที่อยู่ของฉัน</span>
        </nav>

        <div className="ma-head">
          <div>
            <h1 className="ma-title display">ที่อยู่จัดส่ง</h1>
            <p className="ma-sub">จัดการที่อยู่สำหรับการจัดส่ง และเลือกขนส่งที่คุณต้องการ</p>
          </div>
          {!showForm && (
            <button className="btn-primary" onClick={handleAddNew}>
              + เพิ่มที่อยู่ใหม่
            </button>
          )}
        </div>

        {/* ── ฟอร์มเพิ่ม/แก้ไข ── */}
        {showForm && (
          <div className="ma-form-panel">
            <h2 className="ma-form-title">
              {editingId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
            </h2>

            {saveStatus && (
              <div className={`ma-status ${saveStatus.includes("สำเร็จ") ? "success" : "error"}`}>
                {saveStatus}
              </div>
            )}

            <form onSubmit={handleSubmit} className="ma-form-grid">
              <div className="ma-field">
                <label>ชื่อ-นามสกุล <span className="required">*</span></label>
                <input
                  className={errors.fullName ? "error" : ""}
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="ชื่อ-นามสกุลผู้รับ"
                />
                {errors.fullName && <span className="ma-error">{errors.fullName}</span>}
              </div>

              <div className="ma-field">
                <label>เบอร์โทรศัพท์ <span className="required">*</span></label>
                <input
                  className={errors.phone ? "error" : ""}
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="0812345678"
                />
                {errors.phone && <span className="ma-error">{errors.phone}</span>}
              </div>

              <div className="ma-field full">
                <label>อีเมล <span className="required">*</span></label>
                <input
                  type="email"
                  className={errors.email ? "error" : ""}
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@example.com"
                />
                {errors.email && <span className="ma-error">{errors.email}</span>}
              </div>

              <div className="ma-field full">
                <label>ที่อยู่ <span className="required">*</span></label>
                <textarea
                  className={errors.address ? "error" : ""}
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="บ้านเลขที่ ถนน ซอย อาคาร"
                  rows={3}
                />
                {errors.address && <span className="ma-error">{errors.address}</span>}
              </div>

              <div className="ma-field">
                <label>เขต/อำเภอ <span className="required">*</span></label>
                <input
                  className={errors.district ? "error" : ""}
                  value={form.district}
                  onChange={(e) => handleChange("district", e.target.value)}
                  placeholder="เขต/อำเภอ"
                />
                {errors.district && <span className="ma-error">{errors.district}</span>}
              </div>

              <div className="ma-field">
                <label>จังหวัด <span className="required">*</span></label>
                <select
                  className={errors.province ? "error" : ""}
                  value={form.province}
                  onChange={(e) => handleChange("province", e.target.value)}
                >
                  <option value="">-- เลือกจังหวัด --</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.province && <span className="ma-error">{errors.province}</span>}
              </div>

              <div className="ma-field">
                <label>รหัสไปรษณีย์ <span className="required">*</span></label>
                <input
                  className={errors.postcode ? "error" : ""}
                  value={form.postcode}
                  onChange={(e) => handleChange("postcode", e.target.value)}
                  placeholder="10110"
                  maxLength={5}
                />
                {errors.postcode && <span className="ma-error">{errors.postcode}</span>}
              </div>

              {/* <div className="ma-field">
                <label>ขนส่งที่ต้องการ</label>
                <select
                  value={form.preferredCarrier}
                  onChange={(e) => handleChange("preferredCarrier", e.target.value)}
                >
                  {CARRIERS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label} ({c.eta})
                    </option>
                  ))}
                </select>
              </div> */}

              <div className="ma-field full">
                <label>หมายเหตุ (ไม่บังคับ)</label>
                <input
                  value={form.note}
                  onChange={(e) => handleChange("note", e.target.value)}
                  placeholder="เช่น บ้านหลังที่ 2, รหัสประตู 1234"
                />
              </div>

              <div className="ma-field full ma-checkbox">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={(e) => handleChange("isDefault", e.target.checked)}
                />
                <label htmlFor="isDefault">ตั้งเป็นที่อยู่เริ่มต้น</label>
              </div>

              <div className="ma-form-actions">
                <button type="button" className="btn-ghost" onClick={handleCancel}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? "บันทึกการแก้ไข" : "บันทึกที่อยู่"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── รายการที่อยู่ ── */}
        <div className="ma-list">
          {addresses.length === 0 ? (
            <div className="ma-empty">
              <div className="ma-empty-icon">📍</div>
              <p>ยังไม่มีที่อยู่จัดส่ง</p>
              <p className="ma-empty-hint">เพิ่มที่อยู่เพื่อให้การสั่งซื้อครั้งต่อไปรวดเร็วขึ้น</p>
              <button className="btn-primary" onClick={handleAddNew}>
                + เพิ่มที่อยู่ใหม่
              </button>
            </div>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className={`ma-card ${addr.isDefault ? "is-default" : ""}`}>
                {addr.isDefault && (
                  <div className="ma-default-badge">⭐ ที่อยู่เริ่มต้น</div>
                )}

                <div className="ma-card-main">
                  <div className="ma-card-name">{addr.fullName || addr.name}</div>
                  <div className="ma-card-phone">📞 {addr.phone}</div>
                  <div className="ma-card-email">✉️ {addr.email}</div>
                  <div className="ma-card-address">
                    {addr.address || addr.line1}
                    <br />
                    {addr.district || addr.city} {addr.province || addr.state} {addr.postcode}
                  </div>
                  {addr.note && <div className="ma-card-note">📝 {addr.note}</div>}

                  <div className="ma-card-carrier">
                    🚚 ขนส่ง: {CARRIERS.find((c) => c.id === (addr.preferredCarrier || "superbet"))?.label || "Superbet Express"}
                  </div>
                </div>

                <div className="ma-card-actions">
                  {!addr.isDefault && (
                    <button
                      className="ma-btn-secondary"
                      onClick={() => handleSetDefault(addr.id)}
                    >
                      ตั้งเป็นค่าเริ่มต้น
                    </button>
                  )}
                  <button
                    className="ma-btn-edit"
                    onClick={() => handleEdit(addr)}
                  >
                    แก้ไข
                  </button>
                  <button
                    className="ma-btn-delete"
                    onClick={() => handleDelete(addr.id)}
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── ข้อมูลขนส่ง ── */}
        {addresses.length > 0 && (
          <div className="ma-shipping-info">
            <h3 className="ma-shipping-title">🚚 พันธมิตรขนส่ง</h3>
            <div className="ma-carrier-grid">
              {CARRIERS.map((c) => (
                <div key={c.id} className="ma-carrier-card">
                  <span className="ma-carrier-icon">{c.icon}</span>
                  <span className="ma-carrier-name">{c.label}</span>
                  <span className="ma-carrier-eta">{c.eta}</span>
                </div>
              ))}
            </div>
            <p className="ma-shipping-note">
              * ระยะเวลาจัดส่งเป็นการประมาณการ อาจเปลี่ยนแปลงตามสถานการณ์
              <br />
              * สามารถติดตามพัสดุผ่าน <a href="https://superbet.com/track" target="_blank" rel="noreferrer">Superbet Tracking</a> หรือผู้ให้บริการที่เลือก
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
