import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function AuthCallback() {
  const [status, setStatus] = useState("loading"); // loading | error

  useEffect(() => {
    const isAdminIntent = window.location.href.includes("admin=1");

    supabase.auth.getSession().then(async ({ data, error }) => {
      console.log("=== DEBUG: session ===", data.session);
      console.log("=== DEBUG: session error ===", error);

      if (error || !data.session) {
        setStatus("error");
        setTimeout(() => {
          window.location.href = isAdminIntent ? "/admin/login" : "/login";
        }, 1500);
        return;
      }

      const userId = data.session.user.id;
      console.log("=== DEBUG: userId ===", userId);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      console.log("=== DEBUG: profile ===", profile);
      console.log("=== DEBUG: profileError ===", profileError);

      const role = profileError ? "user" : profile.role;
      console.log("=== DEBUG: final role ===", role);

      if (role === "admin") {
        window.location.href = "/admin/dashboard";
        return;
      }

      if (isAdminIntent && role !== "admin") {
        setStatus("error");
        await supabase.auth.signOut();
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 1800);
        return;
      }

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