import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Calls the sync-profile edge function once per session after login.
 * Runs outside AuthContext so it never blocks auth loading.
 */
export function useProfileSync() {
  const { user } = useAuth();
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user || syncedRef.current === user.id) return;

    syncedRef.current = user.id;

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    if (!projectId) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) return;

      fetch(
        `https://${projectId}.supabase.co/functions/v1/sync-profile`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      ).catch((err) => console.warn("Profile sync failed (non-blocking):", err));
    });
  }, [user]);
}
