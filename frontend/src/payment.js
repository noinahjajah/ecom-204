/**
 * payment.js — helper สำหรับตรวจสอบข้อมูลบัตรเครดิต/เดบิตฝั่ง client
 *
 * หมายเหตุสำคัญ: นี่คือการ "ตรวจสอบรูปแบบบัตร" (Luhn / brand / วันหมดอายุ) เพื่อจำลอง
 * ประสบการณ์ชำระเงินให้สมจริงสำหรับโปรเจกต์การศึกษา ไม่ใช่การเชื่อมต่อผู้ให้บริการชำระเงินจริง
 * (เช่น Omise / Stripe / 2C2P) จึงไม่มีการตัดเงินจริงเกิดขึ้น และเราจะไม่เก็บเลขบัตรเต็มหรือ CVV
 * ไว้ที่ไหนเลย — เก็บแค่ brand + เลข 4 ตัวท้าย + วันหมดอายุ สำหรับแสดงผลเท่านั้น
 */

export function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

function shouldBypassLuhnCheck() {
  return import.meta.env?.DEV && import.meta.env?.VITE_BYPASS_CARD_LUHN === "true";
}

/** จัดกลุ่มเลขบัตรเป็นชุดละ 4 หลักเพื่อให้อ่านง่ายขณะพิมพ์ */
export function formatCardNumber(value) {
  return onlyDigits(value).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

/** ใส่ / อัตโนมัติระหว่างเดือนกับปีขณะพิมพ์ MM/YY */
export function formatExpiry(value) {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** ตรวจความถูกต้องของเลขบัตรด้วย Luhn algorithm (มาตรฐานเดียวกับที่ธนาคาร/เกตเวย์จริงใช้) */
export function luhnCheck(cardNumber) {
  const digits = onlyDigits(cardNumber);
  if (digits.length < 12) return false;
  if (shouldBypassLuhnCheck()) return true;
  let sum = 0;
  let isEven = false;

  // วนลูปจากขวาไปซ้าย
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * ดึงเฉพาะตัวเลขออกจากสตริง
 */
export function onlyDigits(str) {
  return String(str || "").replace(/\D/g, "");
}

/**
 * จัดรูปแบบหมายเลขบัตรให้มีช่องว่างทุก 4 ตัว
 */
export function formatCardNumber(value) {
  const digits = onlyDigits(value);
  const groups = [];
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4));
  }
  return groups.join(" ");
}

/**
 * จัดรูปแบบวันหมดอายุเป็น MM/YY
 */
export function formatExpiry(value) {
  const digits = onlyDigits(value);
  if (digits.length >= 2) {
    return digits.slice(0, 2) + "/" + digits.slice(2, 4);
  }
  return digits;
}

/**
 * ตรวจสอบวันหมดอายุว่ายังไม่หมดอายุ
 */
export function isExpiryValid(expiry) {
  const digits = onlyDigits(expiry);
  if (digits.length !== 4) return false;

  const month = parseInt(digits.slice(0, 2), 10);
  const year = parseInt(digits.slice(2, 4), 10);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

/**
 * ตรวจจับประเภทบัตรจากหมายเลข
 */
export function detectCardBrand(cardNumber) {
  const digits = onlyDigits(cardNumber);
  if (digits.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "American Express";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  if (/^(?:2131|1800|35)/.test(digits)) return "JCB";
  return "Unknown";
}

/**
 * ตรวจสอบ CVV/CVC ว่าถูกต้องตามประเภทบัตร
 */
export function isCvvValid(cvv, brand) {
  const digits = onlyDigits(cvv);
  if (brand === "American Express") {
    return digits.length === 4;
  }
  return digits.length === 3;
}

/**
 * สร้างรหัสคำสั่งซื้อแบบสุ่ม
 */
export function generateOrderId() {
  const prefix = "MV";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}