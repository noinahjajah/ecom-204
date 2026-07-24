require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('ขาด SUPABASE_URL หรือ SUPABASE_ANON_KEY ใน .env');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// สร้าง client ที่ผูกกับ JWT ของผู้ใช้ เพื่อให้ auth.uid() ใน RLS policy ทำงานถูกต้อง
function createUserClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

module.exports = supabase;
module.exports.createUserClient = createUserClient;