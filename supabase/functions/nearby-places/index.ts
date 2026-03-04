import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, radius = 3000 } = await req.json();

    const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!GOOGLE_PLACES_API_KEY) {
      // Return empty results if no API key configured
      return new Response(
        JSON.stringify({ restaurants: [], cafes: [], message: "Google Places API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fetchPlaces = async (type: string) => {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&language=ko&key=${GOOGLE_PLACES_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== "OK") return [];

      return data.results
        .filter((p: any) => p.rating >= 4.0 && p.user_ratings_total >= 5)
        .slice(0, 6)
        .map((p: any) => ({
          name: p.name,
          rating: p.rating,
          user_ratings_total: p.user_ratings_total,
          vicinity: p.vicinity,
          distance_km: haversineDistance(lat, lng, p.geometry.location.lat, p.geometry.location.lng),
          photo_url: p.photos?.[0]
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
            : null,
          place_id: p.place_id,
          types: p.types,
        }));
    };

    const [restaurants, cafes] = await Promise.all([
      fetchPlaces("restaurant"),
      fetchPlaces("cafe"),
    ]);

    return new Response(
      JSON.stringify({ restaurants, cafes }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
