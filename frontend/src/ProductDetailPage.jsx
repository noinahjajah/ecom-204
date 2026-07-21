import React, { useMemo, useState } from "react";
import "./ProductDetailPage.css";
import Header from "./Header";
import { addToCart, parsePrice, slugify } from "./cart";
import { getProductById as getFallbackProductById, getRelatedProducts as getFallbackRelatedProducts } from "./productData";
import { isProductAvailable, listProducts } from "./admin-products/productsDataStore";

const fallbackReviews = [
  {
    name: "Nok",
    rating: 5,
    text: "เนื้อดีมาก ซึมไว ใช้แล้วผิวดูสุขภาพดีขึ้นค่ะ",
    date: "2026-06-12",
  },
  {
    name: "Pim",
    rating: 4,
    text: "แพ็กเกจสวยและใช้ง่าย เหมาะกับผิวแพ้ง่าย",
    date: "2026-05-02",
  },
  {
    name: "Mint",
    rating: 5,
    text: "กลิ่นอ่อนๆ ไม่รบกวน ผิวดูชุ่มชื้นขึ้นจริง",
    date: "2026-04-18",
  },
];

function formatTHB(n) {
  const num = typeof n === "number" ? n : parsePrice(n);
  return num.toLocaleString("th-TH") + " บาท";
}

function getQueryParam(name) {
  const sp = new URLSearchParams(window.location.search);
  return sp.get(name);
}

function normalizeProductForDetail(product) {
  if (!product) return null;

  const name = product.name || "";
  const variantOptions = (product.variantOptions || [])
    .map((option) => {
      if (typeof option === "string") return option;
      if (Array.isArray(option?.values)) return option.values;
      if (option?.name) return option.name;
      return null;
    })
    .flatMap((item) => (Array.isArray(item) ? item : [item]))
    .filter(Boolean);

  const variantFallback = (product.variants || [])
    .map((variant) => {
      const values = Object.values(variant?.options || {})
        .filter(Boolean)
        .map((value) => String(value));
      return values.length ? values.join(" / ") : null;
    })
    .filter(Boolean);

  const attributes = Array.isArray(product.attributes) ? product.attributes : [];
  const features = (product.features && product.features.length > 0
    ? product.features
    : attributes
        .map((attr) => `${attr.key || ""}: ${attr.value || ""}`.trim())
        .filter(Boolean))
    .slice(0, 4);

  const ingredient = attributes.find((attr) => /ผิว|ส่วนผสม|สูตร|ingredient/i.test(attr.key || ""))?.value || product.ingredient || "";

  return {
    id: product.id || slugify(name),
    name,
    category: product.category || "",
    variantOptions: variantOptions.length > 0 ? variantOptions : variantFallback,
    variantDefault: product.variantDefault || variantOptions[0] || variantFallback[0] || null,
    price: Number(product.price ?? 0),
    oldPrice: product.oldPrice ?? product.promoPrice ?? null,
    tag: product.tag || product.tags?.[0] || null,
    image: product.mainImage || product.gallery?.[0] || product.image || "https://placehold.co/800x900/faf3ea/ad8a55?text=Product",
    desc: product.descriptionShort || product.description || product.desc || "",
    features,
    ingredient,
    reviews: product.reviews || fallbackReviews,
    relatedIds: product.relatedIds || [],
    store: product.store || "",
    brand: product.brand || "",
    inStock: isProductAvailable(product),
  };
}

function getLocalProductById(id, products) {
  if (!id) return null;
  const normalized = String(id).trim();
  const byId = products.find((product) => product.id === normalized);
  if (byId) return byId;
  return products.find((product) => slugify(product.name || "") === slugify(normalized)) || null;
}

export default function ProductDetailPage() {
  const productId = getQueryParam("id");
  const localProducts = useMemo(() => listProducts(), [productId]);

  const product = useMemo(() => {
    const localProduct = getLocalProductById(productId, localProducts) || getLocalProductById(slugify(productId), localProducts);
    if (localProduct) return normalizeProductForDetail(localProduct);

    const fallbackProduct = getFallbackProductById(productId) || getFallbackProductById(slugify(productId));
    return normalizeProductForDetail(fallbackProduct);
  }, [productId, localProducts]);

  const [selectedVariant, setSelectedVariant] = useState(() => {
    if (!product) return "";
    return product.variantDefault || product.variantOptions?.[0] || "";
  });

  // ถ้า product เปลี่ยน (เช่น route เปลี่ยน) ให้ปรับ default variant
  React.useEffect(() => {
    if (!product) return;
    setSelectedVariant(product.variantDefault || product.variantOptions?.[0] || "");
  }, [product]);

  const related = useMemo(() => {
    if (!product) return [];

    const sameCategoryProducts = localProducts.filter((item) => item.category === product.category && item.id !== product.id);
    if (sameCategoryProducts.length > 0) {
      return sameCategoryProducts.slice(0, 4).map((item) => normalizeProductForDetail(item));
    }

    return (getFallbackRelatedProducts(product) || []).map((item) => normalizeProductForDetail(item));
  }, [product, localProducts]);

  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    if (!product || !product.inStock) return;

    addToCart({
      id: product.id,
      name: product.name,
      category: product.category || "",
      variant: selectedVariant || "",
      price: Number(product.price || 0),
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

            {!product.inStock && (
              <div className="pdp-stock-out" style={{ marginBottom: 12, color: "#8b4a2b", fontWeight: 600 }}>
                สินค้าหมดชั่วคราว และถูกลบออกจากตะกร้าอัตโนมัติแล้ว
              </div>
            )}

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
              <button className="btn-ghost" onClick={handleAddToCart} disabled={!product.inStock}>
                {product.inStock ? (justAdded ? "เพิ่มแล้ว ✓" : "เพิ่มลงตะกร้า") : "สินค้าหมด"}
              </button>
              <button className="btn-primary" onClick={handleBuyNow} disabled={!product.inStock}>
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

