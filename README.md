# ecom-204 — Maison Véra / Belle Aura E-Commerce

ระบบร้านค้าออนไลน์ (เครื่องสำอาง/สกินแคร์) แบบ full-stack ประกอบด้วยฝั่งลูกค้า (React + Vite), ระบบแอดมิน (จัดการสินค้า/คำสั่งซื้อ), และ backend (Express + Supabase) สำหรับ Auth

> 📌 ชื่อแบรนด์ที่ปรากฏในโค้ด: หน้า login/checkout ใช้ "Belle Aura" (ดู `swagger.js`) ส่วน order ID และคูปองใช้ prefix "MV" (Maison Véra) — ดูเหมือนเป็นชื่อที่กำลังเปลี่ยนผ่าน ควรเช็คกับทีมว่าจะยึดชื่อไหนเป็นทางการ

---

## 🧱 สถาปัตยกรรมโดยรวม

```
ecom-204/
├── backend/                  # Express API (รันแยกจาก frontend คนละพอร์ต)
│   ├── server.js             # entry point: PORT 3000 (default)
│   ├── Supabaseclient.js     # สร้าง Supabase client ฝั่ง server (ใช้ ANON KEY)
│   ├── swagger.js            # ตั้งค่า swagger-jsdoc (อ่าน JSDoc จาก routes/*.js)
│   ├── routes/
│   │   └── login_router.js   # POST /api/login, /api/login/google
│   ├── migrations/           # SQL ที่ต้องรันเองใน Supabase SQL Editor (ไม่มี auto-migrate)
│   │   ├── 001_user_addresses.sql
│   │   ├── 002_profiles.sql
│   │   └── 003_products_orders.sql
│   └── .env                  # SUPABASE_URL, SUPABASE_ANON_KEY, PORT
│
├── frontend/                 # React 18 + Vite (multi-page แบบ vanilla routing)
│   ├── index.html, orders.html
│   ├── dist/                 # ผลลัพธ์จาก `vite build` (build ไว้แล้วในนี้)
│   ├── .env                  # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│   └── src/
│       ├── main.jsx          # 🚦 router หลัก — map path → component (ดูหัวข้อ Routing)
│       ├── supabaseClient.js # Supabase client ฝั่ง browser
│       ├── cart.js           # ตรรกะตะกร้า + คูปอง + ส่วนลด (localStorage + sync remote)
│       ├── payment.js        # ตรวจสอบบัตร (Luhn, brand, expiry) — ไม่เชื่อมเกตเวย์จริง
│       ├── addresses.js      # จัดการที่อยู่จัดส่ง (cloud sync ผ่าน Supabase)
│       ├── productData.js    # ข้อมูล/รายการสินค้าเริ่มต้นฝั่ง client
│       ├── services/
│       │   ├── ordersSync.js    # sync คำสั่งซื้อ local ⇄ Supabase (ตาราง orders)
│       │   └── productsSync.js  # sync สินค้า local ⇄ Supabase (ตาราง products)
│       ├── admin-products/      # 🛠️ โซนแอดมิน
│       │   ├── AdminLogin.jsx       # หน้า login แยกสำหรับแอดมิน
│       │   ├── AdminLayout.jsx      # เลย์เอาต์ครอบทุกหน้าแอดมิน (sidebar/guard)
│       │   ├── AdminHeader.jsx
│       │   ├── ProductsDashboard.jsx
│       │   ├── ProductsTable.jsx    # ตารางสินค้า + สถานะ/หมวดหมู่
│       │   ├── AddEditProduct.jsx   # ฟอร์มเพิ่ม/แก้ไขสินค้า (ใช้หน้าเดียวกันทั้งสองโหมด)
│       │   ├── AdminOrders.jsx      # จัดการคำสั่งซื้อ (ดู/อัปเดตสถานะ)
│       │   ├── productsDataStore.js # แหล่งข้อมูลสินค้ากลาง + ฟังก์ชันสต็อก (increment/decrement)
│       │   └── productsUtils.js
│       └── (หน้าลูกค้า) Home, Login, CartPage, CheckoutPage, About, Makeup, Skincare,
│           SetsPage, ProductDetailPage, OrdersPage, MyAddressesPage, Account, HelpPage,
│           AuthCallback (รับ redirect หลัง OAuth)
│
├── vite.config.js            # root: 'frontend', dev server host 0.0.0.0:3001
├── package.json              # scripts รวมทั้ง backend และ frontend (ดูด้านล่าง)
└── package-lock.json
```

**หลักการสำคัญที่ต้องรู้ก่อนแก้โค้ด:**
- นี่ไม่ใช่ SPA แบบ React Router — `main.jsx` อ่าน `window.location.pathname` ตรง ๆ แล้ว render component ที่ตรงกันแบบ if/else chain (ดูหัวข้อ Routing) ⚠️ การเพิ่มหน้าใหม่ต้องแก้ทั้ง route string และ JSX render block ในไฟล์เดียวกัน
- ตะกร้าและที่อยู่ใช้ **localStorage เป็นหลัก + sync ขึ้น Supabase เป็นทางเลือกเสริม** ไม่ใช่ backend เป็นแหล่งความจริงเดียว (single source of truth คือ localStorage ต่อ user, cloud คือ backup/sync)
- backend (Express) ทำหน้าที่แค่ **login/OAuth relay** เท่านั้น — CRUD สินค้า/คำสั่งซื้อ/ที่อยู่ทั้งหมดยิงตรงจาก frontend ไปที่ Supabase ผ่าน `supabaseClient.js` (ไม่ผ่าน backend เลย)

---

## 🔧 Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | React 18.3, Vite 5.4, `@vitejs/plugin-react` |
| Backend | Express 5.2, CORS, dotenv |
| Auth / DB | Supabase (`@supabase/supabase-js` — Auth + Postgres + RLS) |
| API Docs | swagger-jsdoc (ประกาศใน `swagger.js` แต่ **ยังไม่เห็นจุด mount `/api-docs` ใน `server.js`** — ต้องเพิ่ม `swagger-ui-express` เองถ้าต้องการหน้า docs จริง) |
| Dev tools | nodemon (backend hot-reload) |

---

## 🗄️ ฐานข้อมูล (Supabase / PostgreSQL)

migration ต้อง**รันมือ**ใน Supabase Dashboard → SQL Editor ตามลำดับ (ไม่มี migration runner อัตโนมัติ):

1. **`001_user_addresses.sql`**
   ตาราง `user_addresses` — ที่อยู่จัดส่งของผู้ใช้ (ผูกกับ `auth.users`), มี RLS ให้ผู้ใช้เห็น/แก้ไขเฉพาะของตัวเอง
   > ถ้ายังไม่รัน ระบบที่อยู่จะ fallback ไปใช้ localStorage อัตโนมัติ

2. **`002_profiles.sql`**
   ตาราง `profiles` (role: `user` | `admin`) + trigger `on_auth_user_created` ที่สร้าง profile อัตโนมัติเมื่อมี user สมัครใหม่
   > หลังรันแล้วต้อง **ตั้ง role เป็น admin เองด้วยมือ** ผ่าน SQL:
   > `UPDATE public.profiles SET role='admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com');`

3. **`003_products_orders.sql`**
   ตาราง `products` (schema แบบ `id` + `data JSONB` + `status`/`category` แยกไว้ทำ index) และ `orders` (`id`, `user_id`, `status`, `total`, `data JSONB`)
   สร้างฟังก์ชัน `is_admin()` ใช้ร่วมกันใน RLS policy ของทั้งสองตาราง — สินค้า**ดูได้ทุกคน**แต่**เขียนได้เฉพาะแอดมิน**, คำสั่งซื้อดูได้เฉพาะเจ้าของออเดอร์หรือแอดมิน

⚠️ **Side effect ที่ต้องระวัง:** ทั้งสามไฟล์ใช้ `DROP POLICY IF EXISTS ... CREATE POLICY` ดังนั้นรันซ้ำได้ปลอดภัย (idempotent) แต่ต้องรันตามลำดับ 001→002→003 เพราะ 003 เรียกใช้ function ที่อ้างถึง `profiles` จาก 002

---

## 🚦 Routing (ฝั่งลูกค้า vs แอดมิน)

`frontend/src/main.jsx` คือจุดเดียวที่ควบคุมเส้นทางทั้งหมดของแอป — แมป `pathname` เป็น route string แล้ว render component ตรง ๆ

**ฝั่งลูกค้า:**
| Path | หน้า |
|---|---|
| `/` | `Home` |
| `/login` | `Login` |
| `/cart` | `CartPage` |
| `/checkout` | `CheckoutPage` |
| `/about`, `/makeup`, `/skincare`, `/sets`, `/help` | หน้าคอนเทนต์/หมวดสินค้า |
| `/product`, `/product.html` | `ProductDetailPage` |
| `/orders`, `/orders.html` | `OrdersPage` |
| `/myaddresses` | `MyAddressesPage` |
| `/account` | `Account` |
| `/auth/callback` | `AuthCallback` (รับ redirect กลับจาก Google OAuth) |

**ฝั่งแอดมิน** (ทุกหน้าถูกครอบด้วย `AdminLayout`):
| Path | หน้า |
|---|---|
| `/admin/login` | `AdminLogin` |
| `/admin`, `/admin/dashboard` | `ProductsDashboard` |
| `/admin/products`, `/admin/products.html` | `ProductsTable` |
| `/admin/products/new(.html)` | `AddEditProduct` (โหมดเพิ่ม) |
| `/admin/products/edit(.html)` | `AddEditProduct` (โหมดแก้ไข — ใช้ component เดียวกัน) |
| `/admin/orders`, `/admin/orders.html` | `AdminOrders` |

> 🔗 ก่อน render ใด ๆ ไฟล์นี้เรียก `initProductsSync()` จาก `admin-products/productsDataStore.js` ก่อนเสมอ เพื่อดึงข้อมูลสินค้าล่าสุดมาไว้ในหน่วยความจำ/localStorage

---

## 🛒 ตะกร้า, คูปอง, และการคำนวณราคา (`frontend/src/cart.js`)

- เก็บสถานะใน `localStorage` แยกตาม user (`mv_cart_<uid>`) และ guest (`mv_cart_guest`) — มี key เก่า `mv_cart` ไว้รองรับ backward compatibility
- กระจาย custom event `"cartchange"` ทุกครั้งที่ตะกร้าเปลี่ยน ให้ `Header`, `CartPage`, หน้าอื่น ๆ ที่ subscribe รู้ตัวแบบ real-time โดยไม่ต้องมี global state manager
- คูปองที่มีในระบบตอนนี้ (hardcoded ใน `coupons` object):
  - `SAVE10` — ลด 10%, สูงสุด 300 บาท
  - `FREESHIP` — ส่งฟรี
- ค่าส่งคงที่ `SHIPPING_FEE = 60` บาท, ส่งฟรีอัตโนมัติเมื่อยอดถึง `FREE_SHIPPING_THRESHOLD = 1500` บาท
- ผูกกับสต็อกสินค้าโดยตรงผ่าน `productsDataStore.js` (`decrementStockForOrder`, `incrementStockForOrder`, `validateOrderStock`) — ⚠️ ถ้าแก้ตรรกะสต็อกใน dashboard ต้องเทสต์ผลกระทบที่ cart/checkout ด้วย เพราะใช้ฟังก์ชันร่วมกัน
- sync คำสั่งซื้อขึ้น Supabase ผ่าน `services/ordersSync.js` (`saveOrderRemote`, `fetchOrdersForUser`, `fetchAllOrders`, `updateOrdersRemote`)

---

## 💳 การชำระเงิน (`frontend/src/payment.js`)

⚠️ **จำลองการชำระเงินเท่านั้น ยังไม่เชื่อมเกตเวย์จริง (Omise/Stripe/2C2P ฯลฯ)**

ฟังก์ชันที่มีให้:
- `formatCardNumber`, `formatExpiry`, `onlyDigits` — จัด format ขณะพิมพ์
- `luhnCheck` — ตรวจเลขบัตรด้วย Luhn algorithm (มาตรฐานเดียวกับเกตเวย์จริง)
- `detectCardBrand` — เดา brand จาก BIN (Visa / Mastercard / Amex / JCB)
- `isExpiryValid`, `isCvvValid` — ตรวจวันหมดอายุและ CVV (Amex ใช้ 4 หลัก ที่เหลือ 3 หลัก)
- `generateOrderId()` — สร้างเลขออเดอร์รูปแบบ `MV-YYYYMMDD-XXXX`

🔒 **ความปลอดภัย:** ไม่มีการเก็บเลขบัตรเต็มหรือ CVV ไว้ที่ไหนเลยตามที่ comment ในโค้ดระบุ — เก็บแค่ brand + เลข 4 ตัวท้าย + วันหมดอายุ สำหรับแสดงผล

---

## 🔐 Authentication

- **ฝั่งลูกค้า/แอดมิน:** ใช้ Supabase Auth ทั้งคู่ (email+password ผ่าน backend `/api/login`, และ Google OAuth ผ่าน `/api/login/google` ที่คืน URL ให้ frontend redirect เอง)
- **แยกสิทธิ์แอดมิน:** ผ่านตาราง `profiles.role` — ไม่มี role พิเศษใน Supabase Auth เอง ต้อง join กับ `profiles` เสมอ (ฟังก์ชัน `is_admin()` ใน SQL ทำหน้าที่นี้)
- `AuthCallback.jsx` รับ redirect กลับจาก OAuth ที่ path `/auth/callback`

---

## ⚙️ การติดตั้งและรัน

### 1) ติดตั้ง dependencies
```bash
npm install
```

### 2) ตั้งค่า environment variables
สร้าง/ตรวจสอบไฟล์ `.env` สองจุด (มีอยู่แล้วในโปรเจกต์ แต่ต้องใส่ค่าจริงของ Supabase project ตัวเอง):

**`backend/.env`**
```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
PORT=3000
```

**`frontend/.env`**
```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

⚠️ ทั้งสองไฟล์นี้ถูกรวมมาใน zip แล้ว (มีค่าอยู่จริง) — **ต้องเช็คว่าไม่ได้ commit ขึ้น public repo** เพราะเป็น anon key ของโปรเจกต์จริง แม้จะเป็น anon key (ไม่ใช่ service role) ก็ยังควรเก็บเป็นความลับตามหลักปฏิบัติทั่วไป

### 3) รัน migration SQL
เข้า Supabase Dashboard → SQL Editor → รันไฟล์ใน `backend/migrations/` ตามลำดับ 001 → 002 → 003

### 4) รัน backend (API + Auth relay)
```bash
npm run server
# หรือ npm start (ทั้งคู่รัน node backend/server.js)
```
→ เปิดที่ `http://localhost:3000`

### 5) รัน frontend (dev mode)
```bash
npm run dev
# หรือ npm run dev:web
```
→ เปิดที่ `http://localhost:3001` (ตั้งไว้ใน `vite.config.js`, `host: '0.0.0.0'` เพื่อเข้าถึงจากเครื่องอื่นในวงแลนได้)

### 6) Build production
```bash
npm run build     # build ไปที่ frontend/dist (มีไฟล์ build เก่าอยู่แล้วในนี้)
npm run preview   # ดูผล build ก่อน deploy จริง
```

---

## 📜 Scripts ทั้งหมด (`package.json`)

| Script | คำสั่ง | ใช้ทำอะไร |
|---|---|---|
| `npm start` | `node backend/server.js` | รัน backend production |
| `npm run server` | `node backend/server.js` | เหมือนกัน (alias) |
| `npm run dev` / `dev:web` | `vite` | รัน frontend dev server |
| `npm run build` | `vite build` | build frontend ไปที่ `frontend/dist` |
| `npm run preview` | `vite preview` | preview production build |

⚠️ ไม่มี script รัน backend แบบ nodemon (auto-reload) ใน `package.json` ทั้งที่มี `nodemon` อยู่ใน devDependencies — ถ้าต้องการ hot-reload backend ให้รันเองด้วย `npx nodemon backend/server.js`

---

## 📌 จุดที่ควรตรวจสอบ/ปรับปรุงต่อ (สังเกตจากโค้ด)

- `server.js` เปิด `cors()` แบบไม่จำกัด origin พร้อม comment `// TODO: จำกัด origin ให้เป็นโดเมนของหน้าบ้านจริงตอน deploy` — ต้องแก้ก่อนขึ้น production
- `swagger.js` ตั้งค่าไว้แล้วแต่ `server.js` ยังไม่ mount route แสดงผล (เช่น `/api-docs` ผ่าน `swagger-ui-express`) — ปัจจุบัน spec ถูกสร้างไว้เฉยๆ ยังใช้งานไม่ได้จริง
- ชื่อแบรนด์ไม่ตรงกันระหว่างจุดต่าง ๆ ในโค้ด (Belle Aura ใน swagger, Maison Véra ใน order ID/คูปอง) ควรเลือกให้ชัดจุดเดียว
- ระบบชำระเงินยังเป็น mock (Luhn check เท่านั้น) — ถ้าจะส่งเป็นงานจริงต้องต่อเกตเวย์จริงและย้าย logic ตรวจสอบไปฝั่ง server เสมอ (ห้าม trust client-side validation อย่างเดียว)

---

## 🗂️ Related files reference (สำหรับเปิดใน VS Code)

| ต้องการแก้... | เปิดไฟล์ |
|---|---|
| เพิ่ม/แก้เส้นทางหน้าเว็บ | `frontend/src/main.jsx` |
| ตรรกะตะกร้า/คูปอง/ส่วนลด | `frontend/src/cart.js` |
| ฟอร์มชำระเงิน/ตรวจบัตร | `frontend/src/payment.js`, `frontend/src/CheckoutPage.jsx` |
| จัดการสินค้า (แอดมิน) | `frontend/src/admin-products/*` |
| sync ข้อมูลกับ Supabase | `frontend/src/services/ordersSync.js`, `productsSync.js` |
| Auth/login backend | `backend/routes/login_router.js`, `backend/Supabaseclient.js` |
| สคีมาฐานข้อมูล | `backend/migrations/*.sql` |
