import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AdminLayout() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    
    const checkAccess = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;

      if (!sessionUser) {
        navigate("/admin/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", sessionUser.id)
        .single();

      if (!active) return;

      if (profileError || profile.role !== "admin") {
        navigate("/admin/login");
        return;
      }

      setIsAdmin(true);
      setChecking(false);
    };

    checkAccess();
    return () => { active = false; };
  }, [navigate]);

  if (checking) {
    return <p style={{ textAlign: "center", padding: "4rem" }}>กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...</p>;
  }

  // ถ้าเช็คสิทธิ์ผ่านแล้ว จะทำการ Render Component ลูกที่อยู่ข้างใน (เช่น AdminDashboard) ผ่าน <Outlet />
  return (
    <>
      <Outlet />
    </>
  );
}