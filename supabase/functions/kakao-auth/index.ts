import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, redirect_uri } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: "Authorization code is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const KAKAO_REST_API_KEY = Deno.env.get("KAKAO_REST_API_KEY");
    const KAKAO_CLIENT_SECRET = Deno.env.get("KAKAO_CLIENT_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!KAKAO_REST_API_KEY || !KAKAO_CLIENT_SECRET) {
      throw new Error("Kakao credentials not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    // 1. Exchange code for Kakao access token
    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: KAKAO_REST_API_KEY,
      client_secret: KAKAO_CLIENT_SECRET,
      redirect_uri: redirect_uri,
      code: code,
    });

    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("Kakao token error:", tokenData);
      return new Response(JSON.stringify({ error: "카카오 토큰 교환 실패", details: tokenData }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Get Kakao user profile
    const profileRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profileData = await profileRes.json();

    if (!profileRes.ok) {
      console.error("Kakao profile error:", profileData);
      return new Response(JSON.stringify({ error: "카카오 프로필 조회 실패" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const kakaoId = String(profileData.id);
    const kakaoAccount = profileData.kakao_account || {};
    const kakaoProfile = kakaoAccount.profile || {};
    const email = kakaoAccount.email || `kakao_${kakaoId}@kakao.local`;
    const nickname = kakaoProfile.nickname || `카카오사용자`;
    const avatarUrl = kakaoProfile.profile_image_url || null;

    // 3. Create or sign in user via Supabase Admin
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if user exists by email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    let user = existingUsers?.users?.find(
      (u) =>
        u.email === email ||
        u.user_metadata?.kakao_id === kakaoId
    );

    if (!user) {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          full_name: nickname,
          avatar_url: avatarUrl,
          kakao_id: kakaoId,
          provider: "kakao",
        },
      });

      if (createError) {
        console.error("User creation error:", createError);
        return new Response(JSON.stringify({ error: "사용자 생성 실패", details: createError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      user = newUser.user;
    } else {
      // Update user metadata and confirm email
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
        user_metadata: {
          ...user.user_metadata,
          full_name: nickname,
          avatar_url: avatarUrl,
          kakao_id: kakaoId,
          provider: "kakao",
        },
      });
    }

    // 4. Generate session for the user
    // Use signInWithPassword approach: set a temp password and sign in
    // Or use the admin generateLink approach
    // Better: use admin to create a magic link-style session

    // We'll use a workaround: generate a one-time token by creating a session directly
    const tempPassword = `kakao_${kakaoId}_${Date.now()}_${Math.random().toString(36)}`;

    // Update user's password
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: tempPassword,
    });

    // Sign in with the temp password to get a session
    const anonClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: user.email!,
      password: tempPassword,
    });

    if (signInError) {
      console.error("Sign in error:", signInError);
      return new Response(JSON.stringify({ error: "로그인 세션 생성 실패", details: signInError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        session: signInData.session,
        user: signInData.user,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Kakao auth error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
