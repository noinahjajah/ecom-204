# System Architecture

```mermaid
flowchart TD
    subgraph Client["ผู้ใช้งาน"]
        User["ลูกค้า / แอดมิน<br/>เบราว์เซอร์ Desktop / Mobile"]
    end

    subgraph FE["Frontend (React 18 + Vite)"]
        SPA["SPA: Home, Makeup, Skincare,<br/>Cart, Checkout, Account, Orders,<br/>Addresses, Admin Products"]
        SupaClient["supabaseClient.js<br/>(supabase-js SDK)"]
        SPA --> SupaClient
    end

    subgraph BE["Backend API (Node.js + Express, /api)"]
        Routes["Routers: login, products, cart,<br/>addresses, orders, cards, integrations"]
        Services["Services layer<br/>(productsService, cartService, ordersService,<br/>addressesService, cardsService)"]
        Docs["Swagger UI ที่ /api-docs"]
        Routes --> Services
    end

    subgraph SB["Supabase"]
        Auth["Auth<br/>Email/Password + Google OAuth"]
        DB[("PostgreSQL<br/>+ Row Level Security")]
    end

    subgraph EXT["External Services (server-side only)"]
        Rouvo["Rouvo CRM API<br/>(sync ที่อยู่จัดส่ง)"]
        Superbet["Superbet API<br/>(ติดตามพัสดุ)"]
    end

    User -->|"HTTPS"| SPA

    SupaClient -->|"signInWithPassword / signInWithOAuth (Google)"| Auth
    Auth -->|"JWT access_token"| SupaClient

    SPA -->|"Authorization: Bearer JWT"| Routes

    Services -->|"createUserClient(JWT), query ผ่าน auth.uid()"| DB

    Services -->|"server-side API key"| Rouvo
    Services -->|"server-side API key"| Superbet
```

## หมายเหตุ

- Payment เป็นการจำลองฝั่ง client (`frontend/src/payment.js`) ตรวจ Luhn/brand/expiry เท่านั้น ไม่มี payment gateway จริง (Omise/Stripe/2C2P) และไม่มีการตัดเงินจริง — เก็บแค่ brand + เลข 4 ตัวท้าย
- `login_router.js` มี endpoint `/login`, `/login/google` ฝั่ง backend ด้วย แต่ที่ใช้งานจริงในหน้า Login คือเรียก `supabase.auth.signInWithOAuth` ตรงจาก frontend
- Rouvo/Superbet ก่อนหน้านี้เคยเรียกจาก frontend ตรงๆ (คีย์หลุดใน bundle) ตอนนี้ย้ายมาเรียกจาก backend แล้ว

---

## Sequence Diagrams

แผนภาพลำดับการทำงานของแต่ละ flow หลัก อ้างอิงจากโค้ดจริงในระบบ (ไม่ใช่การออกแบบในอุดมคติ) — ดูหมายเหตุท้ายแต่ละแผนภาพสำหรับข้อจำกัด/ช่องว่างที่ยังไม่ได้ทำ

### 6.1 การเข้าสู่ระบบ + จัดการ Session

```mermaid
sequenceDiagram
    participant C as ลูกค้า
    participant FE as หน้าเว็บ (React)
    participant SB as Supabase Auth
    participant BE as Backend (Express /api)
    participant DB as PostgreSQL (RLS)

    C->>FE: กดปุ่ม "เข้าสู่ระบบด้วย Google" (Login.jsx)
    FE->>SB: signInWithOAuth({provider: "google"}) (เรียกตรง ไม่ผ่าน backend)
    SB-->>FE: OAuth redirect URL
    FE->>C: window.location.href = URL
    C->>SB: ยืนยันตัวตนที่ Google
    SB-->>FE: redirect กลับ /auth/callback พร้อม session
    FE->>SB: getSession() (AuthCallback.jsx)
    SB-->>FE: access_token + refresh_token (SDK เก็บเอง ไม่ใช่ HttpOnly cookie)
    Note over FE: mergeGuestCartIntoUserCart() รวมตะกร้าก่อนล็อกอินเข้าบัญชี
    FE->>BE: GET /api/cart, /api/orders ฯลฯ (Authorization: Bearer access_token)
    BE->>SB: auth.getUser(token)
    SB-->>BE: user object
    BE->>DB: createUserClient(token).from(...) - RLS ใช้ auth.uid()
    DB-->>BE: ข้อมูลเฉพาะของ user นั้น
    BE-->>FE: JSON response
    Note over FE,SB: supabase-js refresh token อัตโนมัติในเบราว์เซอร์<br/>login_router.js (/api/login, /api/login/google) มีอยู่แต่ไม่ได้ถูกเรียกจากหน้า Login จริง
```

### 6.2 การสั่งซื้อ + ชำระเงิน (จำลอง)

```mermaid
sequenceDiagram
    participant C as ลูกค้า
    participant FE as CheckoutPage.jsx
    participant PAY as payment.js
    participant BE as Backend (Express /api)
    participant DB as PostgreSQL (orders)
    participant SP as Superbet (proxy)

    C->>FE: เลือกที่อยู่ + กรอกข้อมูลบัตร
    FE->>PAY: luhnCheck() / detectCardBrand() / isExpiryValid()
    PAY-->>FE: ผ่านรูปแบบ (ตรวจฝั่ง client เท่านั้น ไม่ตัดเงินจริง)
    FE->>FE: saveOrder(order) เขียน localStorage ทันที (optimistic)
    FE-->>C: แสดงหน้าสำเร็จทันที
    FE->>BE: POST /api/orders (Bearer token, ยิงแบบ non-blocking)
    BE->>BE: requireAuth -> supabase.auth.getUser(token)
    BE->>DB: ordersService.upsertOrder() insert แถว orders (status = รอดำเนินการ)
    DB-->>BE: order row
    BE-->>FE: order JSON
    FE->>BE: POST /api/integrations/superbet/tracking
    BE->>SP: superbetService.createTracking()
    SP-->>BE: trackingNumber
    BE-->>FE: trackingNumber
    FE->>FE: updateOrder(id, {trackingNumber}) -> localStorage + PATCH /api/orders/:id
    Note over PAY,DB: ไม่มีการอัปโหลด/ตรวจสลิป (EasySlip) และไม่มี payment gateway จริงในระบบนี้
```

### 6.3 แอดมินจัดการสินค้า

```mermaid
sequenceDiagram
    participant A as แอดมิน
    participant FE as ProductsDashboard.jsx (/admin)
    participant BE as Backend (products_router.js)
    participant SB as Supabase Auth
    participant DB as PostgreSQL (profiles, products)

    A->>FE: เปิดหน้า /admin/products
    FE->>FE: AdminLayout.jsx เช็ค role (UI gate เบื้องต้น)
    FE->>BE: GET /api/products/admin (Authorization: Bearer)
    BE->>BE: requireAdmin middleware
    BE->>SB: auth.getUser(token)
    SB-->>BE: user
    BE->>DB: from('profiles').select('role').eq('id', user.id)
    DB-->>BE: role
    alt role != admin
        BE-->>FE: 403 ต้องเป็นผู้ดูแลระบบเท่านั้น
    else role == admin
        BE->>DB: productsService.listProductsAdmin()
        DB-->>BE: รายการสินค้าเต็ม
        BE-->>FE: 200 products[]
        A->>FE: แก้ไข/เพิ่มสินค้า หรือ Bulk Action
        FE->>BE: POST /api/products หรือ PATCH /api/products/bulk
        BE->>BE: requireAdmin ตรวจซ้ำทุก request
        BE->>DB: upsertProduct() / bulkUpdateProducts()
        DB-->>BE: บันทึกสำเร็จ
        BE-->>FE: สินค้าที่อัปเดตแล้ว
    end
    Note over BE,DB: เดิมกลุ่ม endpoint นี้ไม่มีการตรวจสิทธิ์ฝั่ง backend เลย (แค่ UI gate)<br/>แก้เป็น requireAdmin เพื่อปิดช่องโหว่ Broken Access Control (OWASP A01)
    Note over A,DB: ระบบยังไม่มี endpoint /api/admin/orders ที่แยก role-gate สำหรับจัดส่ง/คืนเงิน<br/>ปัจจุบัน /api/orders (GET/PATCH) requireAuth เฉยๆ ไม่เช็ค role
```
