import React from "react";
import { supabase } from "../supabaseClient"; 
import "../Login.css"; 

export default function AdminLogin() {
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?admin=1`,
          // อัปเดตตรงนี้: เพิ่มคำว่า consent เข้าไปด้วย 
          queryParams: {
            prompt: 'select_account consent', 
          },
        }
      });

      if (error) {
        console.error("เกิดข้อผิดพลาดในการล็อกอิน:", error.message);
      }
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  return (
    <div className="auth">
      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <span className="eyebrow">Admin Access</span>
          <h1 className="display auth-title">เข้าสู่ระบบแอดมิน</h1>
          <p className="auth-sub">สำหรับผู้ดูแลระบบเท่านั้น เข้าสู่ระบบด้วยบัญชี Google ที่ได้รับสิทธิ์แอดมิน</p>

          <button className="btn-primary-full" type="button" onClick={handleGoogleLogin} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.85-.08-1.66-.22-2.44H12v4.62h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.89c2.28-2.1 3.55-5.2 3.55-8.8Z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3c-1.08.73-2.46 1.16-4.06 1.16-3.12 0-5.77-2.11-6.72-4.94H1.27v3.1C3.25 21.3 7.28 24 12 24Z"/><path fill="#FBBC05" d="M5.28 14.32A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.58.38-2.32v-3.1H1.27A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.27 5.42l4.01-3.1Z"/><path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.25 2.7 1.27 6.58l4.01 3.1C6.23 6.85 8.88 4.77 12 4.77Z"/></svg>
            เข้าสู่ระบบด้วย Google
          </button>
        </div>
      </div>
    </div>
  );
}