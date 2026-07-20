import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminLayout({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAccess = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;

      if (!sessionUser) {
        window.location.href = "/admin/login";
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", sessionUser.id)
        .single();

      if (!active) return;

      if (profileError || profile.role !== "admin") {
        window.location.href = "/admin/login";
        return;
      }

      setIsAdmin(true);
      setChecking(false);
    };

    checkAccess();
    return () => { active = false; };
  }, []);

  if (checking) {
    return <p style={{ textAlign: "center", padding: "4rem" }}>กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...</p>;
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}