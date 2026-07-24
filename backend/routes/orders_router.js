// 📄 backend/routes/orders_router.js
// Order history REST API endpoints

const express = require('express');
const router = express.Router();
const ordersService = require('../services/ordersService');
const supabase = require('../Supabaseclient');

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
 * /orders/:id:
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

module.exports = router;
