import React, { useState, useMemo } from "react";
import "./Skincare.css";
import Header from "./Header";
import { addToCart, slugify } from "./cart";
/**
 * Skincare — หน้าหมวดสกินแคร์ เว็บอีคอมเมิร์ซเครื่องสำอาง Maison Véra
 * ธีม: White Luxury (ivory / ink / muted gold / sage)
 * ฟอนต์: Fraunces (display) + Jost (body) — โหลดผ่าน Google Fonts ใน skincare.css
 *
 * วิธีใช้: import Skincare from "./Skincare";  แล้ววาง <Skincare /> ใน route "/skincare"
 * แก้ไขข้อมูลสินค้าในตัวแปร PRODUCTS ด้านล่างได้เลย
 */

const CONCERNS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "dry", label: "ผิวแห้ง" },
  { id: "oily", label: "ผิวมัน & รูขุมขน" },
  { id: "dull", label: "ผิวหมองคล้ำ" },
  { id: "aging", label: "ริ้วรอย" },
  { id: "sensitive", label: "ผิวแพ้ง่าย" },
];

const ROUTINE = [
  {
    step: "01",
    key: "cleanse",
    title: "ทำความสะอาด",
    text: "ล้างสิ่งสกปรกและความมันส่วนเกินอย่างอ่อนโยน ไม่ทำลายเกราะปกป้องผิว",
  },
  {
    step: "02",
    key: "tone",
    title: "ปรับสมดุลผิว",
    text: "คืนค่า pH ให้ผิว เตรียมพร้อมดูดซึมบำรุงในขั้นตอนถัดไป",
  },
  {
    step: "03",
    key: "treat",
    title: "บำรุงเข้มข้น",
    text: "เซรั่มและแอมพูลที่เจาะจงตามปัญหาผิว ซึมไว เห็นผลตรงจุด",
  },
  {
    step: "04",
    key: "moisturize",
    title: "กักเก็บความชุ่มชื้น",
    text: "ล็อกน้ำในผิวชั้นนอก ให้ผิวนุ่มยืดหยุ่นตลอดวัน",
  },
  {
    step: "05",
    key: "protect",
    title: "ปกป้องจากแสงแดด",
    text: "ด่านสุดท้ายที่ขาดไม่ได้ ป้องกันริ้วรอยและจุดด่างดำก่อนเกิด",
  },
];

const PRODUCTS = [
  {
    name: "Rose Clay Cleansing Balm",
    desc: "บาล์มทำความสะอาดผิว ละลายเครื่องสำอางและสิ่งสกปรกอย่างอ่อนโยน",
    price: "1,290",
    oldPrice: "1,590",
    tag: "Sale",
    step: "cleanse",
    concerns: ["dry", "sensitive"],
    ingredient: "โคลนกุหลาบ + น้ำมันโจโจบา",
    img: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Cleansing+Balm",
  },
  {
    name: "Centella Calm Toner",
    desc: "โทนเนอร์ผสานสารสกัดใบบัวบก เย็นสบาย ลดผิวแดงระคายเคือง",
    price: "980",
    oldPrice: null,
    tag: null,
    step: "tone",
    concerns: ["sensitive", "dull"],
    ingredient: "สารสกัดใบบัวบก",
    img: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Toner",
  },
  {
    name: "Velvet Silk Serum",
    desc: "เซรั่มบำรุงผิวเข้มข้น เนื้อบางเบา ซึมไว ลดเลือนริ้วรอยก่อนวัย",
    price: "2,480",
    oldPrice: null,
    tag: "New",
    step: "treat",
    concerns: ["aging", "dull"],
    ingredient: "เปปไทด์ + น้ำมันไหม",
    img: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Serum",
  },
  {
    name: "Niacinamide Pore Refine",
    desc: "เซรั่มเนื้อน้ำ ควบคุมความมันและรูขุมขนให้กระชับขึ้นตั้งแต่สัปดาห์แรก",
    price: "1,450",
    oldPrice: null,
    tag: "Best Seller",
    step: "treat",
    concerns: ["oily"],
    ingredient: "ไนอาซินาไมด์ 10%",
    img: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Serum",
  },
  {
    name: "Vitamin C Bright Ampoule",
    desc: "แอมพูลวิตามินซีเสถียรสูตรเข้มข้น ลดรอยหมองคล้ำ ผิวกระจ่างใสขึ้นอย่างเป็นธรรมชาติ",
    price: "2,190",
    oldPrice: null,
    tag: null,
    step: "treat",
    concerns: ["dull", "aging"],
    ingredient: "วิตามินซี 15%",
    img: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Ampoule",
  },
  {
    name: "Hyaluronic Dew Moisturizer",
    desc: "มอยส์เจอไรเซอร์เนื้อเจลครีม กักเก็บความชุ่มชื้นได้นานถึง 24 ชั่วโมง",
    price: "1,650",
    oldPrice: null,
    tag: null,
    step: "moisturize",
    concerns: ["dry", "sensitive"],
    ingredient: "ไฮยาลูรอนิก แอซิด 5 ชนิด",
    img: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Moisturizer",
  },
  {
    name: "Golden Clay Mask",
    desc: "มาส์กโคลนทองคำ ดูดซับความมันส่วนเกิน กระชับรูขุมขนใน 15 นาที",
    price: "1,190",
    oldPrice: null,
    tag: null,
    step: "treat",
    concerns: ["oily"],
    ingredient: "โคลนภูเขาไฟ + ทองคำ 24K",
    img: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Clay+Mask",
  },
  {
    name: "Silk Veil SPF 50",
    desc: "กันแดดเนื้อบางเบาใต้เมคอัพ ปกป้อง UVA/UVB ไม่ทิ้งคราบขาว",
    price: "1,090",
    oldPrice: null,
    tag: "Best Seller",
    step: "protect",
    concerns: ["oily", "sensitive", "dry", "aging", "dull"],
    ingredient: "SPF 50 PA++++",
    img: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Sunscreen",
  },
];

export default function Skincare() {
  const [activeConcern, setActiveConcern] = useState("all");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [justAdded, setJustAdded] = useState(null);

  const handleAddToCart = (p) => {
    addToCart({
      id: slugify(p.name),
      name: p.name,
      category: "สกินแคร์",
      variant: ROUTINE.find((r) => r.key === p.step)?.title || "",
      price: p.price,
      image: p.img,
    });
    setJustAdded(p.name);
    window.clearTimeout(handleAddToCart._t);
    handleAddToCart._t = window.setTimeout(() => setJustAdded(null), 1400);
  };

  const filtered = useMemo(() => {
    if (activeConcern === "all") return PRODUCTS;
    return PRODUCTS.filter((p) => p.concerns.includes(activeConcern));
  }, [activeConcern]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <div className="skincare">
      <Header />
      {/* Hero */}
      <section className="sc-hero">
        <div className="sc-hero-copy">
          <span className="eyebrow">Skincare Edit</span>
          <h1 className="display sc-hero-title">
            ผิวของคุณ<em>เล่าเรื่อง</em>ของมันเอง<br />เราแค่ช่วยฟัง
          </h1>
          <p className="sc-hero-sub">
            เลือกปัญหาผิวที่คุณกังวล เพื่อดูสูตรบำรุงที่คัดสรรมาให้เหมาะกับผิวคุณโดยเฉพาะ
          </p>
          <div className="sc-concern-chips" role="group" aria-label="กรองตามปัญหาผิว">
            {CONCERNS.map((c) => (
              <button
                key={c.id}
                className={`sc-chip${activeConcern === c.id ? " is-active" : ""}`}
                onClick={() => setActiveConcern(c.id)}
                aria-pressed={activeConcern === c.id}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="sc-hero-visual">
          <div className="sc-droplet-frame">
            <div className="sc-ring">
              <div className="sc-core"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Routine rail */}
      <section className="sc-section" id="routine">
        <div className="sc-section-head">
          <div>
            <span className="eyebrow">The Ritual</span>
            <h2 className="display sc-section-title">พิธีกรรมบำรุงผิว 5 ขั้นตอน</h2>
          </div>
        </div>
        <div className="sc-routine-rail">
          {ROUTINE.map((r, i) => (
            <React.Fragment key={r.key}>
              <div className="sc-routine-item">
                <span className="sc-routine-mark">{r.step}</span>
                <h4>{r.title}</h4>
                <p>{r.text}</p>
              </div>
              {i < ROUTINE.length - 1 && <div className="sc-routine-connector" aria-hidden="true" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="sc-section" id="products">
        <div className="sc-section-head">
          <div>
            <span className="eyebrow">
              {activeConcern === "all"
                ? "ทุกสูตร"
                : CONCERNS.find((c) => c.id === activeConcern)?.label}
            </span>
            <h2 className="display sc-section-title">
              {filtered.length} รายการที่ใช่สำหรับผิวคุณ
            </h2>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="sc-empty">ยังไม่มีสินค้าสำหรับปัญหาผิวนี้ ลองเลือกหมวดอื่นดูนะคะ</p>
        ) : (
          <div className="sc-product-grid">
            {filtered.map((p) => (
              <div className="sc-product-card" key={p.name}>
                <a
                  className="sc-product-link"
                  href={`/product?id=${encodeURIComponent(slugify(p.name))}`}
                  aria-label={`ดูรายละเอียดสินค้า ${p.name}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <div className="sc-product-media">
                    {p.tag && <span className="sc-product-tag">{p.tag}</span>}
                    <img src={p.img} alt={p.name} />
                  </div>
                  <div className="sc-product-info">
                    <span className="sc-product-step">
                      {ROUTINE.find((r) => r.key === p.step)?.title}
                    </span>
                    <h3 className="sc-product-name">{p.name}</h3>
                    <p className="sc-product-desc">{p.desc}</p>
                    <p className="sc-product-ingredient">สารสำคัญ: {p.ingredient}</p>
                    <div className="sc-product-price">
                      {p.oldPrice && <span className="old">฿{p.oldPrice}</span>}
                      ฿{p.price}
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>

        )}
      </section>


      {/* Philosophy / pull quote */}
      <section className="sc-philosophy">
        <div className="sc-droplet-divider"></div>
        <blockquote>
          "ผิวแต่ละคนมีจังหวะของตัวเอง เราไม่เชื่อในสูตรเดียวที่ใช้ได้กับทุกคน
          แต่เชื่อในการฟังผิวของคุณ แล้วตอบสนองด้วยส่วนผสมที่จริงใจ"
        </blockquote>
        <cite>— ทีมพัฒนาสูตร Maison Véra</cite>
      </section>

      {/* Newsletter */}
      <section className="sc-newsletter">
        <span className="eyebrow">Join The List</span>
        <h3 className="display">รับสิทธิพิเศษก่อนใคร</h3>
        <p>สมัครรับข่าวสารเพื่อรับส่วนลด 10% สำหรับคำสั่งซื้อแรก และอัปเดตคอลเลกชันสกินแคร์ใหม่ก่อนใคร</p>
        {subscribed ? (
          <p className="display sc-newsletter-thanks">
            ขอบคุณที่ร่วมเป็นส่วนหนึ่งกับเรา ✦
          </p>
        ) : (
          <form className="sc-newsletter-form" onSubmit={handleSubscribe}>
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
        <p className="sc-newsletter-note">เราจะไม่ส่งอีเมลรบกวนคุณ ยกเลิกการสมัครได้ทุกเมื่อ</p>
      </section>

      {/* Footer */}
      <footer className="sc-footer">
        <div className="sc-footer-grid">
          <div>
            <div className="sc-footer-logo">
              MAISON<span> Véra</span>
            </div>
            <p className="sc-tagline">
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
        <div className="sc-footer-bottom">
          <span>© {new Date().getFullYear()} Maison Véra. All rights reserved.</span>
          <span>Bangkok, Thailand</span>
        </div>
      </footer>
    </div>
  );
}