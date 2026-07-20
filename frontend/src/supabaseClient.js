/**
 * supabaseClient.js — Supabase client สำหรับ Frontend (ESM)
 *
 * โปรเจกต์นี้ใช้ระบบข้อมูลจำลอง (mock) เป็นหลักในโหมด development
 * เนื่องจาก backend/frontend แยกกันทำงาน
 *
 * ถ้าต้องการเชื่อมต่อ Supabase จริง ให้ตั้งค่า VITE_SUPABASE_URL
 * และ VITE_SUPABASE_ANON_KEY ใน .env ของ frontend
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let _supabaseInstance = null;

// ถ้ามี environment variables ให้เชื่อมต่อจริง
if (supabaseUrl && supabaseAnonKey) {
  _supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * getSupabase() — ส่งคืน Supabase client
 * ถ้าไม่มี config จะคืนค่า mock object ที่เลียนแบบ auth methods
 */
export function getSupabase() {
  if (_supabaseInstance) return _supabaseInstance;

  // Mock Supabase client — ใช้สำหรับ dev/demo
  return {
    auth: {
      getSession: async () => {
        const raw = window.localStorage.getItem('mv_mock_session');
        const session = raw ? JSON.parse(raw) : null;
        return { data: { session }, error: null };
      },
      signInWithOAuth: async ({ provider, options }) => {
        // Mock: จำลอง Google login
        console.log(`[Mock Supabase] signInWithOAuth: ${provider}`, options);

        // สร้าง session จำลอง (เฉพาะ admin)
        const mockUser = {
          id: 'mock-user-001',
          email: 'admin@maisonvera.com',
          user_metadata: {
            full_name: 'Admin Maison Véra',
            avatar_url: 'https://placehold.co/100x100/ad8a55/fff?text=A',
            name: 'Admin Maison Véra',
          },
        };

        const mockSession = {
          access_token: 'mock_token_' + Date.now(),
          user: mockUser,
        };

        window.localStorage.setItem('mv_mock_session', JSON.stringify(mockSession));

        // จำลอง redirect ไป callback
        const redirectTo = options?.redirectTo || `${window.location.origin}/auth/callback`;
        window.location.href = redirectTo;

        return { data: { url: redirectTo }, error: null };
      },
      signOut: async () => {
        window.localStorage.removeItem('mv_mock_session');
        return { error: null };
      },
    },
  };
}

/**
 * ส่งออก client instance โดยตรง
 * สำหรับ component ที่ import แล้วใช้ทันที
 */
export const supabase = getSupabase();

export default supabase;

