
# 🌸 Maison Véra

### แพลตฟอร์มอีคอมเมิร์ซเครื่องสำอางและสกินแคร์ครบวงจร

**เว็บไซต์ขายเครื่องสำอางออนไลน์ ตั้งแต่หน้าร้านสำหรับลูกค้าไปจนถึงระบบหลังบ้านสำหรับแอดมิน**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](#)

[![Status](https://img.shields.io/badge/status-in%20development-yellow?style=flat-square)](#)
[![Responsive](https://img.shields.io/badge/responsive-yes-brightgreen?style=flat-square)](#)
[![University Project](https://img.shields.io/badge/university%20project-CSI204-blue?style=flat-square)](#)
[![Version](https://img.shields.io/badge/version-0.1.0-lightgrey?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](#license)


📖 [เอกสารระบบ](#-เอกสารประกอบโครงงาน) ·


</div>

---

## 📚 สารบัญ

- [เกี่ยวกับโครงงาน](#-เกี่ยวกับโครงงาน)
- [ผู้จัดทำ](#-ผู้จัดทำ)
- [Persona Design](#-persona-design-การออกแบบตัวละครผู้ใช้งานจำลอง)
- [เป้าหมายทางธุรกิจ](#-เป้าหมายทางธุรกิจ)
- [ฟีเจอร์ของระบบ](#-ฟีเจอร์ของระบบ)
- [เทคโนโลยีที่ใช้](#-เทคโนโลยีที่ใช้)
- [เอกสารประกอบโครงงาน](#-เอกสารประกอบโครงงาน)
  - [Use Case Diagram](#-use-case-diagram)
  - [Sequence Diagram](#-sequence-diagram)
  - [Wireframe / Prototype](#-wireframe--prototype)
  - [Data Schema (JSON)](#-data-schema-json)
- [User Acceptance Testing](#-user-acceptance-testing-uat)
- [SLA และแผนการดูแลระบบหลังส่งมอบ](#-sla-และแผนการดูแลระบบหลังส่งมอบ)
- [แผนพัฒนาต่อในอนาคต](#-แผนพัฒนาต่อในอนาคต)


---

## 💡 เกี่ยวกับโครงงาน

**Maison Véra** คือโครงงานเว็บไซต์อีคอมเมิร์ซสำหรับขายเครื่องสำอางและผลิตภัณฑ์สกินแคร์ พัฒนาขึ้นในรายวิชา **CSI204 - ดิจิทัลแพลตฟอร์มสำหรับพัฒนาซอฟต์แวร์**

แนวคิดเริ่มต้นมาจากการสังเกตพฤติกรรมลูกค้าเครื่องสำอางยุคใหม่ ที่ต้องการค้นหาสินค้าที่ต้องการผิวหรือหมวดหมู่ได้ง่าย เปรียบเทียบสินค้าได้รวดเร็ว และชำระเงินได้อย่างปลอดภัยโดยไม่ต้องออกจากบ้าน ทีมผู้จัดทำจึงออกแบบ Maison Véraให้เป็นแพลตฟอร์มที่ครบทั้งฝั่งลูกค้าและฝั่งผู้ดูแลร้าน โดยเน้นดีไซน์โทนสี **rose-gold** ที่สื่อถึงความหรูหราและอ่อนโยน เหมาะกับกลุ่มสินค้าความงาม

ระบบแบ่งออกเป็น 2 ส่วนหลัก คือ **หน้าร้านสำหรับลูกค้า** ที่ให้เลือกซื้อสินค้า ค้นหา และชำระเงิน และ **แดชบอร์ดผู้ดูแลระบบ** ที่ใช้จัดการสินค้า สต็อก คำสั่งซื้อ และดูรายงานยอดขาย

---

## 👥 ผู้จัดทำ

| ชื่อ-นามสกุล | บทบาท | GitHub |
|---|---|---|
| [67133846 วรัตถา เตนากุล] | backend| [@warattha48](https://github.com/warattha48) |
| [67167033 เปมิกา เมฆลอย] | Frontend Developer | [@l0w0l-0](https://github.com/l0w0l-0) |
| [67180663 ภัทรพล ถ่อมดี] | backend | [@noinahjajah](https://github.com/noinahjajah) |


> จัดทำในรายวิชา **CSI204 - ดิจิทัลแพลตฟอร์มสำหรับพัฒนาซอฟต์แวร์**

---

## 🎭 Persona Design (การออกแบบตัวละครผู้ใช้งานจำลอง)

เพื่อทำความเข้าใจความต้องการของลูกค้า จึงได้ออกแบบ Persona ของกลุ่มเป้าหมายหลัก ดังนี้

> **👤 พริมรตา (พริม) - "The Mindful Minimalist"**
> *"การดูแลตัวเองไม่ใช่ความฟุ่มเฟือย แต่คือการลงทุนและให้รางวัลกับตัวเองในทุกๆ วันที่เหนื่อยล้า"*

*   **ข้อมูลเบื้องต้น:** อายุ 28 ปี / ผู้จัดการฝ่ายการตลาด / รายได้ 45,000 - 60,000 บาท
*   **ไลฟ์สไตล์:** ใช้ชีวิตเร่งรีบ ทำงานหนัก ชอบความเรียบง่าย (Minimal) และเน้นคุณภาพสินค้ามากกว่าปริมาณ
*   **ความต้องการ (Needs):** แพลตฟอร์มที่สะอาดตา (Clean UI) ค้นหาง่าย และขั้นตอนชำระเงินที่สั้นและรวดเร็ว
*   **ปัญหาที่พบ (Pain Points):** ไม่มีเวลาไปเดินซื้อสินค้า, รำคาญการกรอกข้อมูลสมัครสมาชิกที่ยาวเกินไป และหงุดหงิดหากติดตามสถานะพัสดุไม่ได้
*   **การใช้เทคโนโลยี:** เชี่ยวชาญสูง (Mobile-first) มักช้อปปิ้งช่วงพักกลางวัน หรือก่อนนอน (21:00 - 23:00 น.)

---

> **👤 นภัสกร (นัท) - "The Beauty Explorer"**
> *"ชีวิตนี้ต้องลองให้หมด สกินแคร์เทรนด์ใหม่มาแป๊บเดียวก็ต้องมีในตะกร้าแล้ว"*

*   **ข้อมูลเบื้องต้น:** อายุ 20 ปี / นักศึกษาปี 2 / รายได้จากค่าขนม 5,000 - 8,000 บาท/เดือน
*   **ไลฟ์สไตล์:** ตามเทรนด์ความงามจาก TikTok/Instagram ตลอดเวลา ชอบทดลองสินค้าใหม่ๆ ราคาย่อมเยา ซื้อบ่อยแต่ทีละน้อย
*   **ความต้องการ (Needs):** ระบบรีวิว/เรตติ้งสินค้าที่น่าเชื่อถือ โปรโมชั่น/ส่วนลดที่ชัดเจน และฟีเจอร์เปรียบเทียบสินค้า
*   **ปัญหาที่พบ (Pain Points):** งบจำกัดแต่อยากได้ของครบ, ไม่แน่ใจว่าสินค้าตรงปกไหมก่อนสั่ง, กังวลเรื่องค่าส่งที่แพงเกินไปเมื่อเทียบกับยอดซื้อ
*   **การใช้เทคโนโลยี:** เชี่ยวชาญสูงมาก ใช้มือถือเป็นหลัก 100% ช้อปช่วงมีโปรโมชั่นหรือหลังเห็นรีวิวจากอินฟลูเอนเซอร์

---

> **👤 สุนีย์ (ป้าหนี) - "The Cautious Caregiver"**
> *"ก่อนซื้ออะไรให้ตัวเองหรือลูก ต้องอ่านให้ละเอียด เชื่อได้จริงถึงจะกล้าจ่าย"*

*   **ข้อมูลเบื้องต้น:** อายุ 45 ปี / เจ้าของธุรกิจส่วนตัว / รายได้ 30,000 - 40,000 บาท/เดือน
*   **ไลฟ์สไตล์:** ดูแลทั้งตัวเองและครอบครัว ให้ความสำคัญกับความปลอดภัยและส่วนผสมของผลิตภัณฑ์มากกว่าราคา
*   **ความต้องการ (Needs):** ข้อมูลส่วนผสม/แหล่งผลิตที่ชัดเจนในหน้ารายละเอียดสินค้า ช่องทางติดต่อแอดมิน/ฝ่ายบริการลูกค้าที่เข้าถึงง่าย และระบบติดตามพัสดุที่อัปเดตแม่นยำ
*   **ปัญหาที่พบ (Pain Points):** ไม่มั่นใจการชำระเงินออนไลน์ กลัวโดนหลอก, ตัวอักษร/ปุ่มบนเว็บเล็กเกินไปทำให้อ่านยาก, ไม่ชอบขั้นตอนสมัครสมาชิกที่ซับซ้อน
*   **การใช้เทคโนโลยี:** ปานกลาง ใช้คอมพิวเตอร์ตั้งโต๊ะเป็นหลักมากกว่ามือถือ ช้อปช่วงกลางวันเวลาว่างจากร้าน

---

> **👤 กันตพงศ์ (เก่ง) - "The Store Operator"**
> *"สต็อกต้องแม่น ออเดอร์ต้องไว ยอดขายต้องเห็นภาพรวมได้ในคลิกเดียว"*

*   **ข้อมูลเบื้องต้น:** อายุ 32 ปี / แอดมินร้าน/เจ้าหน้าที่คลังสินค้า / ดูแลระบบหลังบ้านของ Maison Véra
*   **ไลฟ์สไตล์:** ทำงานหน้าจอทั้งวัน ต้องจัดการสินค้า สต็อก และคำสั่งซื้อจำนวนมากพร้อมกันให้ทันเวลา
*   **ความต้องการ (Needs):** แดชบอร์ดที่สรุปข้อมูลสำคัญได้รวดเร็ว (ยอดขาย/สต็อกใกล้หมด/ออเดอร์ค้าง) ฟีเจอร์จัดการสินค้าแบบ Bulk Action และระบบแจ้งเตือนเมื่อสต็อกต่ำ
*   **ปัญหาที่พบ (Pain Points):** ต้องสลับหน้าไปมาหลายจุดเพื่อจัดการงานเดียว, ข้อมูลสต็อก/คำสั่งซื้อไม่อัปเดตเรียลไทม์ ทำให้ขายสินค้าเกินสต็อก, ตรวจสอบสถานะการชำระเงินยาก
*   **การใช้เทคโนโลยี:** เชี่ยวชาญสูง ใช้ระบบแอดมินตลอดเวลาทำงาน (09:00 - 18:00 น.) ผ่านคอมพิวเตอร์เป็นหลัก

---

## 🎯 เป้าหมายทางธุรกิจ

| เป้าหมาย | รายละเอียด |
|---|---|
| 🛒 ขยายช่องทางขาย | เปิดช่องทางขายออนไลน์เพิ่มเติมนอกเหนือจากหน้าร้าน |
| ✨ ยกระดับประสบการณ์ลูกค้า | ให้ลูกค้าค้นหาและเลือกซื้อสินค้าได้สะดวก รวดเร็ว |
| 🔒 ระบบซื้อขายที่ปลอดภัย | รองรับการชำระเงินออนไลน์ที่เชื่อถือได้ |
| 📈 เพิ่มรายได้ธุรกิจ | สร้างช่องทางรายได้ใหม่ให้ธุรกิจเติบโต |
| 🚀 รองรับการขยายระบบในอนาคต | ออกแบบสถาปัตยกรรมให้ต่อยอดฟีเจอร์ใหม่ได้ง่าย |

---

## ✅ ฟีเจอร์ของระบบ

<table>
<tr>
<td valign="top" width="50%">

### 👤 ฝั่งลูกค้า

- ✅ หน้าแรก (Home)
- ✅ สมัครสมาชิก / เข้าสู่ระบบ
- ✅ แสดงสินค้าทั้งหมด (Product Catalog)
- ✅ หน้ารายละเอียดสินค้า
- ✅ ค้นหาสินค้า
- ✅ ตะกร้าสินค้า
- ✅ ขั้นตอนชำระเงิน (Checkout)
- ✅ โปรไฟล์ผู้ใช้
- ✅ ประวัติคำสั่งซื้อ


</td>
<td valign="top" width="50%">

### 🛠️ ฝั่งผู้ดูแลระบบ

- ✅ ภาพรวมแดชบอร์ด
- ✅ จัดการสินค้า
- ✅ จัดการหมวดหมู่
- ✅ จัดการสต็อกสินค้า
- ✅ จัดการข้อมูลลูกค้า
- ✅ จัดการคำสั่งซื้อ
- ✅ จัดการการชำระเงิน
- ✅ รายงานและวิเคราะห์ยอดขาย


</td>
</tr>
</table>

---

## 🧰 เทคโนโลยีที่ใช้

**ฝั่ง Frontend**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white)](#)

**ฝั่ง Backend (แผนพัฒนาต่อ)**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](#)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](#)

**ฐานข้อมูล (แผนพัฒนาต่อ)**

[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)](#)

**เครื่องมือที่ใช้ในทีม**

[![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)](#)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](#)
[![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white)](#)
[![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=postman&logoColor=white)](#)

**เครื่องมือออกแบบ**

[![Figma](https://img.shields.io/badge/Figma-F24E1E?style=flat-square&logo=figma&logoColor=white)](#)
[![draw.io](https://img.shields.io/badge/draw.io-F08705?style=flat-square&logo=diagramsdotnet&logoColor=white)](#)

---

---
 
## 📑 เอกสารประกอบโครงงาน
 
เอกสารออกแบบทั้งหมดของโครงงาน ตั้งแต่ภาพรวมสถาปัตยกรรม, Use Case, Sequence, Wireframe ไปจนถึง Data Schema — ออกแบบด้วย **draw.io** และ **Figma** ก่อนเริ่มพัฒนาโค้ดจริง
  
### 🧩 Use Case Diagram
<img width="1247" height="1242" alt="เเก้ไข use" src="https://github.com/user-attachments/assets/17e14bdd-c9cb-4ba0-aeaa-0148e3337cee" />

### Class Diagram 
<img width="8192" height="6664" alt="Supabase_Order_Management-2026-07-24-053013" src="https://github.com/user-attachments/assets/b3ab70c8-d076-4bf8-ab75-501be333a464" />

### 🔀 Sequence Diagram
<img width="594" height="1327" alt="sequence-ecom204" src="https://github.com/user-attachments/assets/b1df131c-f4c5-4db9-963d-a1276fe45318" />

### SA
<img width="5582" height="5205" alt="E-commerce_API_Architecture-2026-07-24-054924" src="https://github.com/user-attachments/assets/78f2100a-2400-442f-83c4-56669cb4cc2c" />
 
### 🎨 Wireframe / Prototype
 
<img width="1068" height="1640" alt="wi" src="https://github.com/user-attachments/assets/881aeed5-ded5-4a18-aa89-a9ba99d36731" />

https://www.figma.com/design/4DE9xSQ5q0L19YMTQ7WO5m/Untitled?node-id=0-1&m=dev&t=A3I9SIY3tRLKjp8d-1

### 🗂️ Data Schema (JSON)

โครงสร้างข้อมูลหลักของระบบ กำหนดเป็น JSON Schema (draft 2020-12) เพื่อใช้ตรวจสอบความถูกต้องของข้อมูลที่เก็บใน `localStorage` ฝั่ง Frontend

---

### products (สินค้า)

```json
{
  "id": "prod_1_sku-serum-001",
  "sku": "SKU-SERUM-001",
  "data": {
    "name": "Velvet Silk Serum",
    "enName": "Velvet Silk Serum",
    "descriptionShort": "เซรั่มบำรุงผิวเข้มข้น เนื้อบางเบา ซึมไว",
    "category": "สกินแคร์",
    "store": "Maison Véra",
    "brand": "Maison Véra",
    "barcode": "8850000000010",
    "price": 2480,
    "promoPrice": null,
    "cost": 980,
    "status": "Active",
    "tags": [
      "New",
      "Skincare"
    ],
    "mainImage": "https://.../serum.jpg",
    "gallery": [],
    "stockTotal": 120,
    "reservedStock": 10,
    "lowStockThreshold": 20,
    "warehouses": [
      {
        "name": "Bangkok",
        "qty": 120
      }
    ],
    "variantOptions": [
      {
        "name": "ขนาด",
        "values": [
          "30ml",
          "50ml"
        ]
      }
    ],
    "variants": [
      {
        "sku": "SKU-SERUM-001-30",
        "price": 2480,
        "stock": 60,
        "options": {
          "ขนาด": "30ml"
        }
      }
    ],
    "attributes": [
      {
        "key": "ผิวที่เหมาะ",
        "value": "ทุกสภาพผิว"
      }
    ],
    "shipping": {
      "weightKg": 0.08,
      "carrier": "Kerry",
      "shippingFee": 0,
      "freeShipping": true
    },
    "seo": {
      "metaTitle": "...",
      "urlSlug": "velvet-silk-serum",
      "keywords": "serum,skin,th"
    },
    "soldCount": 340,
    "views": 9200,
    "ratingAvg": 4.8,
    "ratingCount": 88,
    "createdAt": "2026-07-01T09:00:00Z",
    "updatedAt": "2026-07-01T09:00:00Z"
  },
  "updated_at": "2026-07-01T09:00:00Z"
}
```

---

### cart_items (ตะกร้าสินค้า)

```json
{
  "id": "uuid",
  "user_id": "uuid → auth.users",
  "product_id": "prod_1_sku-serum-001",
  "product_name": "Velvet Silk Serum",
  "category": "สกินแคร์",
  "variant": "30ml",
  "price": 2480,
  "quantity": 2,
  "image_url": "https://.../serum.jpg",
  "created_at": "2026-07-24T10:00:00Z"
}
```

---

### orders (คำสั่งซื้อ)

```json
{
  "id": "order-id (generate จาก frontend)",
  "user_id": "uuid → auth.users",
  "items": [
    {
      "id": "prod_1_sku-serum-001",
      "name": "Velvet Silk Serum",
      "variant": "30ml",
      "price": 2480,
      "qty": 1
    }
  ],
  "subtotal": 2480,
  "discount": 0,
  "shipping_fee": 39,
  "total": 2519,
  "applied_coupon": null,
  "status": "รอดำเนินการ",
  "payment_method": "promptpay",
  "card_info": null,
  "shipping_address": {
    "fullName": "...",
    "phone": "...",
    "address": "..."
  },
  "address_id": "addr-xxxxx",
  "customer_name": "...",
  "customer_email": "...",
  "carrier": "Flash Express",
  "tracking_number": "TH0123456789",
  "tracking_url": null,
  "estimated_delivery": null,
  "status_history": [
    {
      "status": "pending",
      "at": "2026-07-24T10:00:00Z"
    }
  ],
  "created_at": "2026-07-24T10:00:00Z",
  "updated_at": "2026-07-24T10:00:00Z"
}
```

---

### addresses (ที่อยู่จัดส่ง)

```json
{
  "id": "addr-xxxxx",
  "user_id": "uuid → auth.users",
  "full_name": "...",
  "phone": "...",
  "email": "...",
  "address": "...",
  "district": "...",
  "province": "...",
  "postcode": "10110",
  "preferred_carrier": "superbet",
  "is_default": true,
  "note": "",
  "created_at": "2026-07-01T09:00:00Z",
  "updated_at": "2026-07-24T10:00:00Z"
}
```

---

### profiles (สมาชิก)

```json
{
  "id": "uuid = auth.users.id",
  "role": "customer | admin"
}
```

---

### saved_cards (บัตรที่บันทึกไว้)

```json
{
  "id": "visa-1234-12/28",
  "user_id": "uuid → auth.users",
  "brand": "visa",
  "last4": "1234",
  "expiry": "12/28",
  "name": "...",
  "created_at": "2026-07-01T09:00:00Z"
}
```


# 🧪 User Acceptance Testing (UAT)

ระบบได้รับการทดสอบด้วย **User Acceptance Testing (UAT)** เพื่อประเมินการทำงานของฟังก์ชันหลักทั้งฝั่งลูกค้าและผู้ดูแลระบบ โดยแบ่งผลการทดสอบออกเป็น **ผ่าน (Pass)** และ **ไม่ผ่าน (Fail)** ดังนี้

| รหัส | โมดูล | กรณีทดสอบ | สถานะ |
|------|--------|------------|:------:|
| AUTH-01 | Login | เข้าสู่ระบบด้วย Google | ✅ Pass |
| HOME-01 | Home | Navigation | ✅ Pass |
| HOME-02 | Home | Banner & Story | ✅ Pass |
| SCH-01 | Search | ค้นหาสินค้า | ✅ Pass |
| PDP-01 | Product | แสดงรายละเอียดสินค้า | ✅ Pass |
| PDP-02 | Product | ปุ่มเพิ่มสินค้า | ✅ Pass |
| CART-01 | Cart | เพิ่ม/ลดจำนวนสินค้า | ✅ Pass |
| CART-02 | Cart | ใช้งานโค้ดส่วนลด | ❌ Fail |
| CHK-01 | Checkout | ฟอร์มการจัดส่ง | ✅ Pass |
| CHK-02 | Checkout | ตรวจสอบบัตรเครดิต | ✅ Pass |
| TRK-01 | Order Tracking | แสดงข้อมูลคำสั่งซื้อ | ✅ Pass |
| TRK-02 | Order Tracking | ติดตามสถานะการจัดส่ง | ✅ Pass |
| ADM-01 | Admin Dashboard | Dashboard Overview | ✅ Pass |
| ADM-04 | Admin Products | จัดการสถานะสินค้า | ✅ Pass |
| ADM-05 | Admin Products | Export CSV | ✅ Pass |
| ADM-06 | Admin Products | Bulk Action | ✅ Pass |

## 📊 ผลการทดสอบ

| ผลการทดสอบ | จำนวน |
|------------|-------:|
| ✅ ผ่าน (Pass) | **15** |
| ❌ ไม่ผ่าน (Fail) | **1** |
| 📋 รวมทั้งหมด | **16 Test Cases** |



## 🧩 การออกแบบ UML

แผนภาพ UML ทั้งหมดออกแบบด้วย **draw.io** เพื่อวางโครงสร้างระบบก่อนเริ่มพัฒนา

<details>
<summary>📐 ดูรายการแผนภาพทั้งหมด (คลิกเพื่อขยาย)</summary>

| แผนภาพ | คำอธิบาย |
|---|---|
| Use Case Diagram | แสดงการทำงานของผู้ใช้แต่ละบทบาทกับระบบ |
| Class Diagram | โครงสร้างคลาสและความสัมพันธ์ของข้อมูลในระบบ |
| Sequence Diagram | ลำดับการส่งข้อความระหว่างผู้ใช้ ระบบ และฐานข้อมูล |


</details>

---

## 🛡️ SLA และแผนการดูแลระบบหลังส่งมอบ

เพื่อกำหนดแนวทางการดูแลระบบหลังการส่งมอบให้ชัดเจน ทีมได้กำหนดขอบเขตบริการ ระดับความรุนแรงของปัญหา เวลาตอบสนอง และแผนการบำรุงรักษา ไว้ดังนี้

### ข้อมูลโครงงาน

| หัวข้อ | รายละเอียด |
|---|---|
| ชื่อโครงงาน | Maison Véra — แพลตฟอร์มอีคอมเมิร์ซเครื่องสำอาง |
| ประเภทของระบบ | e-Commerce Platform (หน้าร้านลูกค้า + แดชบอร์ดแอดมิน) |
| กลุ่มผู้ใช้งาน | ลูกค้าออนไลน์ และผู้ดูแลระบบ/แอดมินร้าน |
| สมาชิกในทีม | Belle Aura Team — Project Manager, Frontend Developer, UI/UX Designer |

### ขอบเขตการให้บริการ (Service Scope)

**รวมในบริการ**
- แก้ไขข้อบกพร่อง (Bug Fix) ของฟีเจอร์ที่ส่งมอบแล้ว เช่น ตะกร้าสินค้า, Checkout, ระบบสมาชิก
- ดูแลความปลอดภัยพื้นฐานและอัปเดตแพตช์ที่จำเป็น
- สนับสนุนการใช้งานแดชบอร์ดแอดมิน (จัดการสินค้า/สต็อก/คำสั่งซื้อ)
- ตรวจสอบและรายงานสถานะระบบตามรอบที่กำหนด

**ไม่รวมในบริการ**
- การพัฒนาฟีเจอร์ใหม่นอกขอบเขตโครงงานเดิม
- ปัญหาจากผู้ให้บริการภายนอก เช่น เกตเวย์ชำระเงิน หรือผู้ให้บริการขนส่ง

### ระดับความรุนแรงของปัญหา

| ระดับ | ลักษณะปัญหา |
|---|---|
| Critical | ระบบล่ม ใช้งานไม่ได้ทั้งหมด เช่น ชำระเงินไม่ได้ |
| High | ฟีเจอร์หลักใช้งานไม่ได้บางส่วน เช่น ตะกร้าคำนวณผิด |
| Medium | ใช้งานได้แต่ติดขัด เช่น หน้าโหลดช้า, ค้นหาไม่แม่นยำ |
| Low | ปัญหาเล็กน้อย เช่น ข้อความ/ดีไซน์คลาดเคลื่อน |

### ข้อกำหนดระดับการให้บริการ (SLA)

| ระดับ | เวลาตอบสนองแรก | เวลาแก้ไขปัญหาเป้าหมาย | ช่องทางแจ้งปัญหา |
|---|---|---|---|
| Critical | ภายใน 1 ชั่วโมง | ภายใน 4 ชั่วโมง | โทร/แชทด่วน |
| High | ภายใน 4 ชั่วโมง | ภายใน 1 วันทำการ | อีเมล/แชท |
| Medium | ภายใน 1 วันทำการ | ภายใน 3 วันทำการ | อีเมล/ระบบแจ้งปัญหา |
| Low | ภายใน 2 วันทำการ | รวมในรอบอัปเดตถัดไป | ระบบแจ้งปัญหา |

### แผนการบำรุงรักษา

| รอบ | รายละเอียด |
|---|---|
| รายวัน | ตรวจสอบสถานะระบบและ Error Log |
| รายสัปดาห์ | สำรองข้อมูล (Backup) และตรวจสอบความถูกต้องของสต็อก/ออเดอร์ |
| รายเดือน | อัปเดตความปลอดภัย ปรับปรุงประสิทธิภาพ และรีวิวผลตอบรับผู้ใช้ |
| รายไตรมาส | ประเมินระบบภาพรวมและวางแผนปรับปรุงร่วมกับทีม |

---

## 🔮 แผนพัฒนาต่อในอนาคต

- [ ] ❤️ Wishlist สินค้าที่ถูกใจ
- [ ] 🌙 โหมดมืด (Dark Mode)
- [ ] โค้ดส่วนลด
- [ ] ยกเลิกคำสั่งซื้อ

<div align="center">

Made with 🩷 by **Maison Véra Team**

ขอบคุณที่แวะมาเยี่ยมชม repository นี้ 🌸

</div>
