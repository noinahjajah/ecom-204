// import React, { useEffect, useState } from "react";
// import "./adminProducts.css";
// import { supabase } from "../supabaseClient"; 

// const defaultLinks = [
//   { label: "Dashboard", href: "/admin/products.html" },
//   { label: "สินค้าทั้งหมด", href: "/admin/products.html?status=" },
//   { label: "เพิ่มสินค้า", href: "/admin/products/new.html" },
// ];

// export default function AdminHeader({ links = defaultLinks }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       setUser(data.session?.user ?? null);
//       setLoading(false);
//     });

//     const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//     });

//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, []);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     window.location.href = "/admin/login.html";
//   };

//   const initials = (email) => {
//     if (!email) return "A";
//     return email.slice(0, 2).toUpperCase();
//   };

//   return (
//     <div className="admin-wrap admin-topbar-wrap">
//       <header className="admin-topbar">
//         <div className="admin-topbar-left">
//           <a href="/admin/products.html" className="admin-logo">
//             MAISON<span> Véra</span>
//             <span className="admin-logo-tag">Admin</span>
//           </a>
//           <nav className="admin-topbar-nav">
//             <ul>
//               {links.map((item) => (
//                 <li key={item.label}>
//                   <a href={item.href}>{item.label}</a>
//                 </li>
//               ))}
//             </ul>
//           </nav>
//         </div>

//         <div className="admin-topbar-right">
//           {loading ? (
//             <div className="admin-user-chip is-loading">…</div>
//           ) : user ? (
//             <div className="admin-user-chip">
//               <div className="admin-user-avatar">{initials(user.email)}</div>
//               <span className="admin-user-email">{user.email}</span>
//               <button type="button" className="admin-mini-btn" onClick={handleLogout}>
//                 ออกจากระบบ
//               </button>
//             </div>
//           ) : (
//             <a href="/admin/login.html" className="admin-btn admin-btn-gold">
//               เข้าสู่ระบบแอดมิน
//             </a>
//           )}
//         </div>
//       </header>
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import "./adminProducts.css";
import { supabase } from "../supabaseClient";

const defaultLinks = [
  { label: "Dashboard", href: "/admin/products.html" },
  { label: "สินค้าทั้งหมด", href: "/admin/products.html?status=" },
  { label: "เพิ่มสินค้า", href: "/admin/products/new.html" },
];

export default function AdminHeader({ links = defaultLinks }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ปิด dropdown เมื่อคลิกนอกกล่อง
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; // กลับไปหน้าหลัก
  };

  const isAdmin = user?.user_metadata?.role === "admin";

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "ผู้ใช้";

  const initials = (name) => {
    if (!name) return "A";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="admin-wrap admin-topbar-wrap">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <a href="/admin/products.html" className="admin-logo">
            MAISON<span> Véra</span>
            <span className="admin-logo-tag">Admin</span>
          </a>
          <nav className="admin-topbar-nav">
            <ul>
              {links.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="admin-topbar-right">
          {loading ? (
            <div className="admin-user-chip is-loading">…</div>
          ) : user ? (
            <div className="admin-user-menu" ref={menuRef}>
              <button
                type="button"
                className="admin-user-chip admin-user-chip--clickable"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <div className="admin-user-avatar">{initials(displayName)}</div>
                <span className="admin-user-email">
                  {displayName}
                  {isAdmin && <span className="admin-role-badge"> แอดมิน</span>}
                </span>
                <span className={`admin-chip-caret ${menuOpen ? "is-open" : ""}`}>▾</span>
              </button>

              {menuOpen && (
                <div className="admin-user-dropdown">
                  <div className="admin-user-dropdown-name">
                    {displayName}
                    {isAdmin && <span className="admin-role-badge"> แอดมิน</span>}
                  </div>
                  <div className="admin-user-dropdown-email">{user.email}</div>
                  <button
                    type="button"
                    className="admin-mini-btn admin-user-dropdown-logout"
                    onClick={handleLogout}
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a href="/admin/login.html" className="admin-btn admin-btn-gold">
              เข้าสู่ระบบแอดมิน
            </a>
          )}
        </div>
      </header>
    </div>
  );
}