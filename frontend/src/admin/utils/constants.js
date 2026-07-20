// ─── Order status constants ───

export const PAYMENT_STATUS = {
  pending: { label: "รอชำระเงิน", css: "badge badge-pending-pay" },
  paid: { label: "ชำระแล้ว", css: "badge badge-paid" },
  cancelled: { label: "ยกเลิก", css: "badge badge-cancelled" },
};

export const SHIPPING_STATUS = {
  idle: { label: "รอดำเนินการ", css: "badge badge-idle" },
  preparing: { label: "กำลังเตรียมพัสดุ", css: "badge badge-preparing" },
  shipping: { label: "กำลังจัดส่ง", css: "badge badge-shipping" },
  delivered: { label: "จัดส่งสำเร็จ", css: "badge badge-delivered" },
  cancelled: { label: "ยกเลิก", css: "badge badge-cancelled" },
};

export const PAYMENT_STATUS_MAP = {
  "รอชำระเงิน": PAYMENT_STATUS.pending,
  paid: PAYMENT_STATUS.paid,
  "ชำระแล้ว": PAYMENT_STATUS.paid,
  "ยกเลิก": PAYMENT_STATUS.cancelled,
};

export const SHIPPING_STATUS_MAP = {
  "รอดำเนินการ": SHIPPING_STATUS.idle,
  "กำลังเตรียมพัสดุ": SHIPPING_STATUS.preparing,
  "กำลังจัดส่ง": SHIPPING_STATUS.shipping,
  "จัดส่งสำเร็จ": SHIPPING_STATUS.delivered,
  "ยกเลิก": SHIPPING_STATUS.cancelled,
};

export const PRODUCT_STATUS = {
  Active: "admin-badge-active",
  Draft: "admin-badge-draft",
  Pending: "admin-badge-pending",
  Hidden: "admin-badge-pending",
  Rejected: "admin-badge-rejected",
  OutOfStock: "admin-badge-rejected",
  Deleted: "admin-badge-rejected",
};

export const SHIPPING_OPTIONS = [
  "รอดำเนินการ",
  "กำลังเตรียมพัสดุ",
  "กำลังจัดส่ง",
  "จัดส่งสำเร็จ",
  "ยกเลิก",
];

export const STATUS_FILTER_OPTIONS = [
  { value: "All", label: "ทั้งหมด" },
  { value: "paid", label: "ชำระแล้ว" },
  { value: "cancelled", label: "ยกเลิก" },
];

export const PRODUCT_FILTER_OPTIONS = [
  { value: "All", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Draft", label: "Draft" },
  { value: "Pending", label: "Pending" },
  { value: "Hidden", label: "Hidden" },
  { value: "OutOfStock", label: "OutOfStock" },
  { value: "Rejected", label: "Rejected" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "ใหม่" },
  { value: "oldest", label: "เก่า" },
  { value: "priceHigh", label: "ราคาสูง" },
  { value: "priceLow", label: "ราคาต่ำ" },
  { value: "bestSelling", label: "ขายดี" },
  { value: "ratingHigh", label: "รีวิว" },
];

export const BULK_ACTIONS = [
  { value: "hide", label: "ซ่อน" },
  { value: "activate", label: "เปิดขาย" },
  { value: "approve", label: "อนุมัติ" },
  { value: "reject", label: "ปฏิเสธ" },
  { value: "outofstock", label: "หมดสต็อก" },
  { value: "delete", label: "ลบ" },
];

export const STORAGE_KEYS = {
  products: "admin_products_v1",
  orders: "mv_orders",
  cart: "mv_cart",
  session: "mv_session",
};

export const NAV_ITEMS = [
  { id: "overview", label: "📊 ภาพรวม", icon: "overview" },
  { id: "orders", label: "📦 ออเดอร์", icon: "orders" },
  { id: "products", label: "🏷️ สินค้า", icon: "products" },
];

