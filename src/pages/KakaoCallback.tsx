import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mountain, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const KakaoCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("인증 코드가 없습니다.");
      return;
    }

    const handleKakaoCallback = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("kakao-auth", {
          body: { code },
        });

        if (fnError) throw fnError;

        if (data?.session) {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
          navigate("/", { replace: true });
        } else {
          throw new Error(data?.error || "카카오 로그인에 실패했습니다.");
        }
      } catch (err: any) {
        console.error("Kakao callback error:", err);
        setError(err.message || "카카오 로그인 처리 중 오류가 발생했습니다.");
        toast({
          title: "로그인 실패",
          description: err.message || "카카오 로그인에 실패했습니다.",
          variant: "destructive",
        });
      }
    };

    handleKakaoCallback();
  }, [searchParams, navigate, toast]);

  if (error) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <Mountain className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">로그인 실패</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate("/auth", { replace: true })}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">카카오 로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default KakaoCallback;
