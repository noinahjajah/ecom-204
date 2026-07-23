
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
 <img width="1223" height="1005" alt="ีuse caes uup" src="https://github.com/user-attachments/assets/d7eb665c-e9cf-42ed-a28a-9660ad71aa41" />

```
 

 






```
### 🔀 Sequence Diagram
<img width="594" height="1327" alt="sequence-ecom204" src="https://github.com/user-attachments/assets/b1df131c-f4c5-4db9-963d-a1276fe45318" />

 
### 🎨 Wireframe / Prototype
 
ใส่อันนี้
 
- ครอบคลุมหน้า Dashboard Overview, จัดการสินค้า (พร้อม Bulk Action / Export CSV), จัดการสต็อก, จัดการคำสั่งซื้อ และจัดการการชำระเงิน
- ออกแบบ Layout เบื้องต้นด้วย **Figma** ก่อนแปลงเป็นโค้ดจริง
### 🗂️ Data Schema (JSON)
 
โครงสร้างข้อมูลหลักของระบบ กำหนดเป็น JSON Schema (draft 2020-12) เพื่อใช้ตรวจสอบความถูกต้องของข้อมูลที่เก็บใน `localStorage` ฝั่ง Frontend
 
<details>
<summary><code>product.schema.json</code> — โครงสร้างสินค้า (เก็บใน <code>admin_products_v1</code>)</summary>
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://maisonvera.example/schemas/product.schema.json",
  "title": "Product",
  "description": "A single product record as stored in localStorage under admin_products_v1 (productsDataStore.js).",
  "type": "object",
  "required": [
    "id", "name", "category", "sku", "price", "cost", "status",
    "stockTotal", "reservedStock", "lowStockThreshold",
    "createdAt", "updatedAt", "shipping", "activityLogs"
  ],
  "properties": {
    "id": { "type": "string", "description": "e.g. \"prod_1_sku-serum-001\"" },
    "name": { "type": "string" },
    "enName": { "type": "string" },
    "descriptionShort": { "type": "string" },
    "details": { "type": "string" },
    "highlights": { "type": "string", "description": "Newline-separated bullet points" },
    "countryOfOrigin": { "type": "string" },
    "manufacturer": { "type": "string" },
    "category": { "type": "string", "examples": ["สกินแคร์", "เมคอัพ"] },
    "store": { "type": "string" },
    "brand": { "type": "string" },
    "sku": { "type": "string" },
    "barcode": { "type": "string" },
 
    "price": { "type": "number", "minimum": 0 },
    "promoPrice": { "type": ["number", "null"], "minimum": 0 },
    "cost": { "type": "number", "minimum": 0 },
 
    "status": {
      "type": "string",
      "enum": ["Active", "OutOfStock", "Hidden", "Pending", "Rejected"]
    },
    "statusDetail": {
      "type": "object",
      "description": "Denormalized booleans mirroring `status`, used for dashboard filters",
      "properties": {
        "pending": { "type": "boolean" },
        "rejected": { "type": "boolean" },
        "hidden": { "type": "boolean" },
        "active": { "type": "boolean" },
        "draft": { "type": "boolean" },
        "outOfStock": { "type": "boolean" }
      }
    },
 
    "mainImage": { "type": "string", "description": "URL or base64 data: URI" },
    "gallery": { "type": "array", "items": { "type": "string" } },
    "image360": { "type": "string" },
    "video": { "type": "array", "items": { "type": "string" } },
 
    "stockTotal": { "type": "integer", "minimum": 0 },
    "reservedStock": { "type": "integer", "minimum": 0 },
    "lowStockThreshold": { "type": "integer", "minimum": 0 },
    "warehouses": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "stock": { "type": "integer", "minimum": 0 }
        }
      }
    },
 
    "variantOptions": {
      "type": "array",
      "description": "Flat list of selectable option labels, e.g. shades or sizes",
      "items": { "type": "string" }
    },
    "variants": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["sku", "price", "stock"],
        "properties": {
          "sku": { "type": "string" },
          "price": { "type": "number", "minimum": 0 },
          "stock": { "type": "integer", "minimum": 0 },
          "barcode": { "type": "string" },
          "image": { "type": "string" },
          "options": {
            "type": "object",
            "description": "e.g. { \"shade\": \"Rose\", \"size\": \"30ml\" }",
            "additionalProperties": { "type": "string" }
          }
        }
      }
    },
    "attributes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "key": { "type": "string" },
          "value": { "type": "string" }
        }
      }
    },
    "tags": { "type": "array", "items": { "type": "string" } },
 
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
 
    "soldCount": { "type": "integer", "minimum": 0 },
    "views": { "type": "integer", "minimum": 0 },
    "clicks": { "type": "integer", "minimum": 0 },
    "wishlist": { "type": "integer", "minimum": 0 },
    "ratingAvg": { "type": "number", "minimum": 0, "maximum": 5 },
    "ratingCount": { "type": "integer", "minimum": 0 },
    "ratingReportedCount": { "type": "integer", "minimum": 0 },
 
    "activityLogs": {
      "type": "array",
      "description": "Audit trail; system:checkout entries are the only real source of sales data (see salesMetrics.js)",
      "items": {
        "type": "object",
        "required": ["who", "at", "note"],
        "properties": {
          "who": {
            "type": "string",
            "examples": ["Admin", "system:checkout"]
          },
          "at": { "type": "string", "format": "date-time" },
          "before": {
            "type": ["object", "null"],
            "description": "Snapshot of changed fields before the edit; shape varies by action",
            "properties": {
              "status": { "type": "string" },
              "price": { "type": "number" },
              "promoPrice": { "type": ["number", "null"] },
              "stockTotal": { "type": "integer" },
              "category": { "type": "string" }
            }
          },
          "after": {
            "type": ["object", "null"],
            "properties": {
              "status": { "type": "string" },
              "price": { "type": "number" },
              "promoPrice": { "type": ["number", "null"] },
              "stockTotal": { "type": "integer" },
              "category": { "type": "string" }
            }
          },
          "note": {
            "type": "string",
            "examples": ["Created product", "Bulk update", "Upsert product", "Stock deducted from order"]
          }
        }
      }
    },
 
    "seo": {
      "type": "object",
      "properties": {
        "metaTitle": { "type": "string" },
        "metaDescription": { "type": "string" },
        "urlSlug": { "type": "string" },
        "keywords": { "type": "string" }
      }
    },
 
    "shipping": {
      "type": "object",
      "required": ["shippingFee", "freeShipping"],
      "properties": {
        "weightKg": { "type": "number" },
        "widthCm": { "type": "number" },
        "heightCm": { "type": "number" },
        "lengthCm": { "type": "number" },
        "carrier": { "type": "string", "examples": ["kerry"] },
        "shippingFee": { "type": "number", "minimum": 0 },
        "freeShipping": { "type": "boolean" }
      }
    },
 
    "completeness": {
      "type": "object",
      "properties": {
        "hasImage": { "type": "boolean" },
        "isComplete": { "type": "boolean" }
      }
    }
  }
}
```
 
</details>
<details>
<summary><code>cart.schema.json</code> — โครงสร้างตะกร้าสินค้าและคูปอง (เก็บใน <code>localStorage</code>)</summary>
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://maisonvera.example/schemas/cart.schema.json",
  "title": "Cart",
  "description": "Shapes stored in localStorage by cart.js: the cart array itself, applied coupon code, and the coupons lookup table.",
  "$defs": {
    "cartItem": {
      "type": "object",
      "required": ["id", "name", "category", "price", "qty"],
      "properties": {
        "id": {
          "type": "string",
          "description": "Matches a Product.id from product.schema.json"
        },
        "name": { "type": "string" },
        "category": { "type": "string" },
        "variant": {
          "type": "string",
          "description": "Selected variant label, or \"\" if the product has no variants"
        },
        "price": { "type": "number", "minimum": 0 },
        "image": { "type": ["string", "null"] },
        "qty": {
          "type": "integer",
          "minimum": 1,
          "description": "Capped at getAvailableQty(item) — the product's (or matching variant's) remaining stock"
        }
      }
    },
    "coupon": {
      "type": "object",
      "required": ["type", "value"],
      "properties": {
        "type": {
          "type": "string",
          "enum": ["percent", "fixed", "free_shipping"]
        },
        "value": {
          "type": "number",
          "description": "Percent (0-100) for type=percent, currency amount for type=fixed, ignored for free_shipping"
        },
        "minSpend": {
          "type": "number",
          "minimum": 0,
          "description": "Minimum subtotal required to apply this coupon"
        }
      }
    }
  },
  "type": "object",
  "properties": {
    "cart": {
      "type": "array",
      "description": "localStorage key holding the cart array",
      "items": { "$ref": "#/$defs/cartItem" }
    },
    "appliedCoupon": {
      "type": ["string", "null"],
      "description": "Coupon code currently applied, or null"
    },
    "coupons": {
      "type": "object",
      "description": "Lookup table keyed by uppercase coupon code",
      "additionalProperties": { "$ref": "#/$defs/coupon" }
    },
    "totals": {
      "type": "object",
      "description": "Shape returned by computeTotals(cart, appliedCoupon)",
      "properties": {
        "subtotal": { "type": "number", "minimum": 0 },
        "discount": { "type": "number", "minimum": 0 },
        "shippingFee": { "type": "number", "minimum": 0 },
        "total": { "type": "number", "minimum": 0 }
      }
    }
  }
}
```
 
</details>

---

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
