import React, { useState } from "react";
import "./Login.css";
import { supabase } from "./supabaseClient";

/**
 * Register — หน้าสมัครสมาชิก
 * ธีมเดียวกับ Login.jsx (White Luxury — ivory / ink / muted gold, Fraunces + Jost)
 * รองรับการสมัครด้วยอีเมล/รหัสผ่าน และ Google OAuth
 */

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!form.fullName.trim()) {
      setError("กรุณากรอกชื่อ-นามสกุล");
      return false;
    }
    if (!form.email.trim()) {
      setError("กรุณากรอกอีเมล");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง");
      return false;
    }
    if (!form.password) {
      setError("กรุณากรอกรหัสผ่าน");
      return false;
    }
    if (form.password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName.trim(),
            name: form.fullName.trim(),
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setError("อีเมลนี้ลงทะเบียนไปแล้ว กรุณาเข้าสู่ระบบ");
        } else if (error.message.includes("password")) {
          setError("รหัสผ่านไม่ปลอดภัย กรุณาใช้รหัสผ่านที่รัดกุมยิ่งขึ้น");
        } else {
          setError(error.message || "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่ภายหลัง");
        }
        return;
      }

      if (data?.user?.identities?.length === 0) {
        // อีเมลนี้มีในระบบแล้ว แต่ยังไม่ยืนยัน (ถ้าเปิด confirm email)
        setSuccess("อีเมลนี้ลงทะเบียนแล้ว กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน หรือเข้าสู่ระบบ");
        return;
      }

      // สมัครสำเร็จ
      setSuccess("สมัครสมาชิกสำเร็จ! กำลังนำคุณไปยังหน้าแรก...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      console.error("Register error:", err);
      setError("เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่ภายหลัง");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { prompt: "select_account consent" },
        },
      });

      if (error) {
        setError(error.message || "ไม่สามารถเชื่อมต่อ Google ได้");
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง");
      setGoogleLoading(false);
    }
  };

  return (
    <>
      {/* Header ใช้ style เดียวกับ Login */}
      <div className="announce">จัดส่งฟรีทุกออเดอร์ตั้งแต่ 1,500 บาท · แถมกระเป๋าผ้าลิมิเต็ด</div>
      <header className="header">
        <div className="logo">
          MAISON<span> Véra</span>
        </div>
      </header>

      <div className="auth">
        {/* Left: Brand Panel */}
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
              "ทุกการเริ่มต้นที่สวยงาม เริ่มต้นด้วยการดูแลตัวเอง"
            </blockquote>
            <cite>— Maison Véra</cite>
          </div>
          <div className="auth-panel-bottom">
            © {new Date().getFullYear()} Maison Véra · Bangkok, Thailand
          </div>
        </div>

        {/* Right: Form Panel */}
        <div className="auth-form-wrap">
          <div className="auth-form-inner">
            <span className="eyebrow">Join Us</span>
            <h1 className="display auth-title">สมัครสมาชิก</h1>
            <p className="auth-sub">
              สมัครสมาชิกเพื่อรับสิทธิพิเศษ ส่วนลดแรกเริ่ม และติดตามคำสั่งซื้อของคุณ
            </p>

            {/* Error / Success Messages */}
            {error && (
              <div className="toast-error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="toast-success" role="status">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {success}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister}>
              <div className="field">
                <label htmlFor="fullName">ชื่อ-นามสกุล</label>
                <div className="field-input-row">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="เช่น สมชาย ใจดี"
                    value={form.fullName}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="email">อีเมล</label>
                <div className="field-input-row">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="password">รหัสผ่าน</label>
                <div className="field-input-row">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="field-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
                <div className="field-input-row">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                className="btn-primary-full"
                type="submit"
                disabled={loading}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16,
                      height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid #fff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.6s linear infinite",
                    }} />
                    กำลังสมัครสมาชิก...
                  </>
                ) : (
                  "สมัครสมาชิก"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider-row">หรือ</div>

            {/* Google Login */}
            <button
              className="btn-social"
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {googleLoading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid #fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.6s linear infinite",
                  }} />
                  กำลังเชื่อมต่อ Google...
                </span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.5 12.3c0-.85-.08-1.66-.22-2.44H12v4.62h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.89c2.28-2.1 3.55-5.2 3.55-8.8Z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3c-1.08.73-2.46 1.16-4.06 1.16-3.12 0-5.77-2.11-6.72-4.94H1.27v3.1C3.25 21.3 7.28 24 12 24Z" />
                    <path fill="#FBBC05" d="M5.28 14.32A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.58.38-2.32v-3.1H1.27A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.27 5.42l4.01-3.1Z" />
                    <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.25 2.7 1.27 6.58l4.01 3.1C6.23 6.85 8.88 4.77 12 4.77Z" />
                  </svg>
                  สมัครสมาชิกด้วย Google
                </>
              )}
            </button>

            {/* Login Link */}
            <p className="auth-footer-note" style={{ marginTop: "24px" }}>
              มีบัญชีอยู่แล้ว?{" "}
              <a href="/login">เข้าสู่ระบบ</a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .toast-error {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fdf0ef;
          border: 1px solid #e8b4b0;
          color: #a24b3f;
          padding: 14px 16px;
          font-size: 0.86rem;
          margin-bottom: 28px;
        }
      `}</style>
    </>
  );
}

