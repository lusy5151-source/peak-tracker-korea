import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncProfile = async (u: User) => {
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
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setTimeout(() => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }, 0);

      if ((_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') && session?.user) {
        const user = session.user;
        await supabase.from('profiles').upsert({
          user_id: user.id,
          email: user.email,
          nickname: user.user_metadata?.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || null,
          provider: user.app_metadata?.provider || 'email'
        }, { onConflict: 'user_id' });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) syncProfile(session.user);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
