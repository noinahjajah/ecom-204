import React, { useEffect, useState } from "react";
import "./Header.css";
import { getCartCount, subscribeCart } from "./cart";
import { useAuth } from "./AuthContext";

const defaultLinks = [
  { label: "หน้าแรก", href: "/" },
  { label: "สกินแคร์", href: "/skincare" },
  { label: "เครื่องสำอาง", href: "/makeup" },
  { label: "เกี่ยวกับเรา", href: "/about" },
];

const defaultLinksAdmin = [
  { label: "หน้าแรก", href: "/" },
  { label: "สกินแคร์", href: "/skincare" },
  { label: "เครื่องสำอาง", href: "/makeup" },
  { label: "เกี่ยวกับเรา", href: "/about" },
  { label: "Admin", href: "/admin/orders" },
];

export default function Header({ links: propLinks, accountHref = "/login", cartHref = "/cart", basePath = "" }) {
  const { isAdmin } = useAuth();
  const links = propLinks || (isAdmin ? defaultLinksAdmin : defaultLinks);
  const [cartCount, setCartCount] = useState(() => getCartCount());

  useEffect(() => {
    setCartCount(getCartCount());
    const unsubscribe = subscribeCart((cart) => {
      setCartCount(cart.reduce((n, item) => n + item.qty, 0));
    });
    return unsubscribe;
  }, []);

  const formatHref = (href) => {
    if (href.startsWith("#")) {
      return `${basePath}${href}`;
    }
    return href;
  };

  return (
    <>
      <div className="announce">จัดส่งฟรีทุกออเดอร์ตั้งแต่ 1,500 บาท · แถมกระเป๋าผ้าลิมิเต็ด</div>
      <header className="header">
        <div className="logo">
          MAISON<span> Véra</span>
        </div>
        <nav>
          <ul className="nav">
            {links.map((item) => (
              <li key={item.label}>
                <a href={formatHref(item.href)}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-icons">
          <button className="icon-btn" aria-label="ค้นหา" type="button">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <a className="icon-btn" aria-label="บัญชีของฉัน" href={accountHref}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>
          </a>
          <a className="icon-btn" aria-label="ตะกร้าสินค้า" href={cartHref}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M6 8h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            {cartCount > 0 && <span className="bag-count">{cartCount}</span>}
          </a>
        </div>
      </header>
    </>
  );
}
