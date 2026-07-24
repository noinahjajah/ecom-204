// 📄 backend/routes/addresses_router.js
// Saved shipping address REST API endpoints

const express = require('express');
const router = express.Router();
const addressesService = require('../services/addressesService');
const supabase = require('../Supabaseclient');

// Middleware: require auth token (เหมือน cart_router.js)
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
 * /addresses:
 *   get:
 *     summary: ดึงรายการที่อยู่จัดส่งที่บันทึกไว้ของผู้ใช้
 *     security:
 *       - bearerAuth: []
 *     tags: [Addresses]
 */
router.get('/addresses', requireAuth, async (req, res) => {
  try {
    const addresses = await addressesService.getAddresses(req.supabase, req.user.id);
    res.json(addresses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'ดึงที่อยู่ไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: เพิ่มที่อยู่จัดส่งใหม่
 *     security:
 *       - bearerAuth: []
 *     tags: [Addresses]
 */
router.post('/addresses', requireAuth, async (req, res) => {
  try {
    const address = await addressesService.upsertAddress(req.supabase, req.user.id, req.body || {});
    res.json(address);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'บันทึกที่อยู่ไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /addresses/:id:
 *   patch:
 *     summary: แก้ไขที่อยู่จัดส่งที่บันทึกไว้
 *     security:
 *       - bearerAuth: []
 *     tags: [Addresses]
 */
router.patch('/addresses/:id', requireAuth, async (req, res) => {
  try {
    const address = await addressesService.upsertAddress(req.supabase, req.user.id, {
      ...req.body,
      id: req.params.id,
    });
    res.json(address);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'แก้ไขที่อยู่ไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /addresses/:id/default:
 *   patch:
 *     summary: ตั้งที่อยู่นี้เป็นที่อยู่เริ่มต้น
 *     security:
 *       - bearerAuth: []
 *     tags: [Addresses]
 */
router.patch('/addresses/:id/default', requireAuth, async (req, res) => {
  try {
    const address = await addressesService.setDefaultAddress(req.supabase, req.user.id, req.params.id);
    res.json(address);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'ตั้งค่าที่อยู่เริ่มต้นไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /addresses/:id:
 *   delete:
 *     summary: ลบที่อยู่จัดส่งที่บันทึกไว้
 *     security:
 *       - bearerAuth: []
 *     tags: [Addresses]
 */
router.delete('/addresses/:id', requireAuth, async (req, res) => {
  try {
    await addressesService.removeAddress(req.supabase, req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'ลบที่อยู่ไม่สำเร็จ' });
  }
});

module.exports = router;
