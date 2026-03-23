import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mountainName, summitName } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "이미지가 필요합니다" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert mountain summit photo verification system for a Korean hiking app called "완등" (Wandeung).

Your job is to analyze uploaded photos and determine if they are genuine mountain summit or hiking photos.

Evaluate the photo based on:
1. Does it show a mountain summit, peak, or high-elevation outdoor setting?
2. Are there visible mountain/nature elements (sky, ridges, trails, summit markers, rocks, vegetation)?
3. Does it look like it was taken at or near a mountain peak?
4. Is there a summit marker stone (정상석), flag, or sign visible?

You should APPROVE photos that show:
- Mountain summits, peaks, or ridgelines
- Hikers at mountain tops
- Summit marker stones (정상석)
- Mountain trail scenes at high elevation
- Panoramic mountain views
- Any outdoor mountain environment

You should REJECT photos that show:
- Indoor scenes
- Urban/city scenes with no mountains
- Food photos (unless clearly at a mountain restaurant)
- Selfies with no mountain background
- Screenshots or digital images
- Completely unrelated content

Respond in JSON format with:
- "approved": boolean
- "confidence": number (0-100)
- "reason": string (in Korean, brief explanation)
- "detected_elements": array of strings (what mountain elements you detected)`;

    const userPrompt = mountainName && summitName
      ? `이 사진이 ${mountainName} ${summitName} 정상 근처에서 촬영된 실제 등산 사진인지 확인해주세요.`
      : `이 사진이 실제 산 정상 근처에서 촬영된 등산 사진인지 확인해주세요.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: { url: imageBase64 },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "verify_summit_photo",
              description: "Verify if the photo is a genuine mountain summit photo",
              parameters: {
                type: "object",
                properties: {
                  approved: { type: "boolean", description: "Whether the photo is approved as a summit photo" },
                  confidence: { type: "number", description: "Confidence score 0-100" },
                  reason: { type: "string", description: "Brief explanation in Korean" },
                  detected_elements: {
                    type: "array",
                    items: { type: "string" },
                    description: "Mountain elements detected in the photo",
                  },
                },
                required: ["approved", "confidence", "reason", "detected_elements"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "verify_summit_photo" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 크레딧이 부족합니다." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI verification failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to parse from content
    const content = data.choices?.[0]?.message?.content || "";
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch {
      // ignore parse error
    }

    // Default approval if AI can't determine
    return new Response(
      JSON.stringify({
        approved: true,
        confidence: 50,
        reason: "AI 검증을 완료할 수 없어 수동 검증이 필요합니다.",
        detected_elements: [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("verify-summit-photo error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        // Allow claim even if verification fails
        approved: true,
        confidence: 0,
        reason: "검증 시스템 오류. 수동 확인이 필요할 수 있습니다.",
        detected_elements: [],
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
