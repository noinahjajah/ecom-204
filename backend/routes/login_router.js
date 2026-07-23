const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

/**
 * POST /api/login
 * body: { email, password }
 * ลอกอินด้วยอีเมล/รหัสผ่านผ่าน Supabase Auth
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
 * POST /api/login/google
 * ขอ URL สำหรับ redirect ไปหน้า Google OAuth
 * body: { redirectTo } (optional — URL ที่จะให้ Supabase ส่งผู้ใช้กลับมาหลังลอกอินสำเร็จ)
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
 * POST /api/logout
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