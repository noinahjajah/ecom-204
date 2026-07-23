import { slugify } from "./cart";

// แหล่งข้อมูลสินค้า “กลาง” เพื่อให้หน้า Product Detail Page ดึงได้ทุกหมวด
// หมายเหตุ: โปรเจกต์นี้ยังไม่มี backend จึงเป็นข้อมูลจำลอง (mock) ตามข้อมูลที่มีอยู่เดิมในหน้า list

const commonReviews = [
  {
    name: "Nok",
    rating: 5,
    text: "เนื้อดีมาก ซึมไว ใช้แล้วผิวดูสุขภาพดีขึ้นค่ะ",
    date: "2026-06-12",
  },
  {
    name: "Pim",
    rating: 4,
    text: "แพ็กเกจสวยและใช้ง่าย เหมาะกับผิวแพ้ง่าย",
    date: "2026-05-02",
  },
  {
    name: "Mint",
    rating: 5,
    text: "กลิ่นอ่อนๆ ไม่รบกวน ผิวดูชุ่มชื้นขึ้นจริง",
    date: "2026-04-18",
  },
];

function mkProduct(p) {
  const id = p.id || slugify(p.name);
  return {
    id,
    name: p.name,
    category: p.category || "",
    variantOptions: p.variantOptions || [],
    variantDefault: p.variantDefault || null,
    price: p.price,
    oldPrice: p.oldPrice ?? null,
    tag: p.tag ?? null,
    image: p.image,
    desc: p.desc || "",
    features: p.features || [],
    ingredient: p.ingredient || "",
    reviews: p.reviews || commonReviews,
    relatedIds: p.relatedIds || [],
  };
}

// HOME (รวมเป็นหมวดกว้าง)
const homeProducts = [
  {
    name: "Velvet Silk Serum",
    category: "เมคอัพ/สกินแคร์",
    desc: "เซรั่มบำรุงผิวเข้มข้น เนื้อบางเบา ซึมไว",
    price: "2,480",
    oldPrice: null,
    tag: "New",
    image: "https://placehold.co/500x625/ffffff/ad8a55?text=Serum",
    features: ["เนื้อบางเบา ซึมไว", "ช่วยลดเลือนริ้วรอยก่อนวัย (จำลอง)"] ,
    ingredient: "เปปไทด์ + น้ำมันไหม (จำลอง)",
    variantOptions: [],
  },
  {
    name: "Rose Clay Cleansing Balm",
    category: "สกินแคร์",
    desc: "บาล์มทำความสะอาดผิว สูตรอ่อนโยน",
    price: "1,290",
    oldPrice: "1,590",
    tag: "Sale",
    image: "https://placehold.co/500x625/ffffff/ad8a55?text=Cleanser",
    features: ["อ่อนโยนต่อผิว", "ช่วยละลายเครื่องสำอาง (จำลอง)"],
    ingredient: "โคลนกุหลาบ + น้ำมันโจโจบา (จำลอง)",
    variantOptions: [],
  },
  {
    name: "Golden Hour Highlighter",
    category: "เมคอัพ",
    desc: "ไฮไลท์เนื้อครีม ให้แสงประกายจากภายใน",
    price: "1,150",
    oldPrice: null,
    tag: null,
    image: "https://placehold.co/500x625/ffffff/ad8a55?text=Highlighter",
    features: ["ให้ประกายละมุน", "ติดทน (จำลอง)"],
    ingredient: "Luminous pigments (จำลอง)",
    variantOptions: [],
  },
  {
    name: "Bare Petal Lip Tint",
    category: "เมคอัพ",
    desc: "ลิปทินท์เนื้อกำมะหยี่ ติดทนตลอดวัน",
    price: "890",
    oldPrice: null,
    tag: "Best Seller",
    image: "https://placehold.co/500x625/ffffff/ad8a55?text=Lip+Tint",
    features: ["ติดทน", "ไม่ทำให้ริมฝีปากแห้ง (จำลอง)"],
    ingredient: "Velvet formula (จำลอง)",
    variantOptions: [],
  },
];

// SKINCARE (ยึดจากไฟล์เดิม)
const skincareProducts = [
  {
    name: "Rose Clay Cleansing Balm",
    category: "สกินแคร์",
    desc: "บาล์มทำความสะอาดผิว ละลายเครื่องสำอางและสิ่งสกปรกอย่างอ่อนโยน",
    price: "1,290",
    oldPrice: "1,590",
    tag: "Sale",
    image: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Cleansing+Balm",
    features: ["อ่อนโยน", "ช่วยละลายสิ่งสกปรก (จำลอง)"],
    ingredient: "โคลนกุหลาบ + น้ำมันโจโจบา",
    variantOptions: [],
  },
  {
    name: "Centella Calm Toner",
    category: "สกินแคร์",
    desc: "โทนเนอร์ผสานสารสกัดใบบัวบก เย็นสบาย ลดผิวแดงระคายเคือง",
    price: "980",
    oldPrice: null,
    tag: null,
    image: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Toner",
    features: ["ลดความระคายเคือง (จำลอง)", "ปรับสมดุลผิว"],
    ingredient: "สารสกัดใบบัวบก",
    variantOptions: [],
  },
  {
    name: "Velvet Silk Serum",
    category: "สกินแคร์",
    desc: "เซรั่มบำรุงผิวเข้มข้น เนื้อบางเบา ซึมไว ลดเลือนริ้วรอยก่อนวัย",
    price: "2,480",
    oldPrice: null,
    tag: "New",
    image: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Serum",
    features: ["ลดเลือนริ้วรอย (จำลอง)", "ซึมไว"],
    ingredient: "เปปไทด์ + น้ำมันไหม",
    variantOptions: [],
  },
  {
    name: "Niacinamide Pore Refine",
    category: "สกินแคร์",
    desc: "เซรั่มเนื้อน้ำ ควบคุมความมันและรูขุมขนให้กระชับขึ้นตั้งแต่สัปดาห์แรก",
    price: "1,450",
    oldPrice: null,
    tag: "Best Seller",
    image: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Serum",
    features: ["ช่วยคุมมัน (จำลอง)", "ลดรูขุมขน (จำลอง)"],
    ingredient: "ไนอาซินาไมด์ 10%",
    variantOptions: [],
  },
  {
    name: "Vitamin C Bright Ampoule",
    category: "สกินแคร์",
    desc: "แอมพูลวิตามินซีเสถียรสูตรเข้มข้น ลดรอยหมองคล้ำ ผิวกระจ่างใสขึ้น",
    price: "2,190",
    oldPrice: null,
    tag: null,
    image: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Ampoule",
    features: ["ช่วยให้ผิวดูสว่าง (จำลอง)"],
    ingredient: "วิตามินซี 15%",
    variantOptions: [],
  },
  {
    name: "Hyaluronic Dew Moisturizer",
    category: "สกินแคร์",
    desc: "มอยส์เจอไรเซอร์เนื้อเจลครีม กักเก็บความชุ่มชื้นได้นานถึง 24 ชั่วโมง",
    price: "1,650",
    oldPrice: null,
    tag: null,
    image: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Moisturizer",
    features: ["กักเก็บความชุ่มชื้น (จำลอง)"],
    ingredient: "ไฮยาลูรอนิก แอซิด 5 ชนิด",
    variantOptions: [],
  },
  {
    name: "Golden Clay Mask",
    category: "สกินแคร์",
    desc: "มาส์กโคลนทองคำ ดูดซับความมัน กระชับรูขุมขนใน 15 นาที",
    price: "1,190",
    oldPrice: null,
    tag: null,
    image: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Clay+Mask",
    features: ["ช่วยดูดซับความมัน (จำลอง)", "กระชับ (จำลอง)"],
    ingredient: "โคลนภูเขาไฟ + ทองคำ 24K",
    variantOptions: [],
  },
  {
    name: "Silk Veil SPF 50",
    category: "สกินแคร์",
    desc: "กันแดดเนื้อบางเบาใต้เมคอัพ ไม่ทิ้งคราบขาว",
    price: "1,090",
    oldPrice: null,
    tag: "Best Seller",
    image: "https://placehold.co/500x625/f3ece0/9c7b4f?text=Sunscreen",
    features: ["ปกป้อง UVA/UVB (จำลอง)", "ทาแล้วเนียน (จำลอง)"],
    ingredient: "SPF 50 PA++++",
    variantOptions: [],
  },
];

// MAKEUP (ยึดจากไฟล์เดิม)
const makeupProducts = [
  {
    name: "Silk Veil Foundation",
    category: "เมคอัพ",
    desc: "รองพื้นเนื้อบางเบา ปกปิดเรียบเนียนเหมือนผิวจริง คุมมันได้นาน 12 ชม.",
    price: "1,890",
    oldPrice: null,
    tag: "Best Seller",
    image: "https://placehold.co/500x625/faf3ea/ad8a55?text=Foundation",
    features: ["บางเบา", "คุมมัน (จำลอง)"],
    ingredient: "Foundation complex (จำลอง)",
    variantOptions: ["Satin Matte", "Natural Glow"],
    variantDefault: "Satin Matte",
  },
  {
    name: "Featherlight Concealer",
    category: "เมคอัพ",
    desc: "คอนซีลเลอร์เนื้อครีมเข้มข้น ปกปิดรอยคล้ำใต้ตาโดยไม่เป็นคราบ",
    price: "890",
    oldPrice: null,
    tag: null,
    image: "https://placehold.co/500x625/faf3ea/ad8a55?text=Concealer",
    features: ["ปกปิดรอยคล้ำ (จำลอง)"],
    ingredient: "Concealer blend (จำลอง)",
    variantOptions: ["Natural Glow"],
    variantDefault: "Natural Glow",
  },
  {
    name: "Ember Eyeshadow Palette",
    category: "เมคอัพ",
    desc: "พาเลตอายแชโดว์ 9 เฉดสีดินเผา ไล่สีง่าย ติดทนไม่ตกร่อง",
    price: "1,650",
    oldPrice: null,
    tag: "New",
    image: "https://placehold.co/500x625/faf3ea/ad8a55?text=Eyeshadow",
    features: ["เฉดสีสวย (จำลอง)", "ติดทน (จำลอง)"],
    ingredient: "Matte & Shimmer powders (จำลอง)",
    variantOptions: ["Matte & Shimmer"],
    variantDefault: "Matte & Shimmer",
  },
  {
    name: "Sculpt Brow Pencil",
    category: "เมคอัพ",
    desc: "ดินสอเขียนคิ้วปลายเรียว ขึ้นโครงคิ้วเส้นคมชัดเหมือนคิ้วจริง",
    price: "590",
    oldPrice: null,
    tag: null,
    image: "https://placehold.co/500x625/faf3ea/ad8a55?text=Brow+Pencil",
    features: ["เส้นคมชัด (จำลอง)", "ติดทน (จำลอง)"],
    ingredient: "Fine tip pigment (จำลอง)",
    variantOptions: ["Fine Tip"],
    variantDefault: "Fine Tip",
  },
  {
    name: "Golden Hour Highlighter",
    category: "เมคอัพ",
    desc: "ไฮไลท์เนื้อครีม ให้แสงประกายจากภายใน ผสานผิวเนียนเป็นเนื้อเดียว",
    price: "1,150",
    oldPrice: null,
    tag: null,
    image: "https://placehold.co/500x625/faf3ea/ad8a55?text=Highlighter",
    features: ["ประกายละมุน (จำลอง)"],
    ingredient: "Luminous gel (จำลอง)",
    variantOptions: ["Luminous"],
    variantDefault: "Luminous",
  },
  {
    name: "Petal Flush Blush",
    category: "เมคอัพ",
    desc: "บลัชออนเนื้อฝุ่นละเอียด ให้สีแก้มอมชมพูสุขภาพดีเป็นธรรมชาติ",
    price: "980",
    oldPrice: "1,190",
    tag: "Sale",
    image: "https://placehold.co/500x625/faf3ea/ad8a55?text=Blush",
    features: ["สีสวยเป็นธรรมชาติ (จำลอง)"],
    ingredient: "Soft matte pigments (จำลอง)",
    variantOptions: ["Soft Matte"],
    variantDefault: "Soft Matte",
  },
  {
    name: "Bare Petal Lip Tint",
    category: "เมคอัพ",
    desc: "ลิปทินท์เนื้อกำมะหยี่ ติดทนตลอดวัน ไม่ทำให้ริมฝีปากแห้ง",
    price: "890",
    oldPrice: null,
    tag: "Best Seller",
    image: "https://placehold.co/500x625/faf3ea/ad8a55?text=Lip+Tint",
    features: ["ติดทน", "สบายปาก (จำลอง)"],
    ingredient: "Velvet matte formula (จำลอง)",
    variantOptions: ["Velvet Matte"],
    variantDefault: "Velvet Matte",
  },
  {
    name: "Satin Rouge Lipstick",
    category: "เมคอัพ",
    desc: "ลิปสติกเนื้อซาตินเรียบเนียน ให้สีสม่ำเสมอในทาเดียว",
    price: "1,090",
    oldPrice: null,
    tag: null,
    image: "https://placehold.co/500x625/faf3ea/ad8a55?text=Lipstick",
    features: ["เนื้อซาติน (จำลอง)"],
    ingredient: "Satin pigments (จำลอง)",
    variantOptions: ["Satin"],
    variantDefault: "Satin",
  },
];

const all = [...homeProducts, ...skincareProducts, ...makeupProducts]
  // ทำให้ name ซ้ำกันใช้ข้อมูลล่าสุดจากลิสต์ท้าย ๆ (skincare/makeup override)
  .reduce((acc, p) => {
    acc[slugify(p.name)] = p;
    return acc;
  }, {});

export const PRODUCTS = Object.values(all).map(mkProduct);

export function getProductById(id) {
  if (!id) return null;
  const normalized = String(id);
  return PRODUCTS.find((p) => p.id === normalized) || null;
}

export function getRelatedProducts(product) {
  if (!product) return [];
  // ถ้ามี relatedIds ให้ใช้ก่อน
  if (product.relatedIds?.length) {
    const set = new Set(product.relatedIds);
    return PRODUCTS.filter((p) => set.has(p.id) && p.id !== product.id).slice(0, 4);
  }

  // else: เลือกจากหมวดเดียวกัน
  return PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
}

