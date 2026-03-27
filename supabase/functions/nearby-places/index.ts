import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory cache (per function instance)
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, radius = 5000, sort = "distance" } = await req.json();

    const cacheKey = `${lat}_${lng}_${radius}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const KAKAO_REST_API_KEY = Deno.env.get("KAKAO_REST_API_KEY");
    if (!KAKAO_REST_API_KEY) {
      return new Response(
        JSON.stringify({ restaurants: [], cafes: [], message: "Kakao API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headers = {
      Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
    };

    const fetchCategory = async (categoryCode: string) => {
      // Kakao category codes: FD6=음식점, CE7=카페
      const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${categoryCode}&x=${lng}&y=${lat}&radius=${radius}&sort=${sort}&size=10`;
      const res = await fetch(url, { headers });
      const data = await res.json();

      if (!data.documents) return [];

      return data.documents.slice(0, 5).map((doc: any) => ({
        name: doc.place_name,
        category: doc.category_name,
        address: doc.road_address_name || doc.address_name,
        phone: doc.phone || null,
        distance_m: parseInt(doc.distance, 10),
        distance_km: (parseInt(doc.distance, 10) / 1000).toFixed(1),
        place_url: doc.place_url,
        lat: parseFloat(doc.y),
        lng: parseFloat(doc.x),
        place_id: doc.id,
      }));
    };

    const [restaurants, cafes] = await Promise.all([
      fetchCategory("FD6"),
      fetchCategory("CE7"),
    ]);

    const result = { restaurants, cafes };

    // Cache the result
    cache.set(cacheKey, { data: result, ts: Date.now() });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
