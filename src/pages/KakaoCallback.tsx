import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const KakaoCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const kakaoLogin = async () => {
      const code = new URL(window.location.href).searchParams.get("code");

      if (!code) return;

      const tokenRes = await fetch(
        "https://kauth.kakao.com/oauth/token",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded;charset=utf-8",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: "여기에_카카오_REST_API_KEY",
            redirect_uri:
              "https://peak-tracker-korea.lovable.app/kakao/callback",
            code: code!,
          }),
        }
      );

      const token = await tokenRes.json();

      const userRes = await fetch(
        "https://kapi.kakao.com/v2/user/me",
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );

      const user = await userRes.json();

      const email =
        user.kakao_account?.email || `${user.id}@kakao.user`;

      const password = String(user.id);

      await supabase.auth.signUp({
        email,
        password,
      });

      await supabase.auth.signInWithPassword({
        email,
        password,
      });

      navigate("/");
    };

    kakaoLogin();
  }, []);

  return <p>카카오 로그인 처리중...</p>;
};

export default KakaoCallback;
