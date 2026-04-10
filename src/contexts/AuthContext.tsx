import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  syncProfile: (u: User) => Promise<void>;
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

  const syncProfile = useCallback(async (u: User) => {
    try {
      await supabase.from('profiles').upsert({
        user_id: u.id,
        email: u.email,
        nickname: u.user_metadata?.full_name || u.email?.split('@')[0] || '사용자',
        avatar_url: u.user_metadata?.avatar_url || null,
        provider: u.app_metadata?.provider || 'email',
      }, { onConflict: 'user_id' });
    } catch (e) {
      console.warn('Profile sync failed:', e);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1. Listen for auth state changes (works for email login & when setSession is called)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if ((_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') && session?.user) {
        await syncProfile(session.user);
      }
    });

    // 2. Initial session check via getSession (cached/localStorage)
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await syncProfile(session.user);
          }
        }
      } catch (e) {
        console.warn('getSession failed:', e);
      }

      // 3. Fallback: getUser() as authoritative server-side check
      // This catches cases where Lovable Cloud Auth set cookies but
      // onAuthStateChange didn't fire and getSession returned null
      try {
        const { data: { user: serverUser } } = await supabase.auth.getUser();
        if (mounted && serverUser) {
          if (!session) {
            // We have a server-side user but no client session
            // This means Lovable Cloud Auth proxy is providing auth
            setUser(serverUser);
            await syncProfile(serverUser);
          }
        }
      } catch (e) {
        // getUser failed - no valid session
      }

      if (mounted) {
        setLoading(false);
      }
    };

    initSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncProfile]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (e) {
      // ignore signOut errors
    }
    // Clear all local storage to remove any cached auth tokens
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
