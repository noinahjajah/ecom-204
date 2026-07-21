import React from "react";
import { useAuth } from "../../AuthContext";

export default function Sidebar({ active }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <aside
      className="admin-sb"
      style={{
        width: 240,
        flexShrink: 0,
        minHeight: "100vh",
        background: "#241d17",
        color: "#efe7db",
        display: "flex",
        flexDirection: "column",
        padding: "22px 14px",
      }}
    >
      <div
        style={{
          padding: "0 6px 22px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          marginBottom: 18,
        }}
      >
        <div style={{ fontWeight: 800, letterSpacing: "0.02em", fontSize: 15 }}>
          MAISON <span style={{ color: "#b8975a", fontStyle: "italic", fontWeight: 500 }}>Vera</span>
        </div>
        <div
          style={{
            fontSize: 10.5,
            opacity: 0.55,
            marginTop: 4,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Admin Console
        </div>
      </div>

      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            opacity: 0.45,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "6px 6px",
          }}
        >
          Navigation
        </div>

        <a
          href="/admin"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 600,
            color: active === "overview" ? "#d8b781" : "#efe7db",
            textDecoration: "none",
            background:
              active === "overview"
                ? "rgba(184,151,90,0.18)"
                : "transparent",
            cursor: "pointer",
          }}
        >
          <svg style={{ width: 17, height: 17, flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          ภาพรวม
        </a>

        <a
          href="/admin/orders"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 600,
            color: active === "orders" ? "#d8b781" : "#efe7db",
            textDecoration: "none",
            background:
              active === "orders"
                ? "rgba(184,151,90,0.18)"
                : "transparent",
            cursor: "pointer",
          }}
        >
          <svg
            style={{ width: 17, height: 17, flexShrink: 0 }}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          จัดการออเดอร์
        </a>

        <a
          href="/admin/products"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 600,
            color: active === "products" ? "#d8b781" : "#efe7db",
            textDecoration: "none",
            background:
              active === "products"
                ? "rgba(184,151,90,0.18)"
                : "transparent",
            cursor: "pointer",
          }}
        >
          <svg
            style={{ width: 17, height: 17, flexShrink: 0 }}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M7 10h10" />
            <path d="M7 15h10" />
            <path d="M7 20h10" />
            <path d="M9 2h6l2 3H7l2-3z" />
          </svg>
          สินค้า
        </a>
      </nav>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 14,
          marginTop: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 6px 12px",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#b8975a",
              color: "#241d17",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>admin</div>
            <div style={{ fontSize: 11, opacity: 0.55 }}>Administrator</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "9px 12px",
            borderRadius: 9,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "transparent",
            color: "#efe7db",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#b8975a";
            e.currentTarget.style.color = "#d8b781";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
            e.currentTarget.style.color = "#efe7db";
          }}
        >
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}

