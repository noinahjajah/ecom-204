// 📄 backend/routes/integrations_router.js
// Proxy endpoints for third-party integrations (Rouvo CRM, Superbet shipping).
// API keys for these services are read from server-side env vars only
// (see rouvoService.js / superbetService.js) and are never sent to the client.

const express = require('express');
const router = express.Router();
const rouvoService = require('../services/rouvoService');
const superbetService = require('../services/superbetService');
const supabase = require('../Supabaseclient');

// Middleware: require auth token (เหมือน cart_router.js / addresses_router.js)
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อน' });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: 'เซสชันหมดอายุ' });

  req.user = data.user;
  next();
}

/**
 * @swagger
 * /integrations/rouvo/order:
 *   post:
 *     summary: สร้างคำสั่งซื้อใน Rouvo CRM (proxy ผ่าน backend เพื่อไม่ expose API key)
 *     security:
 *       - bearerAuth: []
 *     tags: [Integrations]
 */
router.post('/integrations/rouvo/order', requireAuth, async (req, res) => {
  const result = await rouvoService.createOrder(req.body || {});
  res.json(result);
});

/**
 * @swagger
 * /integrations/superbet/tracking:
 *   post:
 *     summary: สร้างเลข tracking กับ Superbet (proxy)
 *     security:
 *       - bearerAuth: []
 *     tags: [Integrations]
 */
router.post('/integrations/superbet/tracking', requireAuth, async (req, res) => {
  const result = await superbetService.createTracking(req.body || {});
  res.json(result);
});

/**
 * @swagger
 * /integrations/superbet/status/{trackingNumber}:
 *   get:
 *     summary: ดึงสถานะพัสดุจาก Superbet (proxy)
 *     security:
 *       - bearerAuth: []
 *     tags: [Integrations]
 *     parameters:
 *       - in: path
 *         name: trackingNumber
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/integrations/superbet/status/:trackingNumber', requireAuth, async (req, res) => {
  const result = await superbetService.getStatus(req.params.trackingNumber);
  res.json(result);
});

module.exports = router;
