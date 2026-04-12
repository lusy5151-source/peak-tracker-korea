

## AuthPage.tsx 긴급 복구 계획

### 수정 내용

**파일: `src/pages/AuthPage.tsx`**

1. **import 추가**: 파일 상단에 `import { lovable } from "@/integrations/lovable";` 추가
2. **handleGoogleLogin 교체**: 현재 `supabase.auth.signInWithOAuth` 방식을 `lovable.auth.signInWithOAuth("google")` 방식으로 되돌림

### 변경 코드

```ts
// import 추가
import { lovable } from "@/integrations/lovable";

// handleGoogleLogin 교체
const handleGoogleLogin = async () => {
  setLoading(true);
  try {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: "https://wandeung.com",
    });
    if (result.error) throw result.error;
    if (result.redirected) return;
    navigate("/");
  } catch (err: any) {
    toast({ title: "오류", description: friendlyError(err.message), variant: "destructive" });
  } finally {
    setLoading(false);
  }
};
```

수정 후 즉시 배포합니다.

