require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('ขาด SUPABASE_URL หรือ SUPABASE_ANON_KEY ใน .env');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;