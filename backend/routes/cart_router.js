// 📄 backend/routes/cart_router.js
// Cart REST API endpoints

const express = require('express');
const router = express.Router();
const cartService = require('../services/cartService');
const supabase = require('../Supabaseclient');

// Middleware: require auth token
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
 * /cart:
 *   get:
 *     summary: ดึงตะกร้าสินค้าของผู้ใช้
 *     security:
 *       - bearerAuth: []
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: รายการสินค้าในตะกร้า
 */
router.get('/cart', requireAuth, async (req, res) => {
  try {
    const cart = await cartService.getCart(req.supabase, req.user.id);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'ดึงตะกร้าไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: เพิ่มสินค้าลงตะกร้า
 *     security:
 *       - bearerAuth: []
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               productName:
 *                 type: string
 *               category:
 *                 type: string
 *               variant:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               imageUrl:
 *                 type: string
 */
router.post('/cart', requireAuth, async (req, res) => {
  try {
    const { productId, productName, category, variant, price, quantity, imageUrl } = req.body;
    if (!productId || !productName || price === undefined || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const item = await cartService.addToCart(req.supabase, req.user.id, {
      productId,
      productName,
      category,
      variant,
      price,
      quantity,
      imageUrl,
    });

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'เพิ่มลงตะกร้าไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /cart/:id:
 *   patch:
 *     summary: อัปเดตจำนวนสินค้า
 *     security:
 *       - bearerAuth: []
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 */
router.patch('/cart/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const item = await cartService.updateQty(req.supabase, req.user.id, id, quantity);
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'อัปเดตตะกร้าไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /cart/:id:
 *   delete:
 *     summary: ลบสินค้าออกจากตะกร้า
 *     security:
 *       - bearerAuth: []
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/cart/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await cartService.removeFromCart(req.supabase, req.user.id, id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'ลบจากตะกร้าไม่สำเร็จ' });
  }
});

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: ลบสินค้าทั้งหมดออกจากตะกร้า
 *     security:
 *       - bearerAuth: []
 *     tags: [Cart]
 */
router.delete('/cart', requireAuth, async (req, res) => {
  try {
    await cartService.clearCart(req.supabase, req.user.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'ล้างตะกร้าไม่สำเร็จ' });
  }
});

module.exports = router;
