// 📄 backend/routes/orders_router.js
// Order history REST API endpoints

const express = require('express');
const router = express.Router();
const ordersService = require('../services/ordersService');
const supabase = require('../Supabaseclient');
const { createUserClient } = supabase;

// Middleware: require auth token (เหมือน cart_router.js / addresses_router.js)
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อน' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: 'เซสชันหมดอายุ' });

  req.user = data.user;
  req.supabase = supabase.createUserClient(token);
  next();
}

// ต้อง login ด้วย session ที่ผูกกับ profile role === 'admin' เท่านั้น
// (เหมือน requireAdmin ใน products_router.js — กันหน้า Admin จัดการออเดอร์
// ไม่ให้ใครก็ได้ยิง request ตรงมาที่ backend เพื่อดู/แก้ไขออเดอร์ของผู้ใช้ทุกคน)
async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อน' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' });

  const userClient = createUserClient(token);
  const { data: profile, error: profileError } = await userClient
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return res.status(403).json({ error: 'ต้องเป็นผู้ดูแลระบบเท่านั้น' });
  }

  req.user = data.user;
  req.supabase = userClient;
  next();
}

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: ดึงประวัติคำสั่งซื้อของผู้ใช้
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: รายการคำสั่งซื้อ เรียงจากล่าสุด
 */
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const orders = await ordersService.getOrders(req.supabase, req.user.id);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'ดึงประวัติคำสั่งซื้อไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /orders/admin:
 *   get:
 *     summary: ดึงคำสั่งซื้อทั้งหมดของทุกผู้ใช้ (สำหรับหน้า Admin จัดการออเดอร์)
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: รายการคำสั่งซื้อทั้งหมด เรียงจากล่าสุด
 */
// ⚠️ Must be declared BEFORE '/orders/:id' style routes ever get a GET
// handler — otherwise Express would match "admin" as an :id value.
router.get('/orders/admin', requireAdmin, async (req, res) => {
  try {
    const orders = await ordersService.getAllOrders(req.supabase);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'ดึงรายการคำสั่งซื้อไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: บันทึกคำสั่งซื้อใหม่ (upsert ด้วย id ที่ frontend generate มา)
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 */
router.post('/orders', requireAuth, async (req, res) => {
  try {
    const order = await ordersService.upsertOrder(req.supabase, req.user.id, req.body || {});
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'บันทึกคำสั่งซื้อไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   patch:
 *     summary: แก้ไขคำสั่งซื้อที่มีอยู่ (สถานะ / เลข tracking)
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.patch('/orders/:id', requireAuth, async (req, res) => {
  try {
    const order = await ordersService.updateOrder(req.supabase, req.user.id, req.params.id, req.body || {});
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'แก้ไขคำสั่งซื้อไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /orders/{id}/admin:
 *   patch:
 *     summary: แก้ไขคำสั่งซื้อของผู้ใช้คนไหนก็ได้ (สถานะ / เลข tracking) — สำหรับ Admin เท่านั้น
 *     security:
 *       - bearerAuth: []
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.patch('/orders/:id/admin', requireAdmin, async (req, res) => {
  try {
    const order = await ordersService.updateOrderAdmin(req.supabase, req.params.id, req.body || {});
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'แก้ไขคำสั่งซื้อไม่สำเร็จ' });
  }
});

module.exports = router;
