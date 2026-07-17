import React, { useState, useMemo } from "react";
import "./CartPage.css";
import Header from "./Header";

/* ---------------------------------------------
   MAISON Véra — ตะกร้าสินค้า (Cart Page)
--------------------------------------------- */

const INITIAL_ITEMS = [
  {
    id: "silk-serum",
    name: "เซรั่มไหมนุ่ม",
    variant: "Silk Ritual · 30ml",
    price: 2450,
    qty: 1,
  },
  {
    id: "petal-cream",
    name: "ครีมกลีบดอกไม้",
    variant: "Silk Ritual · 50ml",
    price: 1890,
    qty: 2,
  },
];

const THB = (n) =>
  n.toLocaleString("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  });

function Stepper({ qty, onChange }) {
  return (
    <div className="stepper">
      <button aria-label="ลดจำนวน" onClick={() => onChange(Math.max(1, qty - 1))}>
        –
      </button>
      <span aria-live="polite">{qty}</span>
      <button aria-label="เพิ่มจำนวน" onClick={() => onChange(qty + 1)}>
        +
      </button>
    </div>
  );
}

function DropMark({ size = 40 }) {
  // small echo of the hero teardrop/sphere motif, used as a quiet signature
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="22" r="12" fill="url(#g)" />
      <circle
        cx="20"
        cy="22"
        r="16"
        stroke="var(--gold-soft)"
        strokeWidth="0.75"
        opacity="0.5"
      />
      <defs>
        <radialGradient id="g" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="35%" stopColor="var(--gold-soft)" />
          <stop offset="100%" stopColor="var(--gold)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function CartPage() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [promo, setPromo] = useState("");
  const [promoMsg, setPromoMsg] = useState(null);

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [items]
  );
  const FREE_SHIP_THRESHOLD = 1500;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIP_THRESHOLD ? 0 : 120;
  const total = subtotal + shipping;
  const remainingForFreeShip = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);

  const updateQty = (id, qty) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty } : it)));

  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const applyPromo = () => {
    if (!promo.trim()) {
      setPromoMsg({ ok: false, text: "กรุณากรอกรหัสส่วนลด" });
      return;
    }
    setPromoMsg({ ok: false, text: "ไม่พบรหัสนี้ในระบบ" });
  };

  return (
    <div className="page">
      <Header cartHref="/cart" basePath="/" />

      <div className="title-row">
        <h1 className="page-title">ตะกร้าสินค้าของคุณ</h1>
        {items.length > 0 && <span className="count-tag">{items.length} ชิ้น</span>}
      </div>

      <div className="layout">
        <div>
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <DropMark size={56} />
              </div>
              <p className="msg">ตะกร้าของคุณยังว่างอยู่</p>
              <p className="sub">
                เริ่มต้นค้นหาสกินแคร์และเมคอัพที่คัดสรรเพื่อผิวคุณโดยเฉพาะ
              </p>
              <button className="btn-primary">ช้อปคอลเลกชันใหม่</button>
            </div>
          ) : (
            <div className="item-list">
              {items.map((it) => (
                <div className="cart-item" key={it.id}>
                  <div className="thumb" aria-hidden="true" />
                  <div className="info">
                    <p className="name">{it.name}</p>
                    <p className="variant">{it.variant}</p>
                    <button className="remove-btn" onClick={() => removeItem(it.id)}>
                      นำออก
                    </button>
                  </div>
                  <div className="stepper-wrap">
                    <Stepper qty={it.qty} onChange={(q) => updateQty(it.id, q)} />
                  </div>
                  <div className="price-col">
                    <span className="line-total">{THB(it.price * it.qty)}</span>
                    <span className="unit-price">{THB(it.price)} / ชิ้น</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="summary">
          <h2>สรุปคำสั่งซื้อ</h2>

          {items.length > 0 && (
            <>
              <p className="ship-note">
                {remainingForFreeShip > 0 ? (
                  <>
                    ซื้อเพิ่มอีก <strong>{THB(remainingForFreeShip)}</strong> เพื่อรับสิทธิ์จัดส่งฟรี
                  </>
                ) : (
                  <>คุณได้รับสิทธิ์ <strong>จัดส่งฟรี</strong> แล้ว</>
                )}
              </p>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100)}%`,
                  }}
                />
              </div>
            </>
          )}

          <div className="row">
            <span>ยอดรวมสินค้า</span>
            <span>{THB(subtotal)}</span>
          </div>
          <div className="row muted">
            <span>ค่าจัดส่ง</span>
            <span>{shipping === 0 ? "ฟรี" : THB(shipping)}</span>
          </div>
          <hr className="divider" />
          <div className="row total">
            <span>ยอดสุทธิ</span>
            <span>{THB(total)}</span>
          </div>

          <div className="promo">
            <input
              type="text"
              placeholder="รหัสส่วนลด"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
            />
            <button onClick={applyPromo}>ใช้รหัส</button>
          </div>
          {promoMsg && <p className="promo-msg">{promoMsg.text}</p>}

          <button className="btn-primary checkout-btn" disabled={items.length === 0}>
            ดำเนินการชำระเงิน
          </button>
          <p className="secure-note">ชำระเงินอย่างปลอดภัย · เข้ารหัส SSL</p>
        </aside>
      </div>
    </div>
  );
}
