import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

// Admin emails ที่อนุญาต (สำหรับ mock mode)
const MOCK_ADMIN_EMAILS = ["admin@maisonvera.com"];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (!error && data.session) {
        const s = data.session;
        setSession(s);
        setUser(s.user);
        setIsAdmin(checkIsAdmin(s.user.email));
      }
      setLoading(false);
    });
  }, []);

  function checkIsAdmin(email) {
    return MOCK_ADMIN_EMAILS.includes(email || "");
  }

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
        setIsAdmin(checkIsAdmin(s.user.email));
      } else {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
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

