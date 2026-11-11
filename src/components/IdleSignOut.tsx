import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

// Shared laptops: sign out after 20 idle minutes, and always after 2 hours.
const IDLE_MS = 20 * 60_000;
const MAX_MS = 2 * 60 * 60_000;
const KEY = "scoutcode.signedInAt";

export function IdleSignOut() {
  const qc = useQueryClient();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const out = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      await qc.cancelQueries();
      qc.clear();
      localStorage.removeItem(KEY);
      await supabase.auth.signOut();
      window.location.assign("/?expired=1");
    };
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(out, IDLE_MS);
      const at = Number(localStorage.getItem(KEY) || 0);
      if (at && Date.now() - at > MAX_MS) out();
    };
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [qc]);
  return null;
}

export function markSignedIn() {
  localStorage.setItem(KEY, String(Date.now()));
}