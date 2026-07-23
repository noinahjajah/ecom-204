import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./Header";
import {
  getCart,
  clearCart,
  computeTotals,
  getAppliedCoupon,
  clearAppliedCoupon,
  getSavedCards,
  saveCard,
  getSavedAddresses,
  saveAddress,
  subscribeAddresses,
  saveOrder,
  deductStock,
  createRouvoOrder,
  createSuperbetTracking,
} from "./cart";
import { onlyDigits, formatCardNumber, formatExpiry, luhnCheck, detectCardBrand, isExpiryValid, isCvvValid, generateOrderId } from "./payment";
import { supabase } from "./supabaseClient";
import "./CheckoutPage.css";

// key เดียวกับที่ CartPage.jsx / ProductDetailPage.jsx ใช้จำหน้าที่ตั้งใจจะไป
// ก่อนถูกเด้งไป login (ให้ AuthCallback.jsx อ่านแล้วเด้งกลับมาที่นี่)
const REDIRECT_AFTER_LOGIN_KEY = "mv_redirect_after_login";

function formatTHB(n) {
  return (Number(n) || 0).toLocaleString("th-TH") + " บาท";
}

export default function CheckoutPage() {
  const [cart, setCart] = useState(() => getCart());
  const [savedCards, setSavedCards] = useState(() => getSavedCards());
  const [savedAddresses, setSavedAddresses] = useState(() => getSavedAddresses());
  const [selectedSavedCardId, setSelectedSavedCardId] = useState("new");
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState("new");
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [trackingInfo, setTrackingInfo] = useState(null);

  // Card refs (uncontrolled to prevent cursor jump)
  const numberRef = useRef("");
  const expiryRef = useRef("");
  const cvcRef = useRef("");
  const nameRef = useRef("");
  const numberInputRef = useRef(null);
  const expiryInputRef = useRef(null);
  const cvcInputRef = useRef(null);

  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    province: "",
    postcode: "",
    preferredCarrier: "superbet",
  });

  // Load cart
  useEffect(() => {
    setCart(getCart());
  }, []);

  // ต้อง login ก่อนถึงจะเข้าหน้า checkout ได้ (เหมือน CartPage.jsx / ProductDetailPage.jsx
  // ที่เช็คก่อนพาไป /checkout อยู่แล้ว — เพิ่มเช็คซ้ำตรงนี้เผื่อมีคนเข้าหน้านี้ตรงๆ
  // โดยไม่ผ่านปุ่มที่เช็ค session ไว้ก่อน, และ backend เองก็ปฏิเสธ decrement-stock
  // ถ้าไม่มี token อยู่ดี)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.localStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, "/checkout");
        window.location.href = "/login";
      }
    });
  }, []);

  // Load addresses
  useEffect(() => {
    const unsub = subscribeAddresses(() => {
      const addrs = getSavedAddresses();
      setSavedAddresses(addrs);
      if (addrs.length > 0 && selectedSavedAddressId === "new") {
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        setSelectedSavedAddressId(def.id);
        setUseNewAddress(false);
        setShipping({
          fullName: def.fullName || def.name || "",
          phone: def.phone || "",
          email: def.email || "",
          address: def.address || def.line1 || "",
          district: def.district || def.city || "",
          province: def.province || def.state || "",
          postcode: def.postcode || "",
          preferredCarrier: def.preferredCarrier || "superbet",
        });
      }
    });
    return () => unsub();
  }, []);

  // Load cards
  useEffect(() => {
    const cards = getSavedCards();
    setSavedCards(cards);
    if (cards.length > 0) setSelectedSavedCardId(cards[0].id);
  }, []);

  const totals = useMemo(() => computeTotals(cart), [cart]);

  const handleAddressChange = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectAddress = (id) => {
    setSelectedSavedAddressId(id);
    if (id === "new") {
      setUseNewAddress(true);
      setShipping({
        fullName: "", phone: "", email: "", address: "",
        district: "", province: "", postcode: "", preferredCarrier: "superbet",
      });
    } else {
      setUseNewAddress(false);
      const addr = savedAddresses.find((a) => a.id === id);
      if (addr) {
        setShipping({
          fullName: addr.fullName || addr.name || "",
          phone: addr.phone || "",
          email: addr.email || "",
          address: addr.address || addr.line1 || "",
          district: addr.district || addr.city || "",
          province: addr.province || addr.state || "",
          postcode: addr.postcode || "",
          preferredCarrier: addr.preferredCarrier || "superbet",
        });
      }
    }
  };

  const validateShipping = () => {
    const s = shipping;
    if (!s.fullName?.trim()) return "กรุณากรอกชื่อ-นามสกุล";
    if (!s.phone?.trim()) return "กรุณากรอกเบอร์โทรศัพท์";
    if (!/^0[0-9]{8,9}$/.test(s.phone.replace(/\s/g, ""))) return "เบอร์โทรศัพท์ไม่ถูกต้อง";
    if (!s.email?.trim()) return "กรุณากรอกอีเมล";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) return "อีเมลไม่ถูกต้อง";
    if (!s.address?.trim()) return "กรุณากรอกที่อยู่";
    if (!s.district?.trim()) return "กรุณากรอกเขต/อำเภอ";
    if (!s.province?.trim()) return "กรุณากรอกจังหวัด";
    if (!s.postcode?.trim()) return "กรุณากรอกรหัสไปรษณีย์";
    if (!/^\d{5}$/.test(s.postcode)) return "รหัสไปรษณีย์ไม่ถูกต้อง";
    return "";
  };

  const validateCard = () => {
    if (selectedSavedCardId !== "new") return "";
    const num = onlyDigits(numberRef.current);
    if (num.length < 13 || num.length > 19) return "หมายเลขบัตรไม่ถูกต้อง";
    if (!luhnCheck(num)) return "หมายเลขบัตรไม่ถูกต้อง (Luhn check failed)";
    if (!isExpiryValid(expiryRef.current)) return "วันหมดอายุไม่ถูกต้อง";
    const brand = detectCardBrand(num);
    if (!isCvvValid(cvcRef.current, brand)) return "CVC ไม่ถูกต้อง";
    if ((nameRef.current || "").trim().length < 3) return "กรุณากรอกชื่อบนบัตร";
    return "";
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError("");

    const shipErr = validateShipping();
    if (shipErr) { setError(shipErr); return; }

    const cardErr = validateCard();
    if (cardErr) { setError(cardErr); return; }

    if (cart.length === 0) {
      setError("ตะกร้าสินค้าว่างเปล่า");
      return;
    }

    setIsProcessing(true);

    try {
      const oid = generateOrderId();
      const now = new Date().toISOString();

      // ตัดสต็อก
      // 🔄 CHANGED: deductStock() now wraps decrementStockForOrder(), which
      // is async (hits the backend API). Without awaiting it, the request
      // just fires in the background — checkout would "succeed" on screen
      // even if the stock update failed, and any error would become an
      // unhandled promise rejection instead of landing in the catch block
      // below.
      //
      // ⚠️ decrementStockForOrder ตอนนี้ throw แทนการคืนค่า falsy เวลาสต็อกไม่พอ
      // หรือ session หมดอายุ (ดู backend/services/productsService.js +
      // products_router.js requireAuth) — ต้อง try/catch แยกจาก catch ก้อนใหญ่
      // ด้านล่างเพื่อโชว์ข้อความที่ตรงประเด็นกว่า "เกิดข้อผิดพลาด กรุณาลองใหม่"
      try {
        await deductStock(cart);
      } catch (stockErr) {
        if (stockErr.status === 401) {
          window.localStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, "/checkout");
          window.location.href = "/login";
          return;
        }
        if (stockErr.status === 409 && Array.isArray(stockErr.details)) {
          const names = stockErr.details.map((d) => d.name || d.productId).join(", ");
          setError(`สินค้าต่อไปนี้มีสต็อกไม่พอ: ${names} — กรุณาตรวจสอบตะกร้า`);
        } else {
          setError("สินค้าบางรายการหมดสต็อก กรุณาตรวจสอบตะกร้า");
        }
        setIsProcessing(false);
        return;
      }

      // บัตร
      let paymentMethod = "บัตรเครดิต";
      let cardInfo = null;
      if (selectedSavedCardId === "new") {
        const num = onlyDigits(numberRef.current);
        const brand = detectCardBrand(num);
        cardInfo = { brand, last4: num.slice(-4), expiry: expiryRef.current, name: nameRef.current };
        saveCard(cardInfo);
        paymentMethod = brand;
      } else {
        const sc = savedCards.find((c) => c.id === selectedSavedCardId);
        if (sc) { cardInfo = sc; paymentMethod = sc.brand; }
      }

      // บันทึกที่อยู่ใหม่
      let addrId = selectedSavedAddressId;
      if (useNewAddress || selectedSavedAddressId === "new") {
        const newAddr = saveAddress({
          fullName: shipping.fullName,
          phone: shipping.phone,
          email: shipping.email,
          address: shipping.address,
          district: shipping.district,
          province: shipping.province,
          postcode: shipping.postcode,
          preferredCarrier: shipping.preferredCarrier,
          isDefault: savedAddresses.length === 0,
        });
        addrId = newAddr.id;
      }

      // สร้างออเดอร์
      const order = {
        id: oid,
        items: cart.map((it) => ({ ...it })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        shippingFee: totals.shippingFee,
        total: totals.total,
        appliedCoupon: totals.appliedCoupon,
        status: "รอดำเนินการ",
        paymentMethod,
        cardInfo,
        shippingAddress: { ...shipping },
        addressId: addrId,
        customerName: shipping.fullName,
        customerEmail: shipping.email,
        carrier: shipping.preferredCarrier || "superbet",
        createdAt: now,
        updatedAt: now,
        statusHistory: [{
          status: "รอดำเนินการ",
          at: now,
          note: "สร้างคำสั่งซื้อ",
        }],
      };

      saveOrder(order);

      // 🔄 Sync กับ Rouvo CRM
      await createRouvoOrder(order);

      // 🔄 สร้าง tracking กับ Superbet
      const tracking = await createSuperbetTracking(order);
      if (tracking) {
        setTrackingInfo(tracking);
        order.trackingNumber = tracking.trackingNumber;
        order.trackingUrl = tracking.trackingUrl;
        order.estimatedDelivery = tracking.estimatedDelivery;
        order.carrier = tracking.carrier;
        // อัปเดต order ใน localStorage
        const orders = getOrders();
        const idx = orders.findIndex((o) => o.id === oid);
        if (idx >= 0) {
          orders[idx] = order;
          window.localStorage.setItem("mv_orders", JSON.stringify(orders));
        }
      }

      clearCart();
      clearAppliedCoupon();
      setOrderId(oid);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── หน้าสำเร็จ ──
  if (success) {
    return (
      <div className="checkout-page">
        <Header />
        <div className="checkout-container">
          <div className="checkout-success">
            <div className="checkout-success-icon">✓</div>
            <h2>สั่งซื้อสำเร็จ</h2>
            <p>ขอบคุณสำหรับคำสั่งซื้อ</p>
            <p className="checkout-order-id">Order ID: <b>{orderId}</b></p>

            {trackingInfo && (
              <div className="checkout-tracking">
                <p> ขนส่ง: <b>{trackingInfo.carrier}</b></p>
                <p>เลขพัสดุ: <b>{trackingInfo.trackingNumber}</b></p>
                <a
                  href={trackingInfo.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ display: "inline-block", marginTop: 8 }}
                >
                  ติดตามพัสดุ
                </a>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <a href={`/orders.html?highlight=${encodeURIComponent(orderId)}`} className="btn-primary">
                ติดตามคำสั่งซื้อ
              </a>
              <a href="/" className="btn-secondary" style={{ marginLeft: 10 }}>
                กลับหน้าแรก
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ตะกร้าว่าง ──
  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <Header />
        <div className="checkout-container">
          <div className="checkout-empty">
            <p>ตะกร้าสินค้าว่างเปล่า</p>
            <a href="/" className="btn-primary">เลือกซื้อสินค้า</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
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

        {error && (
          <div className="checkout-error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleCheckout} className="checkout-grid">
          <section className="checkout-main">
            {/* ── ที่อยู่จัดส่ง ── */}
            <div className="checkout-card">
              <h2 className="checkout-section-title"> ที่อยู่จัดส่ง</h2>

              {savedAddresses.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div className="admin-field-label">เลือกที่อยู่</div>
                  <select
                    className="admin-select"
                    value={selectedSavedAddressId}
                    onChange={(e) => handleSelectAddress(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="new">+ ที่อยู่ใหม่</option>
                    {savedAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.fullName || a.name} — {a.address || a.line1} {a.province || a.state} {a.isDefault ? "(ค่าเริ่มต้น)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="checkout-form-grid">
                <div>
                  <label className="checkout-label">ชื่อ-นามสกุล *</label>
                  <input
                    className="checkout-input"
                    value={shipping.fullName}
                    onChange={(e) => handleAddressChange("fullName", e.target.value)}
                    placeholder="ชื่อ-นามสกุล"
                    required
                  />
                </div>
                <div>
                  <label className="checkout-label">เบอร์โทรศัพท์ *</label>
                  <input
                    className="checkout-input"
                    value={shipping.phone}
                    onChange={(e) => handleAddressChange("phone", e.target.value)}
                    placeholder="0812345678"
                    required
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="checkout-label">อีเมล *</label>
                  <input
                    className="checkout-input"
                    type="email"
                    value={shipping.email}
                    onChange={(e) => handleAddressChange("email", e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="checkout-label">ที่อยู่ *</label>
                  <input
                    className="checkout-input"
                    value={shipping.address}
                    onChange={(e) => handleAddressChange("address", e.target.value)}
                    placeholder="บ้านเลขที่ ถนน ซอย"
                    required
                  />
                </div>
                <div>
                  <label className="checkout-label">เขต/อำเภอ *</label>
                  <input
                    className="checkout-input"
                    value={shipping.district}
                    onChange={(e) => handleAddressChange("district", e.target.value)}
                    placeholder="เขต/อำเภอ"
                    required
                  />
                </div>
                <div>
                  <label className="checkout-label">จังหวัด *</label>
                  <input
                    className="checkout-input"
                    value={shipping.province}
                    onChange={(e) => handleAddressChange("province", e.target.value)}
                    placeholder="จังหวัด"
                    required
                  />
                </div>
                <div>
                  <label className="checkout-label">รหัสไปรษณีย์ *</label>
                  <input
                    className="checkout-input"
                    value={shipping.postcode}
                    onChange={(e) => handleAddressChange("postcode", e.target.value)}
                    placeholder="10110"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label className="checkout-label">ขนส่งที่ต้องการ</label>
                  <select
                    className="checkout-input"
                    value={shipping.preferredCarrier}
                    onChange={(e) => handleAddressChange("preferredCarrier", e.target.value)}
                  >
                    <option value="superbet"> Superbet Express (1-2 วัน)</option>
                    <option value="kerry"> Kerry Express (1-3 วัน)</option>
                    <option value="flash"> Flash Express (1-2 วัน)</option>
                    <option value="thailandpost"> Thailand Post EMS (2-3 วัน)</option>
                    <option value="j&t">J&T Express (1-2 วัน)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── ข้อมูลบัตร ── */}
            <div className="checkout-card">
              <h2 className="checkout-section-title"> ข้อมูลการชำระเงิน</h2>

              {savedCards.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div className="admin-field-label">เลือกบัตร</div>
                  <select
                    className="admin-select"
                    value={selectedSavedCardId}
                    onChange={(e) => setSelectedSavedCardId(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="new">+ บัตรใหม่</option>
                    {savedCards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.brand} •••• {c.last4} (หมดอายุ {c.expiry})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedSavedCardId === "new" && (
                <div className="checkout-form-grid">
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="checkout-label">หมายเลขบัตร *</label>
                    <input
                      ref={numberInputRef}
                      className="checkout-input"
                      placeholder="0000 0000 0000 0000"
                      maxLength={23}
                      autoComplete="cc-number"
                      onChange={(e) => { numberRef.current = e.target.value; }}
                      onBlur={(e) => { e.target.value = formatCardNumber(e.target.value); }}
                      onFocus={(e) => { e.target.value = onlyDigits(e.target.value); }}
                    />
                  </div>
                  <div>
                    <label className="checkout-label">วันหมดอายุ (MM/YY) *</label>
                    <input
                      ref={expiryInputRef}
                      className="checkout-input"
                      placeholder="MM/YY"
                      maxLength={5}
                      autoComplete="cc-exp"
                      onChange={(e) => { expiryRef.current = e.target.value; }}
                      onBlur={(e) => { e.target.value = formatExpiry(e.target.value); }}
                    />
                  </div>
                  <div>
                    <label className="checkout-label">CVC *</label>
                    <input
                      ref={cvcInputRef}
                      className="checkout-input"
                      placeholder="123"
                      maxLength={4}
                      autoComplete="cc-csc"
                      onChange={(e) => { cvcRef.current = e.target.value; }}
                      onBlur={(e) => { e.target.value = onlyDigits(e.target.value).slice(0, 4); }}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="checkout-label">ชื่อบนบัตร *</label>
                    <input
                      className="checkout-input"
                      placeholder="FULL NAME"
                      autoComplete="cc-name"
                      onChange={(e) => { nameRef.current = e.target.value; }}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── สรุปยอด ── */}
          <aside className="checkout-sidebar">
            <div className="checkout-summary">
              <h3 className="checkout-summary-title">สรุปคำสั่งซื้อ</h3>
              <div className="checkout-items">
                {cart.map((it) => (
                  <div key={it.id + (it.variant || "")} className="checkout-item">
                    <div className="checkout-item-info">
                      <div className="checkout-item-name">{it.name}</div>
                      {it.variant && <div className="checkout-item-variant">{it.variant}</div>}
                      <div className="checkout-item-qty">x{it.qty}</div>
                    </div>
                    <div className="checkout-item-price">{formatTHB(it.price * it.qty)}</div>
                  </div>
                ))}
              </div>

              <div className="checkout-totals">
                <div className="checkout-total-row">
                  <span>ยอดรวมสินค้า</span>
                  <span>{formatTHB(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="checkout-total-row">
                    <span>ส่วนลด</span>
                    <span style={{ color: "var(--gold)" }}>-{formatTHB(totals.discount)}</span>
                  </div>
                )}
                <div className="checkout-total-row">
                  <span>ค่าจัดส่ง</span>
                  <span>{totals.shippingFee === 0 ? "ฟรี" : formatTHB(totals.shippingFee)}</span>
                </div>
                <div className="checkout-total-row is-grand">
                  <span>ยอดชำระทั้งหมด</span>
                  <span>{formatTHB(totals.total)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary checkout-submit"
                disabled={isProcessing}
              >
                {isProcessing ? "กำลังดำเนินการ..." : `ชำระเงิน ${formatTHB(totals.total)}`}
              </button>

              <p className="checkout-note">
                 ข้อมูลบัตรของคุณถูกเข้ารหัสและไม่ถูกเก็บไว้ในเซิร์ฟเวอร์
                <br />
                การชำระเงินจะถูกจำลองในระบบ (ไม่มีการตัดเงินจริง)
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}