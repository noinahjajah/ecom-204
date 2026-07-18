import React from "react";
import "./Login.css";

/**
 * Login — หน้าล็อกอินเว็บอีคอมเมิร์ซเครื่องสำอาง (เหลือแค่ Google Login)
 * ธีมเดียวกับ Home.jsx (White Luxury — ivory / ink / muted gold, Fraunces + Jost)
 */

export default function Login() {
  const handleGoogleLogin = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redirectTo: `${window.location.origin}/auth/callback` }),
      });
      const data = await res.json();
      
      if (data.url) {
        // ดึง URL ที่ได้จาก Backend มาเติมคำสั่งบังคับเลือกบัญชี
        const finalUrl = new URL(data.url);
        finalUrl.searchParams.set("prompt", "select_account consent");
        
        // ส่งผู้ใช้ไปยัง URL ที่แก้ไขแล้ว
        window.location.href = finalUrl.toString();
      } else {
        console.error("ไม่ได้รับ URL สำหรับ Google login:", data);
      }
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  return (
    <>
      <div className="announce">จัดส่งฟรีทุกออเดอร์ตั้งแต่ 1,500 บาท · แถมกระเป๋าผ้าลิมิเต็ด</div>

      <header className="header">
        <div className="logo">
          MAISON<span> Véra</span>
        </div>
        <nav>
          <ul className="nav">
            <li><a href="/">หน้าแรก</a></li>
            <li><a href="/">สกินแคร์</a></li>
            <li><a href="/">เมคอัพ</a></li>
            <li><a href="/">เกี่ยวกับเรา</a></li>
          </ul>
        </nav>
        <div className="header-icons">
          <button className="icon-btn" aria-label="ค้นหา" type="button">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <a className="icon-btn" aria-label="บัญชีของฉัน" href="/login">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>
          </a>
          <button className="icon-btn" aria-label="ตะกร้าสินค้า" type="button">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M6 8h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span className="bag-count">2</span>
          </button>
        </div>
      </header>

      <div className="auth">
        <div className="auth-panel">
          <div className="auth-panel-top">
            <div className="logo">
              <span></span>
            </div>
          </div>
          <div className="auth-panel-mid">
            <div className="auth-droplet">
              <div className="ring">
                <div className="core"></div>
              </div>
            </div>
            <blockquote className="display">
              "ความงามที่แท้จริง เริ่มต้นจากการดูแลตัวเองด้วยความใส่ใจทุกวัน"
            </blockquote>
            <cite>— Maison Véra</cite>
          </div>
          <div className="auth-panel-bottom">© {new Date().getFullYear()} Maison Véra · Bangkok, Thailand</div>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-form-inner">
            <span className="eyebrow">Welcome Back</span>
            <h1 className="display auth-title">เข้าสู่ระบบ</h1>
            <p className="auth-sub">
              ยินดีต้อนรับกลับมา เข้าสู่ระบบด้วยบัญชี Google เพื่อดูคำสั่งซื้อ
              สิทธิพิเศษ และรายการโปรดของคุณ
            </p>

            <button className="btn-primary-full" type="button" onClick={handleGoogleLogin} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.85-.08-1.66-.22-2.44H12v4.62h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.89c2.28-2.1 3.55-5.2 3.55-8.8Z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3c-1.08.73-2.46 1.16-4.06 1.16-3.12 0-5.77-2.11-6.72-4.94H1.27v3.1C3.25 21.3 7.28 24 12 24Z"/><path fill="#FBBC05" d="M5.28 14.32A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.58.38-2.32v-3.1H1.27A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.27 5.42l4.01-3.1Z"/><path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.25 2.7 1.27 6.58l4.01 3.1C6.23 6.85 8.88 4.77 12 4.77Z"/></svg>
              เข้าสู่ระบบด้วย Google
            </button>

            <p className="auth-footer-note">
              การเข้าสู่ระบบถือว่าคุณยอมรับ <a href="#terms">เงื่อนไขการใช้งาน</a> และ{" "}
              <a href="#privacy">นโยบายความเป็นส่วนตัว</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}