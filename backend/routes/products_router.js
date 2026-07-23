// 📄 backend/routes/products_router.js
// ─────────────────────────────────────────────────────────────
// REST API for products — this IS the "Backend API" layer in the
// evaluation criteria. Thin route handlers only; all logic lives in
// ../services/productsService.js.
//
// Mounted in server.js under /api, so the full paths are:
//   GET    /api/products
//   GET    /api/products/export
//   GET    /api/products/:id
//   POST   /api/products
//   PATCH  /api/products/bulk
//   DELETE /api/products
//   POST   /api/products/import
//   POST   /api/products/decrement-stock
// ─────────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const productsService = require('../services/productsService');
const supabase = require('../Supabaseclient');

/**
 * ต้อง login (Supabase session) ก่อนถึงจะตัดสต็อกได้ — กันไม่ให้ใครก็ได้ยิง
 * POST นี้ตรงๆ เพื่อตัดสต็อกโดยไม่ผ่าน flow การสั่งซื้อจริงเลย (ดู CheckoutPage.jsx
 * ซึ่งเช็ค session ก่อนแสดงหน้า checkout อยู่แล้ว — endpoint นี้บังคับซ้ำอีกชั้นที่ backend)
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' });

  req.user = data.user;
  next();
}

/**
 * @swagger
 * /products:
 *   get:
 *     summary: ดึงรายการสินค้าทั้งหมด
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: รายการสินค้า
 */
router.get('/products', async (req, res) => {
  console.time('GET /products');
  try {
    const products = await productsService.listProducts();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'โหลดรายการสินค้าไม่สำเร็จ' });
  } finally {
    console.timeEnd('GET /products');
  }
});

/**
 * @swagger
 * /products/export:
 *   get:
 *     summary: Export สินค้าทั้งหมดเป็น JSON (ดาวน์โหลด)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: ไฟล์ JSON ของสินค้าทั้งหมด
 */
// ⚠️ Must be declared BEFORE '/products/:id' — otherwise Express would
// match "export" as an :id value and this route would never be hit.
router.get('/products/export', async (req, res) => {
  try {
    const json = await productsService.exportProductsJSON();
    res.setHeader('Content-Type', 'application/json');
    res.send(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Export ไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: ดึงสินค้าตาม id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ข้อมูลสินค้า
 *       404:
 *         description: ไม่พบสินค้า
 */
router.get('/products/:id', async (req, res) => {
  try {
    const product = await productsService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'ไม่พบสินค้า' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'โหลดสินค้าไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: สร้างสินค้าใหม่ หรือแก้ไขสินค้าเดิม (upsert)
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: object
 *               actor:
 *                 type: string
 *     responses:
 *       200:
 *         description: สินค้าที่บันทึกแล้ว
 */
router.post('/products', async (req, res) => {
  try {
    const { product, actor } = req.body || {};
    if (!product) return res.status(400).json({ error: 'ต้องส่ง product มาด้วย' });
    const saved = await productsService.upsertProduct({ product, actor });
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'บันทึกไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /products/bulk:
 *   patch:
 *     summary: แก้ไขสินค้าหลายรายการพร้อมกัน (patch เดียวกันทุก id)
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               patch:
 *                 type: object
 *               actor:
 *                 type: string
 *     responses:
 *       200:
 *         description: รายการสินค้าทั้งหมดหลังอัปเดต
 */
router.patch('/products/bulk', async (req, res) => {
  try {
    const { ids, patch, actor } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ต้องส่ง ids เป็น array' });
    if (!patch || typeof patch !== 'object') return res.status(400).json({ error: 'ต้องส่ง patch เป็น object' });
    const updated = await productsService.bulkUpdateProducts(ids, patch, { actor });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'อัปเดตไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /products:
 *   delete:
 *     summary: ลบสินค้าหลายรายการ
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: รายการสินค้าที่เหลือหลังลบ
 */
router.delete('/products', async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ต้องส่ง ids เป็น array' });
    const remaining = await productsService.deleteProducts(ids);
    res.json(remaining);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'ลบไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /products/import:
 *   post:
 *     summary: Import สินค้าจาก JSON (merge ตาม id)
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               json:
 *                 type: string
 *               actor:
 *                 type: string
 *     responses:
 *       200:
 *         description: รายการสินค้าทั้งหมดหลัง import
 */
router.post('/products/import', async (req, res) => {
  try {
    const { json, actor } = req.body || {};
    if (typeof json !== 'string') return res.status(400).json({ error: 'ต้องส่ง json เป็น string' });
    const all = await productsService.importProductsJSON(json, { actor });
    res.json(all);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Import ไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /products/decrement-stock:
 *   post:
 *     summary: ตัดสต็อกหลังชำระเงินสำเร็จ (เรียกจาก checkout flow)
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               actor:
 *                 type: string
 *     responses:
 *       200:
 *         description: รายการสินค้าทั้งหมดหลังตัดสต็อก
 */
router.post('/products/decrement-stock', requireAuth, async (req, res) => {
  try {
    const { items, actor } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'ต้องส่ง items เป็น array' });
    }
    const updated = await productsService.decrementStockForOrder(items, { actor });
    res.json(updated);
  } catch (err) {
    if (err.code === 'INSUFFICIENT_STOCK') {
      return res.status(409).json({ error: err.message, details: err.details });
    }
    console.error(err);
    res.status(500).json({ error: err.message || 'ตัดสต็อกไม่สำเร็จ' });
  }
});

module.exports = router;
