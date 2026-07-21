import React, { useEffect, useState, useMemo } from "react";
import "./Makeup.css";
import Header from "./Header";
import { addToCart, slugify } from "./cart";
import { isProductAvailable, listProducts } from "./admin-products/productsDataStore";
/**
 * Makeup — หน้าหมวดเมคอัพ เว็บอีคอมเมิร์ซเครื่องสำอาง Maison Véra
 * ธีม: White Luxury (ivory / ink / gold) — สีชุดเดียวกับ home.css
 * ฟอนต์: Fraunces (display) + Jost + IBM Plex Sans Thai (body) — โหลดผ่าน Google Fonts ใน makeup.css
 *
 * วิธีใช้: import Makeup from "./Makeup";  แล้ววาง <Makeup /> ใน route "/makeup"
 * แก้ไขข้อมูลสินค้าในตัวแปร PRODUCTS ด้านล่างได้เลย
 */

const CATEGORIES = [
  { id: "all", label: "ทั้งหมด" },
  { id: "face", label: "หน้า" },
  { id: "eyes", label: "ตา" },
  { id: "cheek", label: "แก้ม" },
  { id: "lips", label: "ปาก" },
];

const APPLICATION_ORDER = [
  { step: "01", key: "face", title: "เตรียมผิว & เบสหน้า", text: "ปรับผิวให้เรียบเนียนก่อนลงเบส ปกปิดจุดด้อยอย่างเป็นธรรมชาติ" },
  { step: "02", key: "eyes", title: "แต่งคิ้วและดวงตา", text: "ขึ้นโครงคิ้ว ไล่เฉดอายแชโดว์ เน้นจุดโฟกัสของใบหน้า" },
  { step: "03", key: "cheek", title: "ปัดแก้มและคอนทัวร์", text: "เพิ่มมิติและสีสันสุขภาพดีให้ใบหน้าดูมีชีวิตชีวา" },
  { step: "04", key: "lips", title: "แต้มสีริมฝีปาก", text: "ปิดท้ายลุคด้วยสีปากที่ใช่ ให้ลุคสมบูรณ์แบบ" },
];

const PRODUCTS = [
  {
    name: "Silk Veil Foundation",
    desc: "รองพื้นเนื้อบางเบา ปกปิดเรียบเนียนเหมือนผิวจริง คุมมันได้นาน 12 ชม.",
    price: "1,890",
    oldPrice: null,
    tag: "Best Seller",
    category: "face",
    finish: "Satin Matte",
    img: "https://placehold.co/500x625/faf3ea/ad8a55?text=Foundation",
  },
  {
    name: "Featherlight Concealer",
    desc: "คอนซีลเลอร์เนื้อครีมเข้มข้น ปกปิดรอยคล้ำใต้ตาโดยไม่เป็นคราบ",
    price: "890",
    oldPrice: null,
    tag: null,
    category: "face",
    finish: "Natural Glow",
    img: "https://placehold.co/500x625/faf3ea/ad8a55?text=Concealer",
  },
  {
    name: "Ember Eyeshadow Palette",
    desc: "พาเลตอายแชโดว์ 9 เฉดสีดินเผา ไล่สีง่าย ติดทนไม่ตกร่อง",
    price: "1,650",
    oldPrice: null,
    tag: "New",
    category: "eyes",
    finish: "Matte & Shimmer",
    img: "https://placehold.co/500x625/faf3ea/ad8a55?text=Eyeshadow",
  },
  {
    name: "Sculpt Brow Pencil",
    desc: "ดินสอเขียนคิ้วปลายเรียว ขึ้นโครงคิ้วเส้นคมชัดเหมือนคิ้วจริง",
    price: "590",
    oldPrice: null,
    tag: null,
    category: "eyes",
    finish: "Fine Tip",
    img: "https://placehold.co/500x625/faf3ea/ad8a55?text=Brow+Pencil",
  },
  {
    name: "Golden Hour Highlighter",
    desc: "ไฮไลท์เนื้อครีม ให้แสงประกายจากภายใน ผสานผิวเนียนเป็นเนื้อเดียว",
    price: "1,150",
    oldPrice: null,
    tag: null,
    category: "cheek",
    finish: "Luminous",
    img: "https://placehold.co/500x625/faf3ea/ad8a55?text=Highlighter",
  },
  {
    name: "Petal Flush Blush",
    desc: "บลัชออนเนื้อฝุ่นละเอียด ให้สีแก้มอมชมพูสุขภาพดีเป็นธรรมชาติ",
    price: "980",
    oldPrice: "1,190",
    tag: "Sale",
    category: "cheek",
    finish: "Soft Matte",
    img: "https://placehold.co/500x625/faf3ea/ad8a55?text=Blush",
  },
  {
    name: "Bare Petal Lip Tint",
    desc: "ลิปทินท์เนื้อกำมะหยี่ ติดทนตลอดวัน ไม่ทำให้ริมฝีปากแห้ง",
    price: "890",
    oldPrice: null,
    tag: "Best Seller",
    category: "lips",
    finish: "Velvet Matte",
    img: "https://placehold.co/500x625/faf3ea/ad8a55?text=Lip+Tint",
  },
  {
    name: "Satin Rouge Lipstick",
    desc: "ลิปสติกเนื้อซาตินเรียบเนียน ให้สีสม่ำเสมอในทาเดียว",
    price: "1,090",
    oldPrice: null,
    tag: null,
    category: "lips",
    finish: "Satin",
    img: "https://placehold.co/500x625/faf3ea/ad8a55?text=Lipstick",
  },
];

const formatPrice = (value) => {
  const numberValue = Number(value);
  if (Number.isFinite(numberValue)) {
    return `฿${numberValue.toLocaleString("th-TH")}`;
  }
  return value;
};

const inferMakeupCategory = (product) => {
  const name = (product.name || "").toLowerCase();
  if (name.includes("lip") || name.includes("rouge")) return "lips";
  if (name.includes("eye") || name.includes("brow")) return "eyes";
  if (name.includes("high") || name.includes("blush")) return "cheek";
  return "face";
};

const normalizeMakeupProduct = (product) => {
  const name = product.name || "";
  const category = inferMakeupCategory(product);
  return {
    id: product.id || slugify(name),
    name,
    desc: product.descriptionShort || product.desc || "",
    price: formatPrice(product.price ?? 0),
    priceValue: Number(product.price || 0),
    oldPrice: product.promoPrice ? formatPrice(product.promoPrice) : null,
    tag: product.tags?.[0] || null,
    category,
    finish: product.variantOptions?.[0] || product.attributes?.[0]?.value || "",
    img: product.mainImage || product.gallery?.[0] || product.img || "https://placehold.co/500x625/faf3ea/ad8a55?text=Product",
  };
};

export default function Makeup() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [justAdded, setJustAdded] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const allProducts = listProducts().filter((p) => p.category === "เมคอัพ" && isProductAvailable(p));
    setProducts(allProducts);
  }, []);

  const handleAddToCart = (p) => {
    const priceValue = Number(p.priceValue ?? String(p.price || "").replace(/[^0-9.-]/g, ""));
    addToCart({
      id: slugify(p.name),
      name: p.name,
      category: "เมคอัพ",
      variant: p.finish || "",
      price: priceValue,
      image: p.img,
    });
    setJustAdded(p.name);
    window.clearTimeout(handleAddToCart._t);
    handleAddToCart._t = window.setTimeout(() => setJustAdded(null), 1400);
  };

  const displayProducts = useMemo(() => {
    const source = products.length > 0 ? products : PRODUCTS;
    return source.filter((product) => isProductAvailable(product)).map((product) => {
      if (product?.name && (product?.descriptionShort || product?.desc)) {
        return normalizeMakeupProduct(product);
      }
      return product;
    });
  }, [products]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return displayProducts;
    return displayProducts.filter((p) => p.category === activeCategory);
  }, [activeCategory, displayProducts]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <div className="makeup">
      <Header />
      {/* Hero */}
      <section className="mk-hero">
        <div className="mk-hero-copy">
          <span className="eyebrow">Makeup Edit</span>
          <h1 className="display mk-hero-title">
            แต่งแต้ม<em>ตัวตน</em>ที่แท้จริง<br />ไม่ใช่ปกปิดมัน
          </h1>
          <p className="mk-hero-sub">
            เลือกช้อปตามส่วนที่อยากแต่งเติม เพื่อดูสินค้าที่คัดสรรมาให้เหมาะกับลุคของคุณ
          </p>
          <div className="mk-category-chips" role="group" aria-label="กรองตามหมวดเมคอัพ">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={`mk-chip${activeCategory === c.id ? " is-active" : ""}`}
                onClick={() => setActiveCategory(c.id)}
                aria-pressed={activeCategory === c.id}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mk-hero-visual">
          <div className="mk-droplet-frame">
            <div className="mk-ring">
              <div className="mk-core"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Application order rail */}
      <section className="mk-section" id="routine">
        <div className="mk-section-head">
          <div>
            <span className="eyebrow">Face Map</span>
            <h2 className="display mk-section-title">ลำดับการแต่งหน้า 4 ขั้นตอน</h2>
          </div>
        </div>
        <div className="mk-routine-rail">
          {APPLICATION_ORDER.map((r, i) => (
            <React.Fragment key={r.key}>
              <div className="mk-routine-item">
                <span className="mk-routine-mark">{r.step}</span>
                <h4>{r.title}</h4>
                <p>{r.text}</p>
              </div>
              {i < APPLICATION_ORDER.length - 1 && <div className="mk-routine-connector" aria-hidden="true" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="mk-section" id="products">
        <div className="mk-section-head">
          <div>
            <span className="eyebrow">
              {activeCategory === "all"
                ? "ทุกหมวด"
                : CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </span>
            <h2 className="display mk-section-title">
              {filtered.length} รายการที่ใช่สำหรับลุคของคุณ
            </h2>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mk-empty">ยังไม่มีสินค้าในหมวดนี้ ลองเลือกหมวดอื่นดูนะคะ</p>
        ) : (
          <div className="mk-product-grid">
            {filtered.map((p) => (
              <div className="mk-product-card" key={p.name}>
                <a
                  className="mk-product-link"
                  href={`/product?id=${encodeURIComponent(slugify(p.name))}`}
                  aria-label={`ดูรายละเอียดสินค้า ${p.name}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <div className="mk-product-media">

                  {p.tag && <span className="mk-product-tag">{p.tag}</span>}
                  <img src={p.img} alt={p.name} />
                  <button className="mk-product-quickadd" onClick={() => handleAddToCart(p)}>
                    {justAdded === p.name ? "เพิ่มแล้ว ✓" : "หยิบใส่ตะกร้า"}
                  </button>
                </div>
                <div className="mk-product-info">
                  <span className="mk-product-finish">{p.finish}</span>
                  <h3 className="mk-product-name">{p.name}</h3>
                  <p className="mk-product-desc">{p.desc}</p>
                  <div className="mk-product-price">
                    {p.oldPrice && <span className="old">฿{p.oldPrice}</span>}
                    ฿{p.price}
                  </div>
                </div>
              </a>
            <button className="mk-product-quickadd" onClick={() => handleAddToCart(p)}>
              {justAdded === p.name ? "เพิ่มแล้ว ✓" : "หยิบใส่ตะกร้า"}
            </button>
          </div>
        ))}

          </div>
        )}
      </section>

      {/* Philosophy / pull quote */}
      <section className="mk-philosophy">
        <div className="mk-droplet-divider"></div>
        <blockquote>
          "เมคอัพที่ดีไม่ใช่หน้ากาก แต่คือแสงที่ช่วยให้ตัวตนของคุณ
          ฉายชัดขึ้นในแบบที่เป็นคุณที่สุด"
        </blockquote>
        <cite>— ทีมพัฒนาสูตร Maison Véra</cite>
      </section>

      {/* Newsletter */}
      <section className="mk-newsletter">
        <span className="eyebrow">Join The List</span>
        <h3 className="display">รับสิทธิพิเศษก่อนใคร</h3>
        <p>สมัครรับข่าวสารเพื่อรับส่วนลด 10% สำหรับคำสั่งซื้อแรก และอัปเดตคอลเลกชันเมคอัพใหม่ก่อนใคร</p>
        {subscribed ? (
          <p className="display mk-newsletter-thanks">
            ขอบคุณที่ร่วมเป็นส่วนหนึ่งกับเรา ✦
          </p>
        ) : (
          <form className="mk-newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              required
              placeholder="อีเมลของคุณ"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">สมัครรับข่าวสาร</button>
          </form>
        )}
        <p className="mk-newsletter-note">เราจะไม่ส่งอีเมลรบกวนคุณ ยกเลิกการสมัครได้ทุกเมื่อ</p>
      </section>

      {/* Footer */}
      <footer className="mk-footer">
        <div className="mk-footer-grid">
          <div>
            <div className="mk-footer-logo">
              MAISON<span> Véra</span>
            </div>
            <p className="mk-tagline">
              เครื่องสำอางและสกินแคร์พรีเมียม ที่เชื่อในความงามอันเรียบง่ายและยั่งยืน
            </p>
          </div>
          <div>
            <h5>ช้อปปิ้ง</h5>
            <ul>
              <li><a href="/skincare">สกินแคร์</a></li>
              <li><a href="/makeup">เมคอัพ</a></li>
              <li><a href="/sets">เซ็ตของขวัญ</a></li>
            </ul>
          </div>
          <div>
            <h5>ช่วยเหลือ</h5>
            <ul>
              <li><a href="#shipping">การจัดส่ง</a></li>
              <li><a href="#returns">การคืนสินค้า</a></li>
              <li><a href="#faq">คำถามที่พบบ่อย</a></li>
              <li><a href="#contact">ติดต่อเรา</a></li>
            </ul>
          </div>
          <div>
            <h5>แบรนด์</h5>
            <ul>
              <li><a href="/about">เกี่ยวกับเรา</a></li>
              <li><a href="#journal">Journal</a></li>
              <li><a href="#store">สาขาหน้าร้าน</a></li>
            </ul>
          </div>
        </div>
        <div className="mk-footer-bottom">
          <span>© {new Date().getFullYear()} Maison Véra. All rights reserved.</span>
          <span>Bangkok, Thailand</span>
        </div>
      </footer>
    </div>
  );
}