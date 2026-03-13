import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Announcement {
  id: string;
  title: string;
  mountain_name: string | null;
  date: string;
  description: string;
  full_description: string;
  category: string;
  alert_type: string;
  severity: string;
  source: string | null;
  is_active: boolean;
  created_at: string;
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements" as any)
      .select("*")
      .eq("is_active", true)
      .order("date", { ascending: false })
      .limit(50);

    if (!error && data) {
      setAnnouncements(data as unknown as Announcement[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return { announcements, loading, refetch: fetchAnnouncements };
}
