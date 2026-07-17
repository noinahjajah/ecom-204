import React, { useState } from "react";
import "./Login.css";

/**
 * Login — หน้าลอกอินเวบอีคอมเมิรเครื่องสำอาง
 * ีมเดียวกับ Home.jsx (White Luxury — ivory / ink / muted gold, Fraunces + Jost)
 *
 * วิีใช้: import Login from "./Login"; แล้ววาง <Login /> ใน route "/login"
 * เชื่อมต่อ handleSubmit เข้ากับ API ลอกอินจริงของปรเจกตได้ที่ TODO ด้านล่าง
 */

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (!form.email) next.email = "กรุากรอกอีเมล";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "รปแบบอีเมลไม่ถกต้อง";
    if (!form.password) next.password = "กรุากรอกรหัสผ่าน";
    else if (form.password.length < 6) next.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSuccess(true);
    } catch (err) {
      setErrors({ form: "อีเมลหรือรหัสผ่านไม่ถกต้อง กรุาลองใหม่" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="announce">จัดส่งฟรีทุกออเดอรตั้งแต่ 1,500 บาท · แถมกระเปาผ้าลิมิเตด</div>

      <header className="header">
        <div className="logo">
          MAISON<span> Véra</span>
        </div>
        <nav>
          <ul className="nav">
            <li><a href="/">หน้าแรก</a></li>
            <li><a href="/">สกินแคร</a></li>
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
          <a className="icon-btn" aria-label="บัชีของัน" href="/login">
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
              "ความงามที่แท้จริง เริ่มต้นจากการดแลตัวเองด้วยความใส่ใจทุกวัน"
            </blockquote>
            <cite>— Maison Véra</cite>
          </div>
          <div className="auth-panel-bottom">© {new Date().getFullYear()} Maison Véra · Bangkok, Thailand</div>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-form-inner">
            <span className="eyebrow">Welcome Back</span>
            <h1 className="display auth-title">เข้าส่ระบบ</h1>
            <p className="auth-sub">
              ยินดีต้อนรับกลับมา เข้าส่ระบบเพื่อดคำสั่งื้อ สิทิพิเศษ
              และรายการปรดของคุ ยังไม่มีบัชี?{" "}
              <a href="#register">สมัครสมาชิกที่นี่</a>
            </p>

            {success ? (
              <div className="toast-success">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                เข้าส่ระบบสำเรจ กำลังพาคุไปยังหน้าหลัก...
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {errors.form && <div className="field-error" style={{ marginBottom: 20 }}>{errors.form}</div>}

                <div className="field">
                  <label htmlFor="email">อีเมล</label>
                  <div className="field-input-row">
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange("email")}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <div className="field-error">{errors.email}</div>}
                </div>

                <div className="field">
                  <label htmlFor="password">รหัสผ่าน</label>
                  <div className="field-input-row">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange("password")}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="field-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                          <path d="M9.4 5.5A10.5 10.5 0 0 1 12 5c6 0 9.5 6 9.5 6a15.6 15.6 0 0 1-3.2 3.9M6.6 6.6C4 8.3 2.5 11 2.5 11s3.5 6 9.5 6a9.8 9.8 0 0 0 3.4-.6" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <div className="field-error">{errors.password}</div>}
                </div>

                <div className="form-row-between">
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    จดจำันไว้
                  </label>
                  <a href="#forgot" className="link-muted">ลืมรหัสผ่าน?</a>
                </div>

                <button type="submit" className="btn-primary-full" disabled={loading}>
                  {loading ? "กำลังเข้าส่ระบบ..." : "เข้าส่ระบบ"}
                </button>
              </form>
            )}

            <div className="divider-row">หรือเข้าส่ระบบด้วย</div>

            <div className="social-row">
              <button className="btn-social" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.85-.08-1.66-.22-2.44H12v4.62h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.89c2.28-2.1 3.55-5.2 3.55-8.8Z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3c-1.08.73-2.46 1.16-4.06 1.16-3.12 0-5.77-2.11-6.72-4.94H1.27v3.1C3.25 21.3 7.28 24 12 24Z"/><path fill="#FBBC05" d="M5.28 14.32A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.58.38-2.32v-3.1H1.27A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.27 5.42l4.01-3.1Z"/><path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.25 2.7 1.27 6.58l4.01 3.1C6.23 6.85 8.88 4.77 12 4.77Z"/></svg>
                Google
              </button>
              <button className="btn-social" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.5h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.5h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"/></svg>
                Facebook
              </button>
            </div>

            <p className="auth-footer-note">
              การเข้าส่ระบบถือว่าคุยอมรับ <a href="#terms">เงื่อนไขการใช้งาน</a> และ{" "}
              <a href="#privacy">นยบายความเปนส่วนตัว</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
