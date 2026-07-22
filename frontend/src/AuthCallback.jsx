import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "./AuthContext";

// Admin emails fallback (สำหรับ mock mode หรือตรวจสอบเบื้องต้น)
const FALLBACK_ADMIN_EMAILS = ["admin@maisonvera.com"];

// ฟังก์ชันตรวจสอบ Admin (ใช้ร่วมกับ AuthContext)
function checkIsAdminFallback(email) {
  return FALLBACK_ADMIN_EMAILS.includes((email || "").toLowerCase());
}

export default function AuthCallback() {
  const [status, setStatus] = useState("loading"); // loading | error | success
  const [message, setMessage] = useState("");
  const { refreshSession } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      try {
        // 1. ตรวจสอบ query parameters (จาก URL หรือ hash fragment)
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(
          (window.location.hash || "").replace(/^#/, "?").split("?")[1] || ""
        );
        const isAdminIntent = params.get("admin") === "1" || hashParams.get("admin") === "1";
        const isMockMode = params.get("mock") === "1";

        setMessage("กำลังตรวจสอบสิทธิ์เข้าสู่ระบบ...");

        // 2. ดึง session ปัจจุบันจาก Supabase Auth
        const { data, error } = await supabase.auth.getSession();

        if (cancelled) return;

        if (error) {
          console.error("AuthCallback — getSession error:", error.message);
          setStatus("error");
          setMessage("เข้าสู่ระบบไม่สำเร็จ หรือบัญชีนี้ไม่มีสิทธิ์เข้าถึง กำลังพากลับ...");
          setTimeout(() => {
            window.location.href = isAdminIntent ? "/admin/login" : "/login";
          }, 2000);
          return;
        }

        // 3. Mock mode: ตรวจสอบ localStorage สำหรับ dev/test
        if (isMockMode || !data.session) {
          const raw = window.localStorage.getItem("mv_mock_session");
          if (raw) {
            const session = JSON.parse(raw);
            if (session?.user) {
              // Mock mode: ตรวจสอบ admin email
              const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "admin@maisonvera.com")
                .split(",")
                .map((e) => e.trim().toLowerCase());
              const email = (session.user.email || "").toLowerCase();
              const isAdmin = adminEmails.includes(email) || session.user.app_metadata?.role === "admin";

              await refreshSession();
              if (!cancelled) {
                setStatus("success");
                setMessage("เข้าสู่ระบบสำเร็จ กำลังนำไปยังหน้าที่เหมาะสม...");
                setTimeout(() => {
                  window.location.href = isAdmin ? "/admin/products" : "/";
                }, 500);
              }
              return;
            }
          }

          // ไม่มี session จริงๆ — redirect ไปหน้า login
          console.warn("AuthCallback — ไม่พบ session (อาจยังไม่ล็อกอิน)");
          setStatus("error");
          setMessage("ไม่พบข้อมูลการเข้าสู่ระบบ กำลังพากลับ...");
          setTimeout(() => {
            window.location.href = isAdminIntent ? "/admin/login" : "/login";
          }, 2000);
          return;
        }

        // 4. มี session — ตรวจสอบสิทธิ์ Admin
        const userEmail = data.session.user.email || "";
        const userId = data.session.user.id;

        // ตรวจสอบจาก profiles table (สำหรับ Supabase จริง)
        let isAdmin = false;
        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .single();

          if (!profileError && profile?.role === "admin") {
            isAdmin = true;
          }
        } catch (e) {
          console.warn("AuthCallback — profile check failed, using fallback");
        }

        // Fallback ตรวจสอบจากรายการอีเมล admin
        if (!isAdmin) {
          const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "admin@maisonvera.com")
            .split(",")
            .map((e) => e.trim().toLowerCase());
          isAdmin = adminEmails.includes(userEmail.toLowerCase());
        }

        // Refresh session ใน AuthContext
        try {
          await refreshSession();
        } catch (refreshErr) {
          console.warn("AuthCallback — refreshSession failed:", refreshErr);
        }

        if (cancelled) return;

        setMessage("เข้าสู่ระบบสำเร็จ กำลังนำไปยังหน้าที่เหมาะสม...");
        setStatus("success");

        // 5. Redirect ตามสิทธิ์
        if (isAdmin) {
          setTimeout(() => {
            window.location.href = "/admin/products";
          }, 500);
          return;
        }

        // ถ้ามีเจตนาจะเข้า Admin แต่ไม่ใช่ Admin
        if (isAdminIntent && !isAdmin) {
          setStatus("error");
          setMessage("บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบผู้ดูแล กำลังพากลับ...");
          await supabase.auth.signOut();
          setTimeout(() => {
            window.location.href = "/admin/login";
          }, 2000);
          return;
        }

        // ผู้ใช้งานทั่วไป — ไปหน้าแรก
        setTimeout(() => {
          window.location.href = "/";
        }, 500);

      } catch (err) {
        console.error("AuthCallback — unexpected error:", err);
        if (!cancelled) {
          setStatus("error");
          setMessage("เกิดข้อผิดพลาดที่ไม่คาดคิด กำลังพากลับ...");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        }
      }
    }

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, []);

  // สถานะและข้อความ
  const displayMessage = message || (
    status === "error"
      ? "เข้าสู่ระบบไม่สำเร็จ หรือบัญชีนี้ไม่มีสิทธิ์เข้าถึง กำลังพากลับ..."
      : "กำลังตรวจสอบสิทธิ์เข้าสู่ระบบ..."
  );

  const isError = status === "error";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#faf7f2",
        gap: "1.5rem",
      }}
    >
      {/* Spinner */}
      {!isError && (
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #e6e0d8",
            borderTop: "3px solid #ad8a55",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      )}

      <p
        style={{
          textAlign: "center",
          padding: "1rem 2rem",
          fontSize: "1.05rem",
          color: isError ? "#a24b3f" : "#5c5549",
          maxWidth: 420,
          lineHeight: 1.6,
        }}
      >
        {displayMessage}
      </p>

      {/* Error icon */}
      {isError && (
        <p style={{ fontSize: "0.85rem", color: "#8f8477" }}>
          กำลังนำคุณกลับไปยังหน้าเข้าสู่ระบบ...
        </p>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

