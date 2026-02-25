import type { TrailInfo as TrailInfoType } from "@/data/mountains";
import { Route, Clock, MapPin, Ruler } from "lucide-react";

export function TrailInfoSection({ trails }: { trails: TrailInfoType[] }) {
  if (trails.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-1 rounded-full bg-primary" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">등산 코스</h2>
          <p className="text-xs text-muted-foreground">주요 등산로 정보</p>
        </div>
      </div>

      <div className="space-y-3">
        {trails.map((trail, i) => (
          <div key={i} className="rounded-xl bg-secondary/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Route className="h-4 w-4 text-primary" />
              <p className="font-medium text-foreground">{trail.name}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <TrailStat icon={Ruler} label="거리" value={trail.distance} />
              <TrailStat icon={Clock} label="소요시간" value={trail.duration} />
              <TrailStat icon={MapPin} label="출발점" value={trail.startingPoint} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrailStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span className="text-[10px]">{label}</span>
      </div>
      <p className="mt-0.5 text-xs font-medium text-foreground">{value}</p>
    </div>
  );
}
