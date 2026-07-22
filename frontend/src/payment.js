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
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/** เดา brand บัตรจากช่วงเลขขึ้นต้น (BIN) แบบเดียวกับที่ฟอร์มชำระเงินทั่วไปแสดงไอคอน */
export function detectCardBrand(cardNumber) {
  const digits = onlyDigits(cardNumber);
  if (/^4/.test(digits)) return "Visa";
  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]\d|7[01]|720)/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "American Express";
  if (/^35(2[89]|[3-8]\d)/.test(digits)) return "JCB";
  return "บัตร";
}

/** ตรวจว่าวันหมดอายุ MM/YY ยังไม่หมดอายุ ณ วันนี้ */
export function isExpiryValid(expiry) {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = 2000 + parseInt(match[2], 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

export function isCvvValid(cvv, brand) {
  const digits = onlyDigits(cvv);
  return brand === "American Express" ? digits.length === 4 : digits.length === 3;
}

/** สร้างเลขที่คำสั่งซื้อแบบอ่านง่าย เช่น MV-20260718-4821 */
export function generateOrderId() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MV-${y}${m}${d}-${rand}`;
}
