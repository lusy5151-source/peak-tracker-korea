import { getMockWeather, getOutfitRecommendations } from "@/data/mockWeather";
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Thermometer, CloudSun } from "lucide-react";
import type { GearItem } from "@/hooks/useGearStore";

const conditionIcons: Record<string, any> = {
  "맑음": Sun,
  "구름": CloudSun,
  "흐림": Cloud,
  "비": CloudRain,
  "눈": CloudSnow,
};

export function WeatherCard({ mountainId }: { mountainId: number }) {
  const weather = getMockWeather(mountainId);
  const recommendations = getOutfitRecommendations(weather);
  const CondIcon = conditionIcons[weather.condition] || Cloud;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-8 w-1 rounded-full bg-primary" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">현재 날씨</h2>
          <p className="text-xs text-muted-foreground">목업 데이터 · 실제 날씨와 다를 수 있습니다</p>
        </div>
      </div>

      {/* Weather overview */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <CondIcon className="h-10 w-10 text-primary" />
          <div>
            <p className="text-3xl font-bold text-foreground">{weather.temp}°C</p>
            <p className="text-xs text-muted-foreground">체감 {weather.feelsLike}°C</p>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-3">
          <WeatherStat icon={Wind} label="풍속" value={`${weather.windSpeed}km/h`} />
          <WeatherStat icon={Droplets} label="강수 확률" value={`${weather.precipChance}%`} />
          <WeatherStat icon={Thermometer} label="습도" value={`${weather.humidity}%`} />
        </div>
      </div>

      {/* Outfit recommendations */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">🧥 복장 추천</h3>
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3">
              <span className="mt-0.5 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary whitespace-nowrap">
                {rec.category}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{rec.item}</p>
                <p className="text-xs text-muted-foreground">{rec.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeatherStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="text-center">
      <Icon className="mx-auto h-4 w-4 text-muted-foreground" />
      <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}
