import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  syncProfile: (u?: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  syncProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const syncProfile = useCallback(async (_u?: User) => {
    try {
      const { error } = await supabase.functions.invoke('sync-profile');
      if (error) console.warn('sync-profile error:', error);
    } catch (e) {
      console.warn('Profile sync failed:', e);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if ((_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') && session?.user) {
        await syncProfile();
      }
    });

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) await syncProfile();
        }
      } catch (e) {
        console.warn('getSession failed:', e);
      }
      try {
        const { data: { user: serverUser } } = await supabase.auth.getUser();
        if (mounted && serverUser) {
          setUser(serverUser);
          await syncProfile();
        }
      } catch (e) {}
      if (mounted) setLoading(false);
    };

    initSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncProfile]);

  const signOut = async () => {
    try { await supabase.auth.signOut({ scope: 'local' }); } catch (e) {}
    try { localStorage.clear(); } catch (e) {}
    try { sessionStorage.clear(); } catch (e) {}
    setSession(null);
    setUser(null);
    setLoading(false);
    window.location.replace('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, syncProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
