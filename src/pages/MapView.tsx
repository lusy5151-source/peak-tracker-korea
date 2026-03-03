import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mountains } from "@/data/mountains";
import { useStore } from "@/context/StoreContext";

const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const { isCompleted, completedCount } = useStore();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const koreaBounds = L.latLngBounds(
      L.latLng(33.0, 124.5),
      L.latLng(38.7, 131.9)
    );

    const map = L.map(mapRef.current, {
      center: [36.0, 127.8],
      zoom: 7,
      zoomControl: false,
      maxBounds: koreaBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 6,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mountains.forEach((m) => {
      const completed = isCompleted(m.id);
      const color = completed ? "#4a9d6e" : "#94a3b8";

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: 12px; height: 12px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
      marker.bindTooltip(
        `<strong>${m.nameKo}</strong><br/>${m.height}m · ${m.difficulty}${completed ? "<br/>✓ 완등" : ""}`,
        { direction: "top", offset: [0, -8] }
      );
      marker.on("click", () => navigate(`/mountains/${m.id}`));
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isCompleted, navigate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">지도</h1>
          <p className="mt-1 text-muted-foreground">
            {completedCount}개 완등 · 마커를 클릭하면 상세 페이지로 이동합니다
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-primary" />
            완등
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: "#94a3b8" }} />
            미등
          </span>
        </div>
      </div>
      <div
        ref={mapRef}
        className="h-[calc(100vh-200px)] min-h-[400px] rounded-2xl border border-border overflow-hidden shadow-sm"
      />
    </div>
  );
};

export default MapView;
