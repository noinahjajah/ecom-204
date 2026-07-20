import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate
import { supabase } from "../supabaseClient";
import "../Login.css"; 

// ข้อมูลตัวอย่าง (mock) — เปลี่ยนเป็นดึงจากตาราง orders ใน Supabase ภายหลัง
const MOCK_ORDERS = [
  { id: "BA-1042", customer: "สุชาดา วงศ์ทอง", product: "Velvet Silk Serum", total: 2480, status: "รอชำระเงิน", shipping: "รอดำเนินการ", date: "2026-07-17" },
  { id: "BA-1041", customer: "ภัทรพล เจริญสุข", product: "Rose Clay Cleansing Balm x2", total: 2580, status: "ชำระแล้ว", shipping: "กำลังจัดส่ง", date: "2026-07-17" },
  { id: "BA-1040", customer: "Warattha Tenak", product: "Golden Hour Highlighter", total: 1150, status: "ชำระแล้ว", shipping: "จัดส่งสำเร็จ", date: "2026-07-16" },
  { id: "BA-1039", customer: "ณัฐธิดา ใจดี", product: "Bare Petal Lip Tint x3", total: 2670, status: "ชำระแล้ว", shipping: "กำลังเตรียมพัสดุ", date: "2026-07-16" },
  { id: "BA-1038", customer: "กิตติศักดิ์ มั่นคง", product: "Velvet Silk Serum", total: 2480, status: "ยกเลิก", shipping: "ยกเลิก", date: "2026-07-15" },
];

const MOCK_CUSTOMERS = [
  { name: "Warattha Tenak", email: "warattha.ten@spumail.net", orders: 4, joined: "2026-06-02" },
  { name: "สุชาดา วงศ์ทอง", email: "suchada.w@example.com", orders: 1, joined: "2026-07-10" },
  { name: "ภัทรพล เจริญสุข", email: "pattarapon.c@example.com", orders: 2, joined: "2026-05-28" },
];

const STATUS_COLOR = {
  "รอชำระเงิน": { bg: "#fdf1d9", fg: "#946200" },
  "ชำระแล้ว": { bg: "#e3f3e6", fg: "#227a3c" },
  "ยกเลิก": { bg: "#fbe4e4", fg: "#b13030" },
  "รอดำเนินการ": { bg: "#eee", fg: "#666" },
  "กำลังเตรียมพัสดุ": { bg: "#fdf1d9", fg: "#946200" },
  "กำลังจัดส่ง": { bg: "#e0ecfb", fg: "#2358a3" },
  "จัดส่งสำเร็จ": { bg: "#e3f3e6", fg: "#227a3c" },
};

function Badge({ label }) {
  const c = STATUS_COLOR[label] || { bg: "#eee", fg: "#555" };
  return (
    <span style={{ background: c.bg, color: c.fg, padding: "3px 10px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function DashboardCard({ title, value, note }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <p style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "0.5rem" }}>{title}</p>
      <p style={{ fontSize: "1.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>{value}</p>
      <p style={{ fontSize: "0.75rem", opacity: 0.5 }}>{note}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("orders"); // orders | customers
  const navigate = useNavigate(); // เรียกใช้งาน useNavigate

  useEffect(() => {
    let active = true;

    const checkAccess = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;

      if (!sessionUser) {
        navigate("/admin/login"); // ถ้าไม่มี session ให้ไปหน้า login
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", sessionUser.id)
        .single();

      if (!active) return;

      if (profileError || profile.role !== "admin") {
        navigate("/admin/login"); // ถ้าไม่ใช่ admin ให้ไปหน้า login
        return;
      }

      setUser(sessionUser);
      setChecking(false);
    };

    checkAccess();
    return () => { active = false; };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/"); // แก้ไขตรงนี้: เปลี่ยนให้กลับไปหน้า Home หลัก
  };

  if (checking) {
    return <p style={{ textAlign: "center", padding: "4rem" }}>กำลังตรวจสอบสิทธิ์...</p>;
  }

  const totalToday = MOCK_ORDERS.filter((o) => o.date === "2026-07-17" && o.status !== "ยกเลิก")
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrders = MOCK_ORDERS.length;
  const pendingShipping = MOCK_ORDERS.filter((o) => ["รอดำเนินการ", "กำลังเตรียมพัสดุ", "กำลังจัดส่ง"].includes(o.shipping)).length;

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2", padding: "2rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "1px solid #e5ddd0" }}>
        <div className="logo">
          MAISON<span> Véra</span> <small style={{ fontSize: "0.7rem", opacity: 0.6 }}>Admin</small>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>{user?.email}</span>
          <button className="btn-social" type="button" onClick={handleLogout}>ออกจากระบบ</button>
        </div>
      </header>

      <h1 className="display" style={{ marginBottom: "1.5rem" }}>แดชบอร์ด</h1>

      {/* การ์ดสรุป */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <DashboardCard title="ยอดขายวันนี้" value={`฿${totalToday.toLocaleString()}`} note="ไม่รวมคำสั่งซื้อที่ยกเลิก (ข้อมูลตัวอย่าง)" />
        <DashboardCard title="คำสั่งซื้อทั้งหมด" value={totalOrders} note="ทุกสถานะรวมกัน" />
        <DashboardCard title="รอจัดส่ง" value={pendingShipping} note="ยังไม่ถึงมือลูกค้า" />
        <DashboardCard title="ผู้ใช้งานทั้งหมด" value={MOCK_CUSTOMERS.length} note="ลูกค้าที่สมัครสมาชิก" />
      </div>

      {/* แท็บสลับ */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.2rem" }}>
        <button
          className="btn-social"
          type="button"
          onClick={() => setTab("orders")}
          style={{ background: tab === "orders" ? "#221f1c" : "#fff", color: tab === "orders" ? "#fff" : "#221f1c" }}
        >
          คำสั่งซื้อ
        </button>
        <button
          className="btn-social"
          type="button"
          onClick={() => setTab("customers")}
          style={{ background: tab === "customers" ? "#221f1c" : "#fff", color: tab === "customers" ? "#fff" : "#221f1c" }}
        >
          ลูกค้า
        </button>
      </div>

      {tab === "orders" ? (
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "#f5f1ea", textAlign: "left" }}>
                <th style={{ padding: "0.9rem 1rem" }}>รหัสคำสั่งซื้อ</th>
                <th style={{ padding: "0.9rem 1rem" }}>ลูกค้า</th>
                <th style={{ padding: "0.9rem 1rem" }}>สินค้า</th>
                <th style={{ padding: "0.9rem 1rem" }}>ยอดรวม</th>
                <th style={{ padding: "0.9rem 1rem" }}>สถานะการชำระเงิน</th>
                <th style={{ padding: "0.9rem 1rem" }}>สถานะการจัดส่ง</th>
                <th style={{ padding: "0.9rem 1rem" }}>วันที่</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ORDERS.map((o) => (
                <tr key={o.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>{o.id}</td>
                  <td style={{ padding: "0.9rem 1rem" }}>{o.customer}</td>
                  <td style={{ padding: "0.9rem 1rem" }}>{o.product}</td>
                  <td style={{ padding: "0.9rem 1rem" }}>฿{o.total.toLocaleString()}</td>
                  <td style={{ padding: "0.9rem 1rem" }}><Badge label={o.status} /></td>
                  <td style={{ padding: "0.9rem 1rem" }}><Badge label={o.shipping} /></td>
                  <td style={{ padding: "0.9rem 1rem", opacity: 0.7 }}>{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "#f5f1ea", textAlign: "left" }}>
                <th style={{ padding: "0.9rem 1rem" }}>ชื่อ</th>
                <th style={{ padding: "0.9rem 1rem" }}>อีเมล</th>
                <th style={{ padding: "0.9rem 1rem" }}>จำนวนคำสั่งซื้อ</th>
                <th style={{ padding: "0.9rem 1rem" }}>สมัครเมื่อ</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CUSTOMERS.map((c) => (
                <tr key={c.email} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: "0.9rem 1rem" }}>{c.email}</td>
                  <td style={{ padding: "0.9rem 1rem" }}>{c.orders}</td>
                  <td style={{ padding: "0.9rem 1rem", opacity: 0.7 }}>{c.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}