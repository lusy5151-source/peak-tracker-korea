import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isReady: boolean;
  signOut: () => Promise<void>;
  syncProfile: (u: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isReady: false,
  signOut: async () => {},
  syncProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Sync profile via edge function (service_role bypasses RLS)
  const syncProfile = useCallback(async (u: User) => {
    try {
      await supabase.functions.invoke('sync-profile', {
        body: {},
      });
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

    // 2. Initial session check
    const initSession = async () => {
      let resolvedUser: User | null = null;

      // Step A: Try getSession (localStorage-based, works for email/password login)
      try {
        const { data: { session: localSession } } = await supabase.auth.getSession();
        if (localSession?.user) {
          if (mounted) {
            setSession(localSession);
            setUser(localSession.user);
            resolvedUser = localSession.user;
          }
        }
      } catch (e) {
        console.warn('getSession failed:', e);
      }

      // Step B: If no local session, try getUser() (cookie-based via Lovable proxy)
      if (!resolvedUser) {
        try {
          const { data: { user: serverUser } } = await supabase.auth.getUser();
          if (mounted && serverUser) {
            setUser(serverUser);
            resolvedUser = serverUser;
          }
        } catch (e) {
          // No valid session at all
        }
      }

      // Step C: Sync profile if we resolved a user
      if (resolvedUser) {
        await syncProfile(resolvedUser);
      }

      // Step D: Mark auth as fully resolved
      if (mounted) {
        setLoading(false);
        setIsReady(true);
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
    try { localStorage.clear(); } catch (e) {}
    try { sessionStorage.clear(); } catch (e) {}
    setSession(null);
    setUser(null);
    setLoading(false);
    setIsReady(true);
    window.location.replace('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isReady, signOut, syncProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
