import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Star, ExternalLink, Coffee, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Place {
  name: string;
  rating: number;
  user_ratings_total: number;
  vicinity: string;
  distance_km: number;
  photo_url: string | null;
  place_id: string;
  types: string[];
}

interface NearbyPlacesProps {
  lat: number;
  lng: number;
  mountainName: string;
}

export function NearbyPlaces({ lat, lng, mountainName }: NearbyPlacesProps) {
  const [restaurants, setRestaurants] = useState<Place[]>([]);
  const [cafes, setCafes] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke("nearby-places", {
          body: { lat, lng, radius: 3000 },
        });
        if (fnError) throw fnError;
        if (data?.restaurants) setRestaurants(data.restaurants);
        if (data?.cafes) setCafes(data.cafes);
      } catch (e: any) {
        setError("주변 맛집 정보를 불러올 수 없습니다");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, [lat, lng]);

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Restaurants */}
      <PlaceSection
        title="주변 맛집"
        subtitle={`${mountainName} 근처 추천 식당`}
        icon={UtensilsCrossed}
        places={restaurants}
        loading={loading}
        lat={lat}
        lng={lng}
      />

      {/* Cafes */}
      <PlaceSection
        title="주변 카페"
        subtitle={`${mountainName} 근처 추천 카페`}
        icon={Coffee}
        places={cafes}
        loading={loading}
        lat={lat}
        lng={lng}
      />
    </div>
  );
}

function PlaceSection({
  title,
  subtitle,
  icon: Icon,
  places,
  loading,
  lat,
  lng,
}: {
  title: string;
  subtitle: string;
  icon: any;
  places: Place[];
  loading: boolean;
  lat: number;
  lng: number;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 rounded-full bg-primary" />
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (places.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-1 rounded-full bg-primary" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {places.slice(0, 6).map((place) => (
          <div key={place.place_id} className="rounded-xl bg-secondary/50 overflow-hidden">
            {place.photo_url && (
              <div className="h-28 bg-muted">
                <img
                  src={place.photo_url}
                  alt={place.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-3 space-y-2">
              <h3 className="font-medium text-sm text-foreground line-clamp-1">{place.name}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span className="font-medium text-foreground">{place.rating}</span>
                  <span>({place.user_ratings_total})</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" />
                  <span>{place.distance_km.toFixed(1)}km</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-8"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`,
                    "_blank"
                  )
                }
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                지도에서 보기
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
