// 📄 backend/routes/cards_router.js
// Saved card REST API endpoints

const express = require('express');
const router = express.Router();
const cardsService = require('../services/cardsService');
const supabase = require('../Supabaseclient');

// Middleware: require auth token (เหมือน cart_router.js / addresses_router.js / orders_router.js)
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
 * /cards:
 *   get:
 *     summary: ดึงรายการบัตรที่บันทึกไว้ของผู้ใช้
 *     security:
 *       - bearerAuth: []
 *     tags: [Cards]
 */
router.get('/cards', requireAuth, async (req, res) => {
  try {
    const cards = await cardsService.getCards(req.supabase, req.user.id);
    res.json(cards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'ดึงบัตรที่บันทึกไว้ไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /cards:
 *   post:
 *     summary: บันทึกบัตรใหม่
 *     security:
 *       - bearerAuth: []
 *     tags: [Cards]
 */
router.post('/cards', requireAuth, async (req, res) => {
  try {
    const card = await cardsService.addCard(req.supabase, req.user.id, req.body || {});
    res.json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'บันทึกบัตรไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /cards/:id:
 *   delete:
 *     summary: ลบบัตรที่บันทึกไว้
 *     security:
 *       - bearerAuth: []
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/cards/:id', requireAuth, async (req, res) => {
  try {
    await cardsService.removeCard(req.supabase, req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'ลบบัตรไม่สำเร็จ' });
  }
});

module.exports = router;
