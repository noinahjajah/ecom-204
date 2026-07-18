import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function AuthHeaderIcon() {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        setAvatarUrl(user.user_metadata?.avatar_url || user.user_metadata?.picture || null);
      }
      setChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setAvatarUrl(user ? (user.user_metadata?.avatar_url || user.user_metadata?.picture || null) : null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!checked) {
    return <span className="icon-btn" style={{ width: 19, height: 19, display: "inline-block" }} />;
  }

  if (avatarUrl) {
    return (
      <a href="/account" aria-label="บัญชีของฉัน">
        <img
          src={avatarUrl}
          alt="บัญชีของฉัน"
          style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", display: "block" }}
        />
      </a>
    );
  }

  return (
    <a className="icon-btn" aria-label="บัญชีของฉัน" href="/login">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    </a>
  );
}