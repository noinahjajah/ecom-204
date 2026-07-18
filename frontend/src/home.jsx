import React, { useState } from "react";
import "./home.css";
import Skincare from './User/Skincare';
import AuthHeaderIcon from './AuthHeaderIcon';

const CATEGORIES = [
  {
    name: "สกินแคร์",
    en: "Skincare",
    img: "https://placehold.co/600x800/efe1d8/221f1c?text=Skincare",
  },
  {
    name: "เมคอัพ",
    en: "Makeup",
    img: "https://placehold.co/600x800/d8cfc2/221f1c?text=Makeup",
  },
  {
    name: "น้ำหอม",
    en: "Fragrance",
    img: "https://placehold.co/600x800/ede6da/221f1c?text=Fragrance",
  },
];

const PRODUCTS = [
  {
    name: "Velvet Silk Serum",
    desc: "เซรั่มบำรุงผิวเข้มข้น เนื้อบางเบา ซึมไว",
    price: "2,480",
    oldPrice: null,
    tag: "New",
    img: "https://placehold.co/500x625/ffffff/ad8a55?text=Serum",
  },
  {
    name: "Rose Clay Cleansing Balm",
    desc: "บาล์มทำความสะอาดผิว สูตรอ่อนโยน",
    price: "1,290",
    oldPrice: "1,590",
    tag: "Sale",
    img: "https://placehold.co/500x625/ffffff/ad8a55?text=Cleanser",
  },
  {
    name: "Golden Hour Highlighter",
    desc: "ไฮไลท์เนื้อครีม ให้แสงประกายจากภายใน",
    price: "1,150",
    oldPrice: null,
    tag: null,
    img: "https://placehold.co/500x625/ffffff/ad8a55?text=Highlighter",
  },
  {
    name: "Bare Petal Lip Tint",
    desc: "ลิปทินท์เนื้อกำมะหยี่ ติดทนตลอดวัน",
    price: "890",
    oldPrice: null,
    tag: "Best Seller",
    img: "https://placehold.co/500x625/ffffff/ad8a55?text=Lip+Tint",
  },
];

const RITUAL = [
  {
    mark: "01",
    title: "คัดสรรวัตถุดิบ",
    text: "เลือกใช้สารสกัดธรรมชาติเกรดพรีเมียม ผ่านการทดสอบทางผิวหนังทุกล็อตการผลิต",
  },
  {
    mark: "02",
    title: "ผลิตอย่างพิถีพิถัน",
    text: "ควบคุมคุณภาพทุกขั้นตอนในห้องปฏิบัติการที่ได้มาตรฐานสากล ไร้สารกันเสียรุนแรง",
  },
  {
    mark: "03",
    title: "ส่งตรงถึงคุณ",
    text: "บรรจุภัณฑ์หรูหราพร้อมของขวัญห่อพิเศษ จัดส่งอย่างปลอดภัยทุกออเดอร์",
  },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <div className="home">
      {/* Announcement bar */}
      <div className="announce">จัดส่งฟรีทุกออเดอร์ตั้งแต่ 1,500 บาท · แถมกระเป๋าผ้าลิมิเต็ด</div>

      {/* Header */}
      <header className="header">
        <div className="logo">
          MAISON<span> Véra</span>
        </div>
        <nav>
          <ul className="nav">
            <li><a href="#home">หน้าแรก</a></li>
            <li><a href="skincare">สกินแคร์</a></li>
            <li><a href="makeup">เมคอัพ</a></li>

            <li><a href="about">เกี่ยวกับเรา</a></li>
          </ul>
        </nav>
        <div className="header-icons">
          <button className="icon-btn" aria-label="ค้นหา">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <AuthHeaderIcon />
          <button className="icon-btn" aria-label="ตะกร้าสินค้า">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M6 8h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span className="bag-count">2</span>
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-copy">
          <span className="eyebrow">New Collection — Silk Ritual</span>
          <h1 className="display hero-title">
            ความงามที่<em>เรียบง่าย</em><br />คือความหรูหราที่แท้จริง
          </h1>
          <p className="hero-sub">
            ค้นพบสกินแคร์และเมคอัพที่คัดสรรเพื่อผิวคุณโดยเฉพาะ
            เนื้อสัมผัสบางเบา ซึมซาบไว ให้ผิวเปล่งประกายอย่างเป็นธรรมชาติ
          </p>
          <div className="hero-actions">
            <button className="btn-primary">ช้อปคอลเลกชันใหม่</button>
            <button className="btn-ghost">ดูเรื่องราวแบรนด์</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="droplet-frame">
            <div className="ring">
              <div className="core"></div>
            </div>
          </div>
          <div className="hero-orbit-label display">หนึ่งหยด<br />เพื่อผิวที่สมบูรณ์แบบ</div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-wrap">
        <div className="marquee">
          <span>Cruelty Free</span>
          <span>Dermatologically Tested</span>
          <span>Clean Formula</span>
          <span>Made With Care</span>
          <span>Cruelty Free</span>
          <span>Dermatologically Tested</span>
          <span>Clean Formula</span>
          <span>Made With Care</span>
        </div>
      </div>

      {/* Categories */}
      <section className="section" id="categories">
        <div className="section-head">
          <div>
            <span className="eyebrow">Shop by Category</span>
            <h2 className="display section-title">เลือกช้อปตามหมวดหมู่</h2>
          </div>
        </div>
        <div className="category-rail">
          {CATEGORIES.map((c) => (
            <div className="category-card" key={c.en}>
              <img className="bg" src={c.img} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div className="overlay" />
              <div className="label">
                <span className="eyebrow">{c.en}</span>
                <div className="name display">{c.name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="section" id="products">
        <div className="section-head">
          <div>
            <span className="eyebrow">Editor's Pick</span>
            <h2 className="display section-title">Best seller</h2>
          </div>
          <a href="#all" className="section-link">Best seller</a>
        </div>
        <div className="product-grid">
          {PRODUCTS.map((p) => (
            <div className="product-card" key={p.name}>
              <div className="product-media">
                {p.tag && <span className="product-tag">{p.tag}</span>}
                <img src={p.img} alt={p.name} />
                <button className="product-quickadd">หยิบใส่ตะกร้า</button>
              </div>
              <div className="product-info">
                <span className="eyebrow">Maison Véra</span>
                <h3 className="product-name">{p.name}</h3>
                <p className="product-desc">{p.desc}</p>
                <div className="product-price">
                  {p.oldPrice && <span className="old">฿{p.oldPrice}</span>}
                  ฿{p.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy / pull quote */}
      <section className="philosophy">
        <div className="droplet-divider"></div>
        <blockquote>
          "เราเชื่อว่าผิวสวยไม่ได้มาจากสูตรที่ซับซ้อน
          แต่มาจากส่วนผสมที่จริงใจ และพิธีกรรมที่ทำด้วยความใส่ใจทุกวัน"
        </blockquote>
        <cite>— ผู้ก่อตั้ง Maison Véra</cite>
      </section>

      {/* Ritual / process */}
      <section className="section" id="ritual" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div>
            <span className="eyebrow">Our Craft</span>
            <h2 className="display section-title">กว่าจะเป็นหนึ่งขวด</h2>
          </div>
        </div>
        <div className="ritual">
          {RITUAL.map((r) => (
            <div className="ritual-item" key={r.mark}>
              <span className="mark">{r.mark}</span>
              <h4>{r.title}</h4>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial banner
      <section className="editorial" id="about">
        <div className="editorial-media"></div>
        <div className="editorial-copy">
          <span className="eyebrow">The Silk Ritual</span>
          <h3 className="display">พิธีกรรมบำรุงผิว 3 ขั้นตอน เพื่อผิวที่เปล่งประกายจากภายใน</h3>
          <p>
            เริ่มต้นเช้าและค่ำของคุณด้วยขั้นตอนที่ออกแบบมาให้เข้ากับผิวทุกประเภท
            ตั้งแต่ทำความสะอาด บำรุง ไปจนถึงปกป้อง — เรียบง่ายแต่ได้ผลลัพธ์ที่มองเห็นได้จริง
          </p>
          <button className="btn-ghost">อ่านเรื่องราวทั้งหมด</button>
        </div>
      </section> */}

      {/* Newsletter */}
      <section className="newsletter">
        <span className="eyebrow">Join The List</span>
        <h3 className="display">รับสิทธิพิเศษก่อนใคร</h3>
        <p>สมัครรับข่าวสารเพื่อรับส่วนลด 10% สำหรับคำสั่งซื้อแรก และอัปเดตคอลเลกชันใหม่ก่อนใคร</p>
        {subscribed ? (
          <p className="display" style={{ fontStyle: "italic", fontSize: "1.1rem" }}>
            ขอบคุณที่ร่วมเป็นส่วนหนึ่งกับเรา ✦
          </p>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubscribe}>
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
        <p className="newsletter-note">เราจะไม่ส่งอีเมลรบกวนคุณ ยกเลิกการสมัครได้ทุกเมื่อ</p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              MAISON<span> Véra</span>
            </div>
            <p className="tagline">
              เครื่องสำอางและสกินแคร์พรีเมียม ที่เชื่อในความงามอันเรียบง่ายและยั่งยืน
            </p>
          </div>
          <div>
            <h5>ช้อปปิ้ง</h5>
            <ul>
              <li><a href="skincare">สกินแคร์</a></li>
              <li><a href="makeup">เมคอัพ</a></li>
              <li><a href="#sets">เซ็ตของขวัญ</a></li>
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
              <li><a href="#about">เกี่ยวกับเรา</a></li>
              <li><a href="#journal">Journal</a></li>
              <li><a href="#store">สาขาหน้าร้าน</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Maison Véra. All rights reserved.</span>
          <span>Bangkok, Thailand</span>
        </div>
      </footer>
    </div>
  );
}