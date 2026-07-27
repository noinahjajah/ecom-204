const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

/**
 * @swagger
 * /login:
 *   post:
 *     summary: ล็อกอินด้วยอีเมล/รหัสผ่านผ่าน Supabase Auth
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: ล็อกอินสำเร็จ คืน user และ session
 *       400:
 *         description: กรอกข้อมูลไม่ครบ
 *       401:
 *         description: อีเมลหรือรหัสผ่านไม่ถูกต้อง
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    return res.status(200).json({
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่ภายหลัง' });
  }
});

/**
 * @swagger
 * /login/google:
 *   post:
 *     summary: ขอ URL สำหรับ redirect ไปหน้า Google OAuth
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               redirectTo:
 *                 type: string
 *                 description: URL ที่จะให้ Supabase ส่งผู้ใช้กลับมาหลังลอกอินสำเร็จ
 *     responses:
 *       200:
 *         description: คืน URL สำหรับ redirect ไป Google OAuth
 *       500:
 *         description: ไม่สามารถเชื่อมต่อ Google ได้
 */
router.post('/login/google', async (req, res) => {
  const { redirectTo } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || undefined,
        skipBrowserRedirect: true, // ให้ backend คืน URL กลับไปแทนที่จะ redirect เอง
      },
    });

    if (error) {
      return res.status(500).json({ error: 'ไม่สามารถเชื่อมต่อ Google ได้' });
    }

    // ส่ง URL กลับไปให้ frontend ทำการ redirect เอง (window.location.href = url)
    return res.status(200).json({ url: data.url });
  } catch (err) {
    console.error('Google login error:', err.message);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่ภายหลัง' });
  }
});

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: ออกจากระบบ
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: ออกจากระบบสำเร็จ
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return res.status(200).json({ message: 'ออกจากระบบสำเร็จ' });
  } catch (err) {
    console.error('Logout error:', err.message);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;