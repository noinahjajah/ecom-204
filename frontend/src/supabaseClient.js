/**
 * supabaseClient.js — Supabase client สำหรับ Frontend (ESM)
 *
 * โปรเจกต์นี้ใช้ Supabase เป็น Backend-as-a-Service สำหรับ Authentication
 * 
 * ตั้งค่า VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ใน .env ของ frontend
 * (ดูตัวอย่างได้จาก .env.example)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let _supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey) {
  _supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/**
 * getSupabase() — ส่งคืน Supabase client
 * ถ้าไม่มี config จะคืนค่า mock object (สำหรับ dev/demo เท่านั้น)
 */
export function getSupabase() {
  if (_supabaseInstance) return _supabaseInstance;

  // Fallback: แสดงข้อความเตือนและคืนค่า mock ที่จำกัดมาก
  console.warn(
    '[Supabase] กำลังใช้ Mock mode — กรุณาตั้งค่า .env เพื่อเชื่อมต่อจริง\n' +
    'VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY'
  );

  return {
    auth: {
      getSession: async () => {
        const raw = window.localStorage.getItem('mv_mock_session');
        const session = raw ? JSON.parse(raw) : null;
        return { data: { session }, error: null };
      },
      signInWithOAuth: async ({ provider, options }) => {
        console.log(`[Mock Supabase] signInWithOAuth: ${provider}`, options);

        // Mock mode: ใช้ email admin เป็นค่าเริ่มต้น (สะดวกต่อการทดสอบ)
        // หรือสามารถส่ง mock email ผ่าน queryParams.email ได้
        const email = options?.queryParams?.email || 'admin@maisonvera.com';
        const name = options?.queryParams?.name || 'Admin Maison Véra';

        const mockUser = {
          id: 'mock-user-' + Date.now(),
          email: email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            full_name: name,
            avatar_url: 'https://placehold.co/100x100/ad8a55/fff?text=MV',
            name: name,
          },
          app_metadata: { provider: 'google', role: email === 'admin@maisonvera.com' ? 'admin' : 'user' },
        };

        const mockSession = {
          access_token: 'mock_token_' + Date.now(),
          token_type: 'bearer',
          expires_in: 86400,
          user: mockUser,
        };

        window.localStorage.setItem('mv_mock_session', JSON.stringify(mockSession));

        // เพิ่ม ?mock=1 เพื่อให้ AuthCallback.jsx รู้ว่าเป็น Mock mode
        const baseRedirect = options?.redirectTo || `${window.location.origin}/auth/callback`;
        const separator = baseRedirect.includes('?') ? '&' : '?';
        const redirectTo = `${baseRedirect}${separator}mock=1`;
        
        console.log('[Mock Supabase] Redirecting to:', redirectTo);
        
        // จำลอง Google OAuth redirect โดยส่ง session ใน localStorage
        window.location.href = redirectTo;

        return { data: { url: redirectTo }, error: null };
      },
      signUp: async ({ email, password, options }) => {
        console.log('[Mock Supabase] signUp:', email);

        const mockUser = {
          id: 'mock-user-' + Date.now(),
          email: email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            full_name: options?.data?.full_name || email,
            name: options?.data?.full_name || email,
          },
          app_metadata: { provider: 'email' },
        };

        const mockSession = {
          access_token: 'mock_token_' + Date.now(),
          token_type: 'bearer',
          expires_in: 86400,
          user: mockUser,
        };

        window.localStorage.setItem('mv_mock_session', JSON.stringify(mockSession));

        return { data: { user: mockUser, session: mockSession }, error: null };
      },
      signInWithPassword: async ({ email, password }) => {
        console.log('[Mock Supabase] signInWithPassword:', email);

        if (!email || !email.includes('@')) {
          return { data: { user: null, session: null }, error: { message: 'Invalid email' } };
        }

        const mockUser = {
          id: 'mock-user-' + Date.now(),
          email: email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            full_name: email.split('@')[0],
            name: email.split('@')[0],
          },
          app_metadata: { provider: 'email' },
        };

        const mockSession = {
          access_token: 'mock_token_' + Date.now(),
          token_type: 'bearer',
          expires_in: 86400,
          user: mockUser,
        };

        window.localStorage.setItem('mv_mock_session', JSON.stringify(mockSession));

        return { data: { user: mockUser, session: mockSession }, error: null };
      },
      signOut: async () => {
        window.localStorage.removeItem('mv_mock_session');
        return { error: null };
      },
      onAuthStateChange: (callback) => {
        const raw = window.localStorage.getItem('mv_mock_session');
        const session = raw ? JSON.parse(raw) : null;
        setTimeout(() => {
          callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
        }, 0);
        return { data: { subscription: { unsubscribe: () => {} } } };
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

