import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Header.css";
import { getCartCount, subscribeCart } from "./cart";
import { supabase } from "./supabaseClient";
import { listProducts } from "./admin-products/productsDataStore";

const defaultLinks = [
  { label: "หน้าแรก", href: "/" },
  { label: "สกินแคร์", href: "/skincare" },
  { label: "เครื่องสำอาง", href: "/makeup" },
  { label: "เกี่ยวกับเรา", href: "/about" },
];

export default function Header({ links = defaultLinks, accountHref = "/login", cartHref = "/cart", basePath = "" }) {
  const [cartCount, setCartCount] = useState(() => getCartCount());
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setCartCount(getCartCount());
    const unsubscribeCart = subscribeCart((cart) => {
      setCartCount(cart.reduce((n, item) => n + item.qty, 0));
    });

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      unsubscribeCart();
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ปิดเมนูเมื่อคลิกข้างนอก
  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      window.setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [searchOpen]);

  const formatHref = (href) => {
    if (href.startsWith("#")) {
      return `${basePath}${href}`;
    }
    return href;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
  };

  const handleSearchToggle = () => {
    setSearchOpen((value) => !value);
    setMenuOpen(false);
  };

  const handleSearchSelect = (productId) => {
    setSearchOpen(false);
    setSearchQuery("");
    window.location.href = `${basePath}/product?id=${encodeURIComponent(productId)}`;
  };

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const allProducts = listProducts();
    const seen = new Map();

    allProducts.forEach((product) => {
      const key = product.id || product.name;
      if (!seen.has(key)) {
        seen.set(key, product);
      }
    });

    return Array.from(seen.values()).filter((product) => {
      const haystack = [
        product.name,
        product.descriptionShort,
        product.category,
        product.tag,
        product.tags?.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    }).slice(0, 5);
  }, [searchQuery]);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const displayName = user?.user_metadata?.full_name || user?.email || "ผู้ใช้";

  return (
    <>
      <div className="announce">จัดส่งฟรีทุกออเดอร์ตั้งแต่ 1,500 บาท · แถมกระเป๋าผ้าลิมิเต็ด</div>
      <header className="header">
        <div className="logo">
          <a href="/" style={{ textDecoration: "none", color: "inherit" }}>
            MAISON<span> Véra</span>
          </a>
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
          {/* Search */}
          <div className="search-panel-wrapper" ref={searchRef}>
            <button className="icon-btn" aria-label="ค้นหา" type="button" onClick={handleSearchToggle}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {searchOpen && (
              <div className="search-panel">
                <label className="search-label" htmlFor="header-search">ค้นหา</label>
                <input
                  id="header-search"
                  ref={searchInputRef}
                  className="search-input"
                  type="text"
                  placeholder="ค้นหาสินค้า เช่น เซรั่ม, คอนซีลเลอร์"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {searchQuery.trim() ? (
                  searchResults.length > 0 ? (
                    <ul className="search-results">
                      {searchResults.map((product) => (
                        <li key={product.id}>
                          <a
                            href={`${basePath}/product?id=${encodeURIComponent(product.id)}`}
                            className="search-result-item"
                            onClick={() => handleSearchSelect(product.id)}
                          >
                            <span className="search-result-title">{product.name}</span>
                            <span className="search-result-meta">{product.category} • {product.price} บาท</span>
                            <span className="search-result-desc">{product.descriptionShort}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="search-empty">ไม่พบสินค้าที่ตรงกับคำค้นหา</div>
                  )
                ) : (
                  <div className="search-empty">พิมพ์ชื่อสินค้า หมวดหมู่ หรือคำอธิบายเพื่อค้นหา</div>
                )}
              </div>
            )}
          </div>

          {/* Account Menu */}
          {user ? (
            <div className="account-menu" ref={menuRef} style={{ position: "relative" }}>
              <button
                className="icon-btn account-avatar-btn"
                aria-label={`บัญชี (${displayName})`}
                title={displayName}
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                  </svg>
                )}
              </button>

              {menuOpen && (
                <div className="account-dropdown">
                  <div className="account-dropdown-header">
                    {avatarUrl && (
                      <img src={avatarUrl} alt={displayName} className="account-dropdown-avatar" />
                    )}
                    <div>
                      <div className="account-dropdown-name">{displayName}</div>
                      <div className="account-dropdown-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="account-dropdown-divider" />
                  <a href="/myaddresses" className="account-dropdown-item" onClick={() => setMenuOpen(false)}>
                    ที่อยู่ของฉัน
                  </a>
                  <a href="/orders.html" className="account-dropdown-item" onClick={() => setMenuOpen(false)}>
                    ติดตามสถานะสั่งซื้อ
                  </a>
                  <a href="/orders.html#order-history" className="account-dropdown-item" onClick={() => setMenuOpen(false)}>
                    ประวัติคำสั่งซื้อ
                  </a>
                  <div className="account-dropdown-divider" />
                  <button type="button" className="account-dropdown-item account-dropdown-logout" onClick={handleLogout}>
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a className="icon-btn" aria-label="บัญชีของฉัน" href={accountHref}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
            </a>
          )}

          {/* Cart */}
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
