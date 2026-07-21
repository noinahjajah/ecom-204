import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "./AuthContext";

// Admin emails จำลอง (สำหรับ mock mode)
const MOCK_ADMIN_EMAILS = ["admin@maisonvera.com"];

export default function AuthCallback() {
  const [status, setStatus] = useState("loading"); // loading | error
  const { refreshSession } = useAuth();

  useEffect(() => {
    // เช็คเผื่อไว้ ในกรณีที่ Parameter ไม่ถูกตัด หรือหลุดไปอยู่ใน Hash
    const isAdminIntent = window.location.href.includes("admin=1");

    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error || !data.session) {
        setStatus("error");
        setTimeout(() => {
          window.location.href = isAdminIntent ? "/admin/login" : "/login";
        }, 1500);
        return;
      }

      const userEmail = data.session.user.email || "";

      // Mock: ตรวจสอบ admin จากรายการที่กำหนดไว้
      const isAdmin = MOCK_ADMIN_EMAILS.includes(userEmail);

      // Refresh session ใน auth context
      await refreshSession();

      // 1. ถ้าคนนี้คือ Admin ให้ไปหน้า Dashboard เสมอ
      if (isAdmin) {
        window.location.href = "/admin/orders";
        return;
      }

      // 2. ถ้าไม่ใช่ Admin แต่ตั้งใจจะเข้าผ่านหน้า Admin Login (ลักลอบเข้า)
      if (isAdminIntent && !isAdmin) {
        setStatus("error");
        await supabase.auth.signOut(); // บังคับเตะออก
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 1800);
        return;
      }

      // 3. ถ้าเป็นผู้ใช้งานทั่วไป (User)
      window.location.href = "/";
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf7f2" }}>
      <p style={{ textAlign: "center", padding: "4rem", fontSize: "1.1rem", color: "#5c5549" }}>
        {status === "error"
          ? "เข้าสู่ระบบไม่สำเร็จ หรือบัญชีนี้ไม่มีสิทธิ์เข้าถึง กำลังพากลับ..."
          : "กำลังตรวจสอบสิทธิ์เข้าสู่ระบบ..."}
      </p>
    </div>
  );
}
