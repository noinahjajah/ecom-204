const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

/**
 * POST /api/login
 * body: { email, password }
 * ล็อกอินด้วยอีเมล/รหัสผ่านผ่าน Supabase Auth
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
 * POST /api/register
 * body: { email, password, full_name }
 * สมัครสมาชิกใหม่ด้วยอีเมล/รหัสผ่านผ่าน Supabase Auth
 */
router.post('/register', async (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || email.split('@')[0],
          name: full_name || email.split('@')[0],
        },
      },
    });

    if (error) {
      console.error('Register error:', error.message);
      if (error.message.includes('already registered')) {
        return res.status(409).json({ error: 'อีเมลนี้ลงทะเบียนไปแล้ว กรุณาเข้าสู่ระบบ' });
      }
      if (error.message.includes('password')) {
        return res.status(400).json({ error: 'รหัสผ่านไม่ปลอดภัย กรุณาใช้รหัสผ่านที่รัดกุมยิ่งขึ้น' });
      }
      return res.status(500).json({ error: 'ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่ภายหลัง' });
    }

    return res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ',
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่ภายหลัง' });
  }
});

/**
 * POST /api/login/admin
 * body: { email, password }
 * ล็อกอิน Admin โดยใช้รหัสผ่านเฉพาะ
 * รหัสผ่านเริ่มต้น: admin123 (ตั้งค่าใน .env: ADMIN_SECRET_PASSWORD)
 * อีเมล Admin เริ่มต้น: admin@maisonvera.com (ตั้งค่าใน .env: ADMIN_EMAILS)
 */
router.post('/login/admin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }

  // ตรวจสอบว่าอีเมลนี้เป็น Admin หรือไม่
  const adminEmails = (process.env.ADMIN_EMAILS || "admin@maisonvera.com")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  if (!adminEmails.includes(email.toLowerCase())) {
    return res.status(403).json({ error: 'อีเมลนี้ไม่มีสิทธิ์เข้าใช้งานระบบ Admin' });
  }

  // ตรวจสอบรหัสผ่าน Admin
  const adminPassword = process.env.ADMIN_SECRET_PASSWORD || "admin123";

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'รหัสผ่าน Admin ไม่ถูกต้อง' });
  }

  // สร้าง session สำหรับ Admin
  const adminUser = {
    id: 'admin-' + Date.now(),
    email: email,
    email_confirmed_at: new Date().toISOString(),
    user_metadata: { full_name: 'Admin Maison Véra', name: 'Admin Maison Véra' },
    app_metadata: { provider: 'email', role: 'admin' },
  };

  const adminSession = {
    access_token: 'admin_token_' + Date.now(),
    token_type: 'bearer',
    expires_in: 86400,
    user: adminUser,
  };

  return res.status(200).json({
    message: 'เข้าสู่ระบบ Admin สำเร็จ',
    user: adminUser,
    session: adminSession,
  });
});

/**
 * POST /api/login/google
 * ขอ URL สำหรับ redirect ไปหน้า Google OAuth
 */
router.post('/login/google', async (req, res) => {
  const { redirectTo } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || undefined,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      return res.status(500).json({ error: 'ไม่สามารถเชื่อมต่อ Google ได้' });
    }

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
