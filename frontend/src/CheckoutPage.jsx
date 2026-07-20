import React, { useEffect, useMemo, useState } from "react";
import "./CheckoutPage.css";
import Header from "./Header";
import { getCart, clearCart, saveOrder, getSavedCards, saveCard } from "./cart";
import {
  formatCardNumber,
  formatExpiry,
  luhnCheck,
  detectCardBrand,
  isExpiryValid,
  isCvvValid,
  onlyDigits,
  generateOrderId,
} from "./payment";

/**
 * CheckoutPage — หน้าชำระเงินจริง (จบ flow end-to-end): กรอกที่อยู่ → เลือกวิธีชำระ →
 * ตรวจสอบบัตรด้วย Luhn algorithm จริง → จำลองการส่งไปเกตเวย์ → สร้างเลขคำสั่งซื้อ →
 * ล้างตะกร้า → redirect ไปหน้าติดตามคำสั่งซื้อ /orders.html
 *
 * ⚠️ หมายเหตุความปลอดภัย: โปรเจกต์นี้ยังไม่ได้เชื่อมต่อผู้ให้บริการชำระเงินจริง (เช่น Omise,
 * Stripe, 2C2P) จึงไม่มีการตัดเงินจริงเกิดขึ้น — เป็นการจำลองที่ตรวจสอบข้อมูลบัตรแบบเดียวกับ
 * ระบบจริง (Luhn, brand, วันหมดอายุ, CVV) แต่ไม่มีการเก็บเลขบัตรเต็มหรือ CVV ไว้ที่ใดเลย
 * เก็บเฉพาะ brand + เลข 4 ตัวท้าย + วันหมดอายุ เพื่อใช้แสดงผลเท่านั้น
 */

const FREE_SHIPPING_THRESHOLD = 1500;
const SHIPPING_FEE = 60;

function formatTHB(n) {
  return n.toLocaleString("th-TH") + " บาท";
}

export default function CheckoutPage() {
  const [cart, setCart] = useState(() => getCart());
  const [savedCards, setSavedCards] = useState(() => getSavedCards());
  const [selectedSavedCardId, setSelectedSavedCardId] = useState("new");
  const [paymentMethod, setPaymentMethod] = useState("card"); // card | cod | promptpay
  const [saveThisCard, setSaveThisCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    setCart(getCart());
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );
  const shippingFee = cart.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;
  const brand = detectCardBrand(card.number);

  function setShippingField(field) {
    return (e) => {
      setShipping((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: null }));
    };
  }

  function validate() {
    const next = {};

    if (!shipping.fullName.trim()) next.fullName = "กรุณากรอกชื่อผู้รับ";
    if (!/^0\d{8,9}$/.test(onlyDigits(shipping.phone))) next.phone = "กรุณากรอกเบอร์โทรให้ถูกต้อง";
    if (!shipping.address.trim()) next.address = "กรุณากรอกที่อยู่จัดส่ง";

    if (paymentMethod === "card" && selectedSavedCardId === "new") {
      const digits = onlyDigits(card.number);
      if (!luhnCheck(digits)) next.cardNumber = "เลขบัตรไม่ถูกต้อง";
      if (!card.name.trim()) next.cardName = "กรุณากรอกชื่อบนบัตร";
      if (!isExpiryValid(card.expiry)) next.expiry = "วันหมดอายุไม่ถูกต้องหรือหมดอายุแล้ว";
      if (!isCvvValid(card.cvv, brand)) next.cvv = "CVV ไม่ถูกต้อง";
    }

    // แสดง error เฉพาะช่อง
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      console.log("[CheckoutPage] handleSubmit start", {
        cartLen: cart.length,
        paymentMethod,
        selectedSavedCardId,
      });

      if (cart.length === 0) {
        console.error("[CheckoutPage] cart is empty - redirect blocked");
        setErrors((prev) => ({ ...prev, _form: "ตะกร้าว่าง กรุณาเลือกสินค้าอีกครั้ง" }));
        return;
      }

      if (!validate()) {
        console.error("[CheckoutPage] validate failed");
        setErrors((prev) => ({ ...prev, _form: "กรุณาตรวจสอบข้อมูลให้ครบก่อนชำระเงิน" }));
        return;
      }

      setLoading(true);

      // จำลองเวลายืนยันกับเกตเวย์
      await new Promise((resolve) => setTimeout(resolve, 1200));

      let paymentSummary;

      if (paymentMethod === "card") {
        let last4, cardBrand, expiry, cardholderName;

        if (selectedSavedCardId !== "new") {
          const saved = savedCards.find((c) => c.id === selectedSavedCardId);
          last4 = saved.last4;
          cardBrand = saved.brand;
          expiry = saved.expiry;
          cardholderName = saved.name;
        } else {
          const digits = onlyDigits(card.number);
          last4 = digits.slice(-4);
          cardBrand = brand;
          expiry = card.expiry;
          cardholderName = card.name;

          if (saveThisCard) {
            const next = saveCard({ brand: cardBrand, last4, expiry, name: cardholderName });
            setSavedCards(next);
          }
        }

        paymentSummary = { method: "card", brand: cardBrand, last4, expiry, cardholderName };
      } else if (paymentMethod === "promptpay") {
        paymentSummary = { method: "promptpay" };
      } else {
        paymentSummary = { method: "cod" };
      }

      const nowIso = new Date().toISOString();

      const baseTracking = {
        carrier: "Flash Express",
        trackingNumber: `TH${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
        estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
      };

      const newOrder = {
        id: generateOrderId(),
        items: cart,
        subtotal,
        shippingFee,
        total,
        shipping,
        payment: paymentSummary,
        status: "paid",
        createdAt: nowIso,
        statusHistory: [{ status: "paid", at: nowIso, ...baseTracking }],
        trackingNumber: baseTracking.trackingNumber,
        carrier: baseTracking.carrier,
        estimatedDelivery: baseTracking.estimatedDelivery,
      };

      saveOrder(newOrder);
      clearCart();
      setCart([]);
      setLoading(false);
      setSuccess(true);

      // Redirect หลัง success สั้น ๆ
      setTimeout(() => {
        window.location.href = `/orders?highlight=${newOrder.id}`;
      }, 2000);
    } catch (err) {
      console.error("[CheckoutPage] handleSubmit error", err);
      setErrors((prev) => ({ ...prev, _form: "เกิดข้อผิดพลาดในการสั่งซื้อ โปรดลองใหม่" }));
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="checkout">
        <Header />
        <div className="checkout-container">
          <div className="checkout-success">
            <div className="checkout-success-icon">✓</div>
            <h1>ชำระเงินสำเร็จ</h1>
            <p className="checkout-success-sub">ขอบคุณสำหรับคำสั่งซื้อของคุณ</p>
            <p className="checkout-redirect-hint">กำลังพาคุณไปยังหน้าติดตามคำสั่งซื้อ...</p>
            <div className="checkout-success-loader">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !success) {
    return (
      <div className="checkout">
        <Header />
        <div className="checkout-container">
          <div className="checkout-empty">
            <p>ยังไม่มีสินค้าในตะกร้าของคุณ</p>
            <a href="/skincare" className="btn-primary">เลือกซื้อสินค้า</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      <Header />
      <div className="checkout-container">
        <nav className="checkout-breadcrumb">
          <a href="/">หน้าแรก</a>
          <span>/</span>
          <a href="/cart">ตะกร้าสินค้า</a>
          <span>/</span>
          <span>ชำระเงิน</span>
        </nav>

        <h1 className="checkout-title">ชำระเงิน</h1>

        {errors._form && <div className="checkout-error" style={{ marginBottom: 12 }}>{errors._form}</div>}

        <form className="checkout-layout" onSubmit={handleSubmit}>
          <div className="checkout-main">
            <section className="checkout-section">
              <h2>ที่อยู่จัดส่ง</h2>
              <div className="checkout-field">
                <label>ชื่อ-นามสกุลผู้รับ</label>
                <input
                  type="text"
                  value={shipping.fullName}
                  onChange={setShippingField("fullName")}
                  placeholder="เช่น สมชาย ใจดี"
                />
                {errors.fullName && <span className="checkout-error">{errors.fullName}</span>}
              </div>
              <div className="checkout-field">
                <label>เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  value={shipping.phone}
                  onChange={setShippingField("phone")}
                  placeholder="08xxxxxxxx"
                />
                {errors.phone && <span className="checkout-error">{errors.phone}</span>}
              </div>
              <div className="checkout-field">
                <label>ที่อยู่จัดส่ง</label>
                <textarea
                  rows={3}
                  value={shipping.address}
                  onChange={setShippingField("address")}
                  placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                />
                {errors.address && <span className="checkout-error">{errors.address}</span>}
              </div>
            </section>

            <section className="checkout-section">
              <h2>วิธีชำระเงิน</h2>
              <div className="checkout-pay-methods">
                {[
                  { id: "card", label: "บัตรเครดิต / เดบิต" },
                  { id: "promptpay", label: "พร้อมเพย์" },
                  { id: "cod", label: "เก็บเงินปลายทาง" },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    className={`checkout-pay-tab${paymentMethod === m.id ? " is-active" : ""}`}
                    onClick={() => setPaymentMethod(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="checkout-card-form">
                  {savedCards.length > 0 && (
                    <div className="checkout-field">
                      <label>บัตรที่บันทึกไว้</label>
                      <select
                        value={selectedSavedCardId}
                        onChange={(e) => setSelectedSavedCardId(e.target.value)}
                      >
                        <option value="new">ใช้บัตรใหม่</option>
                        {savedCards.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.brand} •••• {c.last4} (หมดอายุ {c.expiry})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedSavedCardId === "new" && (
                    <>
                      <div className="checkout-field">
                        <label>
                          หมายเลขบัตร {card.number && <span className="checkout-brand">{brand}</span>}
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={card.number}
                          onChange={(e) =>
                            setCard((prev) => ({ ...prev, number: formatCardNumber(e.target.value) }))
                          }
                          placeholder="0000 0000 0000 0000"
                          maxLength={23}
                        />
                        {errors.cardNumber && <span className="checkout-error">{errors.cardNumber}</span>}
                      </div>
                      <div className="checkout-field">
                        <label>ชื่อบนบัตร</label>
                        <input
                          type="text"
                          value={card.name}
                          onChange={(e) => setCard((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="เช่น SOMCHAI JAIDEE"
                        />
                        {errors.cardName && <span className="checkout-error">{errors.cardName}</span>}
                      </div>
                      <div className="checkout-field-row">
                        <div className="checkout-field">
                          <label>วันหมดอายุ (MM/YY)</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={card.expiry}
                            onChange={(e) =>
                              setCard((prev) => ({ ...prev, expiry: formatExpiry(e.target.value) }))
                            }
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                          {errors.expiry && <span className="checkout-error">{errors.expiry}</span>}
                        </div>
                        <div className="checkout-field">
                          <label>CVV</label>
                          <input
                            type="password"
                            inputMode="numeric"
                            value={card.cvv}
                            onChange={(e) =>
                              setCard((prev) => ({
                                ...prev,
                                cvv: onlyDigits(e.target.value).slice(0, 4),
                              }))
                            }
                            placeholder="•••"
                            maxLength={4}
                          />
                          {errors.cvv && <span className="checkout-error">{errors.cvv}</span>}
                        </div>
                      </div>
                      <label className="checkout-checkbox">
                        <input
                          type="checkbox"
                          checked={saveThisCard}
                          onChange={(e) => setSaveThisCard(e.target.checked)}
                        />
                        บันทึกบัตรนี้ไว้สำหรับการซื้อครั้งถัดไป (เก็บเฉพาะเลข 4 ตัวท้าย ไม่เก็บ CVV)
                      </label>
                    </>
                  )}

                  <p className="checkout-security-note">
                    การชำระเงินนี้เป็นโหมดจำลองสำหรับโปรเจกต์การศึกษา ระบบตรวจสอบเลขบัตรจริง
                    (Luhn algorithm) แต่ยังไม่ได้เชื่อมต่อผู้ให้บริการชำระเงินจริง จึงไม่มีการตัดเงินเกิดขึ้น
                  </p>
                </div>
              )}

              {paymentMethod === "promptpay" && (
                <div className="checkout-promptpay">
                  <div className="checkout-qr-placeholder">QR พร้อมเพย์</div>
                  <p>สแกน QR เพื่อชำระเงิน {formatTHB(total)} (โหมดจำลอง)</p>
                </div>
              )}

              {paymentMethod === "cod" && (
                <p className="checkout-cod-note">ชำระเงินสดกับพนักงานส่งสินค้าเมื่อได้รับพัสดุ</p>
              )}
            </section>
          </div>

          <aside className="checkout-summary">
            <h2>สรุปคำสั่งซื้อ</h2>
            <div className="checkout-summary-items">
              {cart.map((item) => (
                <div className="checkout-summary-item" key={item.id}>
                  <span className="checkout-summary-item-name">
                    {item.name} <span className="checkout-summary-item-qty">×{item.qty}</span>
                  </span>
                  <span>{formatTHB(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="checkout-summary-rows">
              <div className="checkout-summary-row">
                <span>ยอดรวมสินค้า</span>
                <span>{formatTHB(subtotal)}</span>
              </div>
              <div className="checkout-summary-row">
                <span>ค่าจัดส่ง</span>
                <span>{shippingFee === 0 ? "ฟรี" : formatTHB(shippingFee)}</span>
              </div>
              <div className="checkout-summary-row total">
                <span>ยอดชำระทั้งหมด</span>
                <span>{formatTHB(total)}</span>
              </div>
            </div>
            <button type="submit" className="btn-primary checkout-submit" disabled={loading}>
              {loading ? "กำลังดำเนินการ..." : `ชำระเงิน ${formatTHB(total)}`}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
}

