import React, { useMemo, useState } from "react";
import "./ProductDetailPage.css";
import Header from "./Header";
import { addToCart, parsePrice, slugify } from "./cart";
import { getProductById, getRelatedProducts } from "./productData";

function formatTHB(n) {
  const num = typeof n === "number" ? n : parsePrice(n);
  return num.toLocaleString("th-TH") + " บาท";
}

function getQueryParam(name) {
  const sp = new URLSearchParams(window.location.search);
  return sp.get(name);
}

export default function ProductDetailPage() {
  const productId = getQueryParam("id");

  const product = useMemo(() => {
    // id ในระบบนี้ใช้ slugify(name) เป็นหลัก
    return getProductById(productId) || getProductById(slugify(productId));
  }, [productId]);

  const [selectedVariant, setSelectedVariant] = useState(() => {
    if (!product) return "";
    return product.variantDefault || product.variantOptions?.[0] || "";
  });

  // ถ้า product เปลี่ยน (เช่น route เปลี่ยน) ให้ปรับ default variant
  React.useEffect(() => {
    if (!product) return;
    setSelectedVariant(product.variantDefault || product.variantOptions?.[0] || "");
  }, [product]);

  const related = useMemo(() => getRelatedProducts(product), [product]);

  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      category: product.category || "",
      variant: selectedVariant || "",
      price: product.price,
      image: product.image,
    });

    setJustAdded(true);
    window.clearTimeout(handleAddToCart._t);
    handleAddToCart._t = window.setTimeout(() => setJustAdded(false), 1400);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // รอให้ cart update สั้นๆ แล้วค่อยไป checkout
    window.setTimeout(() => {
      window.location.href = "/checkout";
    }, 150);
  };

  if (!product) {
    return (
      <div className="pdp">
        <Header />
        <div className="pdp-container">
          <div className="pdp-empty">
            <h1>ไม่พบสินค้า</h1>
            <p>ลิงก์นี้อาจไม่ถูกต้องหรือสินค้าถูกลบออกแล้ว</p>
            <a className="btn-primary" href="/">กลับหน้าแรก</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pdp">
      <Header />

      <div className="pdp-container">
        <nav className="pdp-breadcrumb">
          <a href="/">หน้าแรก</a>
          <span>/</span>
          <span>{product.category || "สินค้า"}</span>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="pdp-grid">
          {/* Left: media */}
          <section className="pdp-media">
            <div className="pdp-media-box">
              <img src={product.image} alt={product.name} />
              {product.tag && <span className="pdp-tag">{product.tag}</span>}
            </div>
          </section>

          {/* Right: summary */}
          <section className="pdp-summary">
            <h1 className="pdp-title">{product.name}</h1>
            <div className="pdp-price">
              {product.oldPrice && <span className="pdp-old">฿{parsePrice(product.oldPrice)}</span>}
              <span className="pdp-now">{formatTHB(product.price)}</span>
            </div>

            <p className="pdp-desc">{product.desc}</p>

            {product.features?.length > 0 && (
              <div className="pdp-features">
                <h3>คุณสมบัติ</h3>
                <ul>
                  {product.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {product.ingredient && (
              <div className="pdp-ingredient">
                <h3>ส่วนผสมสำคัญ</h3>
                <p>{product.ingredient}</p>
              </div>
            )}

            {product.variantOptions?.length > 0 && (
              <div className="pdp-variant">
                <h3>ตัวเลือกสินค้า</h3>
                <div className="pdp-variant-options" role="group" aria-label="ตัวเลือกสินค้า">
                  {product.variantOptions.map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={"pdp-variant-btn" + (selectedVariant === v ? " is-active" : "")}
                      onClick={() => setSelectedVariant(v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pdp-actions">
              <button className="btn-ghost" onClick={handleAddToCart}>
                {justAdded ? "เพิ่มแล้ว ✓" : "เพิ่มลงตะกร้า"}
              </button>
              <button className="btn-primary" onClick={handleBuyNow}>
                ซื้อทันที
              </button>
            </div>

            <div className="pdp-smallprint">
              <span>* ข้อมูลทั้งหมดเป็นเดโมเพื่อใช้งานได้จริงในโปรเจกต์นี้ (ใช้ localStorage)</span>
            </div>
          </section>
        </div>

        {/* Reviews */}
        <section className="pdp-section">
          <div className="pdp-section-head">
            <h2>รีวิวจากลูกค้า</h2>
          </div>
          <div className="pdp-reviews">
            {(product.reviews || []).slice(0, 3).map((r, idx) => (
              <div className="pdp-review" key={idx}>
                <div className="pdp-review-top">
                  <b>{r.name}</b>
                  <span className="pdp-rating">{"★".repeat(r.rating || 5)}</span>
                </div>
                <p className="pdp-review-text">{r.text}</p>
                <span className="pdp-review-date">{r.date ? new Date(r.date).toLocaleDateString("th-TH") : ""}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        {related?.length > 0 && (
          <section className="pdp-section">
            <div className="pdp-section-head">
              <h2>สินค้าที่เกี่ยวข้อง</h2>
            </div>
            <div className="pdp-related">
              {related.map((p) => (
                <a key={p.id} className="pdp-related-card" href={`/product?id=${encodeURIComponent(p.id)}`}>
                  <img src={p.image} alt={p.name} />
                  {p.tag && <span className="pdp-related-tag">{p.tag}</span>}
                  <div className="pdp-related-info">
                    <div className="pdp-related-name">{p.name}</div>
                    <div className="pdp-related-price">{formatTHB(p.price)}</div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

