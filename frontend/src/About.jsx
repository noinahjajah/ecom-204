import React, { useState } from "react";
import "./about.css";
import Header from "./Header";
/**
 * About — หน้าเกี่ยวกับเรา เว็บอีคอมเมิร์ซเครื่องสำอาง Maison Véra
 * ธีม: White Luxury (ivory / ink / gold) — สีชุดเดียวกับ home.css
 * ฟอนต์: Fraunces (display) + Jost + IBM Plex Sans Thai (body) — โหลดผ่าน Google Fonts ใน about.css
 *
 * วิธีใช้: import About from "./About";  แล้ววาง <About /> ใน route "/about"
 */

const VALUES = [
  {
    title: "ส่วนผสมที่จริงใจ",
    text: "เลือกใช้สารสกัดธรรมชาติเกรดพรีเมียม ไม่ใช้สารกันเสียรุนแรง และเปิดเผยส่วนผสมทุกตัวอย่างโปร่งใส",
  },
  {
    title: "ไม่ทดลองกับสัตว์",
    text: "ทุกสูตรผ่านการรับรอง Cruelty Free ตั้งแต่ขั้นตอนพัฒนาจนถึงวางจำหน่าย",
  },
  {
    title: "ผลิตอย่างพิถีพิถัน",
    text: "ผลิตล็อตเล็กในห้องปฏิบัติการที่ได้มาตรฐานสากล ควบคุมคุณภาพทุกขวดก่อนส่งถึงมือคุณ",
  },
];

const TIMELINE = [
  {
    year: "2018",
    title: "จุดเริ่มต้นในครัวเล็กๆ",
    text: "ผู้ก่อตั้งเริ่มผสมเซรั่มสูตรแรกด้วยมือ จากความต้องการหาสกินแคร์ที่เข้ากับผิวแพ้ง่ายของตัวเอง",
  },
  {
    year: "2020",
    title: "เปิดตัว Maison Véra",
    text: "เปิดตัวคอลเลกชันแรกอย่างเป็นทางการ พร้อมเซรั่มและคลีนซิ่งบาล์มสูตรต้นตำรับ",
  },
  {
    year: "2022",
    title: "ขยายสู่หมวดเมคอัพ",
    text: "ต่อยอดปรัชญาความงามแบบเรียบง่ายสู่เมคอัพ ให้ผิวสวยและมีมิติในเวลาเดียวกัน",
  },
  {
    year: "2025",
    title: "ก้าวสู่สากล",
    text: "ได้รับความไว้วางใจจากลูกค้าทั่วภูมิภาค พร้อมมาตรฐานการผลิตที่ได้รับการรับรองระดับสากล",
  },
];

export default function About() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <div className="about">
      <Header />

    

      {/* Hero */}
      <section className="ab-hero">
        <span className="eyebrow">Our Story</span>
        <h1 className="display ab-hero-title">
          เราไม่ได้สร้างแบรนด์<br /><em>เราสร้างพิธีกรรม</em>ของทุกวัน
        </h1>
        <p className="ab-hero-sub">
          Maison Véra เกิดจากความเชื่อว่าความงามที่แท้จริงไม่ต้องซับซ้อน
          แค่ส่วนผสมที่จริงใจ และเวลาไม่กี่นาทีที่คุณให้กับตัวเองในทุกๆ วัน
        </p>
      </section>

      {/* Founder note */}
      <section className="ab-founder">
        <div className="ab-founder-media"></div>
        <div className="ab-founder-copy">
          <span className="eyebrow">The Founder</span>
          <h2 className="display">เริ่มต้นจากปัญหาผิวของตัวเอง</h2>
          <p>
            ก่อนจะเป็น Maison Véra ผู้ก่อตั้งของเราคือคนที่ค้นหาสกินแคร์ที่เข้ากับผิวแพ้ง่ายมาทั้งชีวิต
            ลองผิดลองถูกกับหลายแบรนด์จนตัดสินใจผสมสูตรแรกด้วยมือตัวเองในครัวเล็กๆ
          </p>
          <p>
            วันนี้ปรัชญานั้นยังคงเดิม — ทุกสูตรต้องอ่อนโยนพอสำหรับผิวแพ้ง่ายที่สุด
            และมีประสิทธิภาพพอสำหรับคนที่ต้องการผลลัพธ์จริง
          </p>
          <cite>— ผู้ก่อตั้ง Maison Véra</cite>
        </div>
      </section>

      {/* Values */}
      <section className="ab-section" id="values">
        <div className="ab-section-head">
          <div>
            <span className="eyebrow">What We Believe</span>
            <h2 className="display ab-section-title">สิ่งที่เรายึดมั่น</h2>
          </div>
        </div>
        <div className="ab-values-grid">
          {VALUES.map((v) => (
            <div className="ab-value-card" key={v.title}>
              <h4>{v.title}</h4>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="ab-section" id="timeline">
        <div className="ab-section-head">
          <div>
            <span className="eyebrow">Our Journey</span>
            <h2 className="display ab-section-title">เส้นทางของเรา</h2>
          </div>
        </div>
        <div className="ab-timeline">
          {TIMELINE.map((t, i) => (
            <div className="ab-timeline-item" key={t.year}>
              <div className="ab-timeline-marker">
                <span className="ab-timeline-year display">{t.year}</span>
                {i < TIMELINE.length - 1 && <span className="ab-timeline-line" aria-hidden="true" />}
              </div>
              <div className="ab-timeline-content">
                <h4>{t.title}</h4>
                <p>{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy / pull quote */}
      <section className="ab-philosophy">
        <div className="ab-droplet-divider"></div>
        <blockquote>
          "เราเชื่อว่าผิวสวยไม่ได้มาจากสูตรที่ซับซ้อน
          แต่มาจากส่วนผสมที่จริงใจ และพิธีกรรมที่ทำด้วยความใส่ใจทุกวัน"
        </blockquote>
        <cite>— ผู้ก่อตั้ง Maison Véra</cite>
      </section>

      {/* Newsletter */}
      <section className="ab-newsletter">
        <span className="eyebrow">Join The List</span>
        <h3 className="display">รับสิทธิพิเศษก่อนใคร</h3>
        <p>สมัครรับข่าวสารเพื่อรับส่วนลด 10% สำหรับคำสั่งซื้อแรก และอัปเดตคอลเลกชันใหม่ก่อนใคร</p>
        {subscribed ? (
          <p className="display ab-newsletter-thanks">
            ขอบคุณที่ร่วมเป็นส่วนหนึ่งกับเรา ✦
          </p>
        ) : (
          <form className="ab-newsletter-form" onSubmit={handleSubscribe}>
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
        <p className="ab-newsletter-note">เราจะไม่ส่งอีเมลรบกวนคุณ ยกเลิกการสมัครได้ทุกเมื่อ</p>
      </section>

      {/* Footer */}
      <footer className="ab-footer">
        <div className="ab-footer-grid">
          <div>
            <div className="ab-footer-logo">
              MAISON<span> Véra</span>
            </div>
            <p className="ab-tagline">
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
        <div className="ab-footer-bottom">
          <span>© {new Date().getFullYear()} Maison Véra. All rights reserved.</span>
          <span>Bangkok, Thailand</span>
        </div>
      </footer>
    </div>
  );
}