import React from "react";
import Sidebar from "./Sidebar";
import Header from "../../Header";
import ErrorBoundary from "./ErrorBoundary";

export default function AdminLayout({ activeTab, children }) {
  const tabs = [
    { id: "overview", label: "📊 ภาพรวม", href: "/admin" },
    { id: "orders", label: "📦 ออเดอร์", href: "/admin/orders" },
    { id: "products", label: "🏷️ สินค้า", href: "/admin/products" },
  ];

  return (
    <div className="admin-wrap">
      <Header links={[
        {label:"หน้าแรก",href:"/"},
        {label:"สกินแคร์",href:"/skincare"},
        {label:"เครื่องสำอาง",href:"/makeup"},
        {label:"เกี่ยวกับเรา",href:"/about"},
        {label:"แดชบอร์ด",href:"/admin/orders"},
      ]} accountHref="/admin/login"/>
      <div className="admin-shell">
        <Sidebar active={activeTab} />
        <main className="admin-main">
          <div className="admin-topbar">
            <div className="admin-topbar-title">
              Admin <span>Dashboard</span>
            </div>
            <div className="admin-topbar-right">
              <div className="admin-date-chip">
                {new Date().toLocaleDateString("th-TH")}
              </div>
              <div className="admin-tab-group">
                {tabs.map((t) => (
                  <a
                    key={t.id}
                    href={t.href}
                    className={`admin-tab-btn${
                      activeTab === t.id ? " active" : ""
                    }`}
                  >
                    {t.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="admin-page-body">{children}</div>
        </main>
      </div>
    </div>
  );
}

