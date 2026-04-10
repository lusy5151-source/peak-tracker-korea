

## 문제 근본 원인 분석

### 세션 관리 충돌 구조

```text
Google OAuth (redirect 흐름):
  1. lovable.auth.signInWithOAuth("google") → 브라우저 리디렉트
  2. Google → Lovable 프록시 (/~oauth/callback) → 쿠키에 토큰 저장
  3. 앱 새로 로드 → lovable/index.ts의 setSession()은 실행되지 않음
     (redirect 흐름에서는 result.redirected=true로 early return)
  4. supabase.auth.getSession() → null (localStorage 비어있음)
  5. supabase.auth.getUser() → 성공 (프록시가 쿠키의 JWT를 헤더에 추가)
  6. 하지만 supabase.from('profiles').upsert() → RLS 실패 가능
     (Supabase JS 클라이언트가 Authorization 헤더에 anon key만 보냄)
```

핵심: `lovable/index.ts`에서 `supabase.auth.setSession(result.tokens)`는 **non-redirect 흐름에서만** 실행됨. redirect 후 앱이 새로 로드될 때는 실행되지 않아 localStorage에 세션이 없음.

---

## 해결 계획

### Step 1: AuthContext에 `isReady` 게이트 추가

`loading` 외에 `isReady` 상태를 추가하여 인증 상태가 완전히 확정되기 전까지 보호된 쿼리가 실행되지 않도록 함.

- `getSession()` → `getUser()` 순서로 체크
- `getUser()`가 유저를 반환하면 `user` 상태 설정
- 모든 체크 완료 후 `isReady = true`

### Step 2: 세션 복구 시도 로직

`getUser()` 성공 + `getSession()` null인 경우 (쿠키 기반 인증):
- `supabase.auth.setSession()`을 호출할 수 있는 토큰이 없으므로, **프록시 경유 API 호출에 의존**
- Supabase 프록시가 모든 요청에 쿠키 JWT를 추가하므로, 실제 데이터 쿼리는 작동해야 함
- 프로필 동기화는 **edge function**으로 대체하여 service_role로 RLS 우회

### Step 3: 프로필 동기화 edge function 생성

`sync-profile`이라는 edge function을 생성:
- 프록시가 쿠키의 JWT를 전달하므로 사용자 인증 가능
- Service role key로 profiles 테이블에 upsert
- AuthContext에서 직접 upsert 대신 이 함수 호출

```text
Client (쿠키 인증) → Edge Function → service_role로 profiles upsert
```

### Step 4: AuthContext.tsx 재작성

- `syncProfile`: edge function `sync-profile` 호출로 변경
- `initSession`: `getSession()` → `getUser()` 순서 유지, `isReady` 게이트 추가
- `onAuthStateChange`: 기존 유지 (이메일 로그인 등 localStorage 기반 흐름 지원)
- `signOut`: 현재 로직 유지 (localStorage/sessionStorage 클리어 + redirect)

### Step 5: ProtectedRoute 및 hooks에 isReady 게이트 적용

- `ProtectedRoute`에서 `isReady`가 false이면 로딩 표시
- 주요 hooks (`useProfile`, `useAchievementStore` 등)에서 `user`가 null이면 쿼리 스킵 (이미 대부분 적용됨)

---

## 변경 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `supabase/functions/sync-profile/index.ts` | 신규 - service_role로 profiles upsert |
| `src/contexts/AuthContext.tsx` | isReady 추가, syncProfile을 edge function 호출로 변경 |
| `src/App.tsx` | ProtectedRoute에서 isReady 체크 추가 |

### 변경하지 않는 파일
- `src/integrations/lovable/index.ts` (자동 생성 파일)
- `src/integrations/supabase/client.ts` (자동 생성 파일)
- 기존 hooks (이미 `user` 기반으로 쿼리 게이팅됨)

