import React from "react";
import { useAuth } from "./AuthContext";
import "./Login.css";

export default function Account() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <p style={{ textAlign: "center", padding: "4rem" }}>กำลังโหลด...</p>;
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email;

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2", padding: "3rem 2rem" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", background: "#fff", borderRadius: 16, padding: "2.5rem", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        {avatarUrl && (
          <img src={avatarUrl} alt={name} style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", marginBottom: "1rem" }} />
        )}
        <h1 className="display" style={{ marginBottom: "0.3rem" }}>{name}</h1>
        <p style={{ opacity: 0.6, marginBottom: "2rem" }}>{user.email}</p>

        <a href="/" className="btn-ghost" style={{ display: "inline-block", marginRight: "0.8rem" }}>กลับหน้าแรก</a>
        <button className="btn-social" type="button" onClick={handleLogout}>ออกจากระบบ</button>
      </div>
    </div>
  );
}
