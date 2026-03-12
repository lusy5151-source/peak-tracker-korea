import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const KakaoCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogin = async () => {
      const hash = window.location.hash;

      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (error) {
        console.error("카카오 로그인 실패", error);
        return;
      }

      navigate("/");
    };

    handleLogin();
  }, []);

  return <p>카카오 로그인 처리중...</p>;
};

export default KakaoCallback;
