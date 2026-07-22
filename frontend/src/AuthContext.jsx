import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * ตรวจสอบว่า email นี้เป็น Admin หรือไม่
   * สามารถปรับเปลี่ยนเป็นตรวจสอบจาก roles table ใน Supabase ได้
   */
  async function checkIsAdmin(email) {
    if (!email) return false;

    // ถ้าเชื่อมต่อ Supabase จริง ให้ตรวจสอบจาก database
    if (import.meta.env.VITE_SUPABASE_URL) {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('email', email)
          .single();

        if (!error && data) {
          return data.role === 'admin';
        }
      } catch (e) {
        console.warn('Admin check via DB failed, falling back to email list');
      }
    }

    // Fallback: ตรวจสอบจากรายการอีเมล admin ที่กำหนดไว้
    const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "admin@maisonvera.com")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    return adminEmails.includes(email.toLowerCase());
  }

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // 1. ตรวจสอบ session ปัจจุบัน
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!error && data?.session) {
        const s = data.session;
        setSession(s);
        setUser(s.user);
        const admin = await checkIsAdmin(s.user.email);
        if (mounted) setIsAdmin(admin);
      } else {
        // ลองตรวจสอบ mock session ใน localStorage (สำหรับ dev mode ที่ไม่มี Supabase)
        try {
          const raw = window.localStorage.getItem('mv_mock_session');
          if (raw) {
            const s = JSON.parse(raw);
            if (s?.user) {
              setSession(s);
              setUser(s.user);
              const admin = await checkIsAdmin(s.user.email);
              if (mounted) setIsAdmin(admin);
            }
          }
        } catch (e) {
          console.warn('[Auth] Mock session parse error:', e);
        }
      }

      if (mounted) setLoading(false);
    }

    initAuth();

    // 2. ฟังการเปลี่ยนแปลงของ auth state (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        console.log('[Auth] onAuthStateChange:', event, session?.user?.email);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const admin = await checkIsAdmin(session.user.email);
          if (mounted) setIsAdmin(admin);
        } else {
          // เช็คว่ามี mock session ไหม
          try {
            const raw = window.localStorage.getItem('mv_mock_session');
            if (raw) {
              const s = JSON.parse(raw);
              if (s?.user) {
                setSession(s);
                setUser(s.user);
                const admin = await checkIsAdmin(s.user.email);
                if (mounted) setIsAdmin(admin);
                if (mounted) setLoading(false);
                return;
              }
            }
          } catch (e) {
            // ignore
          }
          if (mounted) setIsAdmin(false);
        }

        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  }

  function refreshSession() {
    return supabase.auth.getSession().then(({ data, error }) => {
      if (!error && data.session) {
        const s = data.session;
        setSession(s);
        setUser(s.user);
        checkIsAdmin(s.user.email).then(setIsAdmin);
        return true;
      } else {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        return false;
      }
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export default AuthContext;

