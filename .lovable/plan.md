
긴급 복구 계획:

1. `src/contexts/AuthContext.tsx`를 요청하신 단순 세션 기반 버전으로 교체합니다.
   - 초기 마운트 시 `supabase.auth.getSession()`으로 세션을 가져오고
   - `onAuthStateChange`로 로그인/로그아웃 변화를 반영하고
   - `loading`을 두 군데 모두에서 반드시 `false`로 내려 무한 로딩을 끊습니다.
   - `signOut()`도 단순하게 `supabase.auth.signOut()` 후 `/auth`로 이동하도록 맞춥니다.

2. 동시에 `src/pages/AuthPage.tsx`를 최소 보정합니다.
   - 현재 이 파일은 `const { syncProfile } = useAuth();`를 사용하고 있어서,
     `AuthContext`를 요청하신 코드로 “완전 교체”하면 즉시 타입/런타임 불일치가 생길 수 있습니다.
   - 따라서 가장 작은 범위로:
     - `useAuth()`에서 `syncProfile` 구조분해를 제거하고
     - Google 로그인 성공 후 호출하는 `syncProfile(user)` 라인을 제거합니다.
   - 이유: 새 `AuthContext` 인터페이스에는 `syncProfile`이 없기 때문입니다.

3. `src/App.tsx`는 현재 확인 결과 `ProtectedRoute`가 이미 `user, loading`만 사용하고 있어 추가 수정 없이 유지합니다.
   - 즉, 이번 복구는 주로 `AuthContext` 단순화 + `AuthPage` 호환성 정리입니다.

4. 적용 후 즉시 배포합니다.
   - 배포 후 확인 포인트:
     - `/profile` 진입 시 “인증 확인 중...” 무한 로딩 해소
     - 로그인 후 `/` 또는 보호 라우트 접근 가능
     - 로그아웃 시 `/auth`로 정상 이동
     - `/auth`에서 Google 로그인 버튼 클릭 시 최소한 화면이 깨지지 않고 흐름이 정상 진행

기술 메모:
- 현재 코드베이스 기준으로 `App.tsx`의 `isReady` 문제는 이미 사라졌습니다.
- 지금 더 큰 실제 위험은 `AuthContext`를 단순 버전으로 되돌리면서 `AuthPage`가 아직 `syncProfile`을 참조하는 점입니다.
- 그래서 “AuthContext만 교체”하면 복구가 아니라 새 오류를 만들 가능성이 큽니다.
- 가장 안전한 긴급 복구는:
  - `AuthContext`를 단순 세션 리스너 패턴으로 교체
  - `AuthPage`의 `syncProfile` 의존 제거
- 이후 안정화가 끝나면 필요 시 별도 단계에서 프로필 동기화를 다시 도입할 수 있습니다.
