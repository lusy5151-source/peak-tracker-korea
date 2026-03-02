import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Calculate target dates
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDays = threeDaysLater.toISOString().split("T")[0];

    const oneDayLater = new Date(now);
    oneDayLater.setDate(oneDayLater.getDate() + 1);
    const oneDay = oneDayLater.toISOString().split("T")[0];

    const currentHour = now.getHours();

    // Get upcoming plans
    const { data: plans } = await supabase
      .from("hiking_plans")
      .select("id, creator_id, planned_date, mountain_id")
      .eq("status", "upcoming")
      .in("planned_date", [today, oneDay, threeDays]);

    if (!plans || plans.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sentCount = 0;

    for (const plan of plans) {
      let reminderType = "";
      let message = "";

      if (plan.planned_date === threeDays) {
        reminderType = "reminder_3d";
        message = "등산 3일 전입니다. 준비물을 확인해보세요! 🎒";
      } else if (plan.planned_date === oneDay) {
        reminderType = "reminder_1d";
        message = "내일 등산 예정입니다. 일기예보를 확인하세요! ⛰️";
      } else if (plan.planned_date === today && currentHour >= 6 && currentHour <= 8) {
        reminderType = "reminder_today";
        message = "오늘 등산하는 날입니다! 안전한 산행 되세요 🌄";
      }

      if (!reminderType) continue;

      // Check if reminder already sent
      const { data: existing } = await supabase
        .from("plan_notifications")
        .select("id")
        .eq("plan_id", plan.id)
        .eq("type", reminderType)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Get all users to notify (creator + going participants)
      const { data: participants } = await supabase
        .from("plan_participants")
        .select("user_id")
        .eq("plan_id", plan.id)
        .eq("rsvp_status", "going");

      const userIds = [
        plan.creator_id,
        ...(participants || []).map((p: any) => p.user_id),
      ];
      const uniqueIds = [...new Set(userIds)];

      const notifications = uniqueIds.map((uid) => ({
        user_id: uid,
        plan_id: plan.id,
        type: reminderType,
        message,
      }));

      const { error } = await supabase
        .from("plan_notifications")
        .insert(notifications);

      if (!error) sentCount += notifications.length;
    }

    return new Response(JSON.stringify({ sent: sentCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
