import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";

export default function AdminLayout({ children }) {
  const { isAdmin, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const checkAccess = async () => {
      if (loading) return; // ยังโหลด AuthContext อยู่

      if (!isAdmin) {
        // ยังไม่เป็น Admin — ตรวจสอบเพิ่มเติมจาก profiles table
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user;

        if (!sessionUser) {
          window.location.href = "/admin/login";
          return;
        }

        // ใน mock mode หรือไม่มี profiles table ให้ใช้ fallback
        const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "admin@maisonvera.com")
          .split(",")
          .map((e) => e.trim().toLowerCase());

        if (adminEmails.includes((sessionUser.email || "").toLowerCase())) {
          if (active) setChecking(false);
          return;
        }

        // ถ้ามี Supabase จริง ลอง check profiles
        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", sessionUser.id)
            .single();

          if (!active) return;

          if (profileError || profile?.role !== "admin") {
            window.location.href = "/admin/login";
            return;
          }
        } catch (e) {
          console.warn("[AdminLayout] profiles check failed, fallback to email check");
          // fallback: ให้ผ่านถ้า email ตรง
          if (!adminEmails.includes((sessionUser.email || "").toLowerCase())) {
            window.location.href = "/admin/login";
            return;
          }
        }
      }

      if (active) setChecking(false);
    };

    checkAccess();
    return () => { active = false; };
  }, [isAdmin, loading]);

  if (loading || checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fbfaf8" }}>
        <p style={{ textAlign: "center", padding: "4rem", fontSize: "1.1rem", color: "#5c5549" }}>
          กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

