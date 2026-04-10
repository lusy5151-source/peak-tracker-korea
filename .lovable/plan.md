
요청 내용을 기준으로 현재 `src/contexts/AuthContext.tsx`를 확인한 결과:

1. `syncProfile`은 이미 Edge Function 호출 방식이지만, 아직 사용하지 않는 인자 이름과 `body: {}`가 남아 있어 요청하신 “정확한 코드”와는 다릅니다.
2. `onAuthStateChange` 안에는 현재 직접 `upsert()` 코드는 없고, 이미 `await syncProfile(session.user)`를 호출하고 있습니다.
3. 따라서 실제 수정 범위는 `syncProfile` 함수만 요청하신 코드와 완전히 동일하게 맞추는 것입니다. 다른 로직은 건드릴 필요가 없습니다.

적용할 변경:

```tsx
const syncProfile = useCallback(async (_u?: User) => {
  try {
    const { error } = await supabase.functions.invoke('sync-profile');

    if (error) console.warn('sync-profile error:', error);
  } catch (e) {
    console.warn('Profile sync failed:', e);
  }
}, []);
```

유지할 부분:
- `onAuthStateChange` 내부의 `await syncProfile(session.user);`
- `initSession()` 내부의 `await syncProfile(resolvedUser);`
- 나머지 상태 관리(`user`, `session`, `loading`, `isReady`, `signOut`) 전부 그대로 유지

수정 후 파일 상태는 아래와 같아야 합니다:

```tsx
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
        await syncProfile(session.user);
      }
    });

    const initSession = async () => {
      let resolvedUser: User | null = null;

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

      if (!resolvedUser) {
        try {
          const { data: { user: serverUser } } = await supabase.auth.getUser();
          if (mounted && serverUser) {
            setUser(serverUser);
            resolvedUser = serverUser;
          }
        } catch (e) {
        }
      }

      if (resolvedUser) {
        await syncProfile(resolvedUser);
      }

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
```

실행 계획:
- `src/contexts/AuthContext.tsx`의 `syncProfile` 함수만 위 코드로 정확히 교체
- `onAuthStateChange`는 이미 `syncProfile()` 호출 형태라 그대로 유지
- 배포는 수정 적용 후 진행

기술 메모:
- 현재 문제는 “직접 upsert 호출”보다, `syncProfile` 구현이 요청하신 정확한 형태와 1:1로 일치하지 않는 점입니다.
- 특히 `body: {}` 제거, `const { error } = ...` 추가, `_u?: User` 시그니처 반영이 핵심입니다.
