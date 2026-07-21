import React, { useState, useMemo, useEffect } from "react";
import "./CartPage.css";
import Header from "./Header";
import { getCart, updateQty as storeUpdateQty, removeFromCart, subscribeCart } from "./cart";
import { supabase } from "./supabaseClient";

// key ที่ใช้จำหน้าที่ผู้ใช้ตั้งใจจะไป ก่อนถูกเด้งไป login (ให้ AuthCallback.jsx อ่านแล้วเด้งกลับมาที่นี่)
const REDIRECT_AFTER_LOGIN_KEY = "mv_redirect_after_login";

/**
 * CartPage — หน้าตะกร้าสินค้า เว็บอีคอมเมิร์ซเครื่องสำอาง Maison Véra
 * ธีม: White Luxury (ivory / ink / muted gold) — สีชุดเดียวกับ home.css / Header.css
 * ฟอนต์: Fraunces (display) + Jost + IBM Plex Sans Thai (body)
 *
 * วิธีใช้: import CartPage from "./CartPage"; แล้ววาง <CartPage /> ใน route "/cart"
 * ตะกร้าจริงถูกเก็บใน localStorage ผ่าน cart.js เพื่อให้ข้อมูลคงอยู่หลังรีเฟรช/ปิดเบราว์เซอร์
 * และซิงก์กับปุ่ม "หยิบใส่ตะกร้า" ในหน้า Home / Skincare / Makeup รวมถึงตัวเลขบนไอคอน
 * ตะกร้าใน Header แบบเรียลไทม์ (เพราะแต่ละหน้าโหลดแยกกันจริง ไม่มี router/context ให้แชร์ state)
 */

const coupons = {
  SAVE10: { type: "percent", value: 10, minSpend: 0, max: 300 },
  FREESHIP: { type: "free_shipping", minSpend: 0 },
};

// ตรงกับข้อความใน announcement bar ของ Header ("จัดส่งฟรีทุกออเดอร์ตั้งแต่ 1,500 บาท")
const FREE_SHIPPING_THRESHOLD = 1500;
const SHIPPING_FEE = 60;

function formatTHB(n) {
  return n.toLocaleString("th-TH") + " บาท";
}

/* ── inline icons (สไตล์เดียวกับที่ใช้ใน Header.jsx — ไม่พึ่ง icon library ภายนอก) ── */
const IconMinus = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconPlus = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconClose = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="5" x2="19" y2="19" />
    <line x1="19" y1="5" x2="5" y2="19" />
  </svg>
);
const IconTag = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M20.6 12.6 12 21.2 2.8 12 2.8 2.8 12 2.8Z" />
    <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
const IconBag = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M6 8h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

export default function CartPage() {
  const [cart, setCart] = useState(() => getCart());
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState({ text: "", type: "" });

  // โหลดตะกร้าล่าสุดตอน mount และคอยฟังการเปลี่ยนแปลง (เช่น เพิ่มสินค้าจากแท็บ/หน้าอื่น)
  useEffect(() => {
    setCart(getCart());
    const unsubscribe = subscribeCart((next) => setCart(next));
    return unsubscribe;
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const c = coupons[appliedCoupon];
    if (!c) return 0;
    if (c.type === "percent") return Math.min(subtotal * (c.value / 100), c.max ?? Infinity);
    if (c.type === "fixed") return Math.min(c.value, subtotal);
    return 0;
  }, [appliedCoupon, subtotal]);

  const isFreeShippingCoupon =
    appliedCoupon && coupons[appliedCoupon]?.type === "free_shipping";

  const shippingFee =
    cart.length === 0
      ? 0
      : isFreeShippingCoupon || subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FEE;

  const total = Math.max(subtotal - couponDiscount, 0) + shippingFee;
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const itemCount = cart.reduce((n, item) => n + item.qty, 0);

  function updateQty(id, delta) {
    setCart(storeUpdateQty(id, delta));
  }

  function removeItem(id) {
    setCart(removeFromCart(id));
  }

  function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMsg({ text: "กรุณากรอกโค้ดส่วนลด", type: "error" });
      return;
    }
    const c = coupons[code];
    if (!c) {
      setCouponMsg({ text: "ไม่พบโค้ดนี้ หรือหมดอายุแล้ว", type: "error" });
      return;
    }
    if (subtotal < (c.minSpend || 0)) {
      setCouponMsg({ text: `ต้องซื้อขั้นต่ำ ${formatTHB(c.minSpend)} เพื่อใช้โค้ดนี้`, type: "error" });
      return;
    }
    setAppliedCoupon(code);
    setCouponMsg({ text: "ใช้ส่วนลดสำเร็จ", type: "success" });
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMsg({ text: "", type: "" });
  }

  async function handleCheckout(e) {
    e.preventDefault();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      // ยังไม่ login → จำไว้ว่าจะกลับมาหน้า checkout แล้วเด้งไป login ก่อน
      window.localStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, "/checkout");
      window.location.href = "/login";
      return;
    }

    window.location.href = "/checkout";
  }

  return (
    <div className="cart">
      <Header />

      <div className="cart-container">
        <nav className="cart-breadcrumb">
          <a href="/">หน้าแรก</a>
          <span>/</span>
          <span>ตะกร้าสินค้า</span>
        </nav>

        <div className="cart-head">
          <h1 className="cart-title">ตะกร้าสินค้า</h1>
          {cart.length > 0 && <span className="cart-count">{itemCount} รายการ</span>}
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <IconBag />
            <p>ยังไม่มีสินค้าในตะกร้าของคุณ</p>
            <a href="/skincare" className="btn-primary">
              เลือกซื้อสินค้า
            </a>
          </div>
        ) : (
          <div className="cart-layout">
            {/* ── รายการสินค้า ── */}
            <div className="cart-items">
              <div className="cart-items-head">
                <span>สินค้า</span>
                <span>จำนวน</span>
                <span>ราคารวม</span>
              </div>

              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-main">
                    <div className="cart-item-thumb">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <span className="cart-item-thumb-fallback">
                          {item.category === "เมคอัพ" ? "MU" : "SK"}
                        </span>
                      )}
                    </div>
                    <div className="cart-item-info">
                      <span className="cart-item-category">{item.category}</span>
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-variant">{item.variant}</span>
                      <span className="cart-item-price-mobile">{formatTHB(item.price)}</span>
                      <button className="cart-item-remove" onClick={() => removeItem(item.id)} aria-label="ลบสินค้า">
                        <IconClose /> ลบ
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-qty">
                    <button onClick={() => updateQty(item.id, -1)} disabled={item.qty <= 1} aria-label="ลดจำนวน">
                      <IconMinus />
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} aria-label="เพิ่มจำนวน">
                      <IconPlus />
                    </button>
                  </div>

                  <div className="cart-item-total">{formatTHB(item.price * item.qty)}</div>
                </div>
              ))}
            </div>

            {/* ── สรุปคำสั่งซื้อ ── */}
            <aside className="cart-summary">
              <h2>สรุปคำสั่งซื้อ</h2>

              {amountToFreeShipping > 0 && !isFreeShippingCoupon && (
                <p className="cart-shipping-hint">
                  ซื้อเพิ่มอีก {formatTHB(amountToFreeShipping)} รับส่งฟรี
                </p>
              )}

              <div className="cart-coupon">
                {appliedCoupon ? (
                  <div className="cart-coupon-applied">
                    <span>
                      <IconTag /> {appliedCoupon}
                    </span>
                    <button onClick={removeCoupon}>ลบ</button>
                  </div>
                ) : (
                  <div className="cart-coupon-input">
                    <input
                      type="text"
                      placeholder="โค้ดส่วนลด"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    />
                    <button onClick={applyCoupon}>ใช้โค้ด</button>
                  </div>
                )}
                {couponMsg.text && <p className={`cart-coupon-msg ${couponMsg.type}`}>{couponMsg.text}</p>}
              </div>

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span>ยอดรวมสินค้า</span>
                  <span>{formatTHB(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="cart-summary-row discount">
                    <span>ส่วนลด</span>
                    <span>-{formatTHB(couponDiscount)}</span>
                  </div>
                )}
                <div className="cart-summary-row">
                  <span>ค่าจัดส่ง</span>
                  <span>{shippingFee === 0 ? "ฟรี" : formatTHB(shippingFee)}</span>
                </div>
                <div className="cart-summary-row total">
                  <span>ยอดรวมทั้งหมด</span>
                  <span>{formatTHB(total)}</span>
                </div>
              </div>

              <a href="/checkout" className="btn-primary cart-checkout-btn" onClick={handleCheckout}>
                ดำเนินการชำระเงิน
              </a>
              <a href="/" className="btn-ghost cart-continue-link">
                เลือกซื้อสินค้าต่อ
              </a>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}