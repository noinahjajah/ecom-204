import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function AuthCallback() {
  const [status, setStatus] = useState("loading"); // loading | error

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

      const userId = data.session.user.id;

      // ดึง Role จากตาราง Profiles มาตรวจสอบ
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      const role = profileError ? "user" : profile.role;

      // 1. ถ้า Database บอกว่าคนนี้คือ Admin ให้ไปหน้า Dashboard เสมอ (แก้ปัญหา Google ตัด URL)
      if (role === "admin") {
        window.location.href = "/admin/dashboard";
        return;
      }

      // 2. ถ้าไม่ใช่ Admin แต่ตั้งใจจะเข้าผ่านหน้า Admin Login (ลักลอบเข้า)
      if (isAdminIntent && role !== "admin") {
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