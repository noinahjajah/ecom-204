import React, { useState } from "react";
import "./Login.css";
import Header from "./Header";
import { supabase } from "./supabaseClient";

const ADMIN_EMAILS = ["admin@maisonvera.com"];
const ADMIN_PASSWORD = "admin123";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isAdminEmail = (e) => ADMIN_EMAILS.includes(e.toLowerCase().trim());

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setLoading(true);

    try {
      if (isAdminEmail(email)) {
        if (password !== ADMIN_PASSWORD) {
          setError("รหัสผ่าน Admin ไม่ถูกต้อง");
          setLoading(false);
          return;
        }

        const session = {
          access_token: "admin_token_" + Date.now(),
          token_type: "bearer",
          expires_in: 86400,
          user: {
            id: "admin-" + Date.now(),
            email: email.toLowerCase().trim(),
            email_confirmed_at: new Date().toISOString(),
            user_metadata: { full_name: "Admin Maison Véra", name: "Admin Maison Véra" },
            app_metadata: { provider: "email", role: "admin" },
          },
        };

        window.localStorage.setItem("mv_mock_session", JSON.stringify(session));
        window.location.href = "/admin/orders";
        return;
      }

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authErr) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      window.location.href = "/";
    } catch (err) {
      console.error("[Login] Unexpected error:", err);
      setError("เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่ภายหลัง");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const { error: authErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth/callback",
          queryParams: { prompt: "select_account consent" },
        },
      });
      if (authErr) {
        setError(authErr.message || "ไม่สามารถเชื่อมต่อ Google ได้");
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
      <Header />

      <div className="auth">
        {/* Left Panel - Brand */}
        <div className="auth-panel">
          <div className="auth-panel-top">
            <div className="logo"><span></span></div>
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
          <div className="auth-panel-bottom">
            © {new Date().getFullYear()} Maison Véra · Bangkok, Thailand
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="auth-form-wrap">
          <div className="auth-form-inner">
            <span className="eyebrow">Welcome Back</span>
            <h1 className="display auth-title">เข้าสู่ระบบ</h1>
            <p className="auth-sub">
              ยินดีต้อนรับกลับมา เข้าสู่ระบบเพื่อดูคำสั่งซื้อ สิทธิพิเศษ และรายการโปรดของคุณ
            </p>

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

            <form onSubmit={handleLogin}>
              <div className="field">
                <label htmlFor="login-email">อีเมล</label>
                <div className="field-input-row">
                  <input 
                    id="login-email" 
                    name="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email} 
                    onChange={(e) => { setEmail(e.target.value); setError(""); }} 
                    disabled={loading || googleLoading} 
                    autoComplete="email" 
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="login-password">รหัสผ่าน</label>
                <div className="field-input-row">
                  <input 
                    id="login-password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="รหัสผ่านของคุณ" 
                    value={password} 
                    onChange={(e) => { setPassword(e.target.value); setError(""); }} 
                    disabled={loading || googleLoading} 
                    autoComplete="current-password" 
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

              <div className="form-row-between">
                <label className="checkbox-row">
                  <input type="checkbox" defaultChecked={true} />
                  จดจำฉันไว้
                </label>
                <a href="#forgot" className="link-muted">ลืมรหัสผ่าน?</a>
              </div>

              <button className="btn-primary-full" type="submit" disabled={loading || googleLoading}>
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>

            <div className="divider-row">หรือ</div>

            <button 
              className="btn-social" 
              type="button" 
              onClick={handleGoogleLogin} 
              disabled={loading || googleLoading} 
              style={{ width: "100%", justifyContent: "center", marginBottom: "30px" }}
            >
              {googleLoading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    width: 16, height: 16,
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
                  เข้าสู่ระบบด้วย Google
                </>
              )}
            </button>

            <p className="auth-footer-note">
              ยังไม่มีบัญชี?{" "}
              <a href="/register">สมัครสมาชิก</a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

