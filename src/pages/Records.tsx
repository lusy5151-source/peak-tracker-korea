import { useStore } from "@/context/StoreContext";
import { mountains } from "@/data/mountains";
import { Mountain, Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Records = () => {
  const { records } = useStore();

  const sortedRecords = [...records]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .map((r) => ({
      ...r,
      mountain: mountains.find((m) => m.id === r.mountainId)!,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">내 기록</h1>
        <p className="mt-1 text-muted-foreground">완등한 산 {records.length}개</p>
      </div>

      {sortedRecords.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <Mountain className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">아직 완등 기록이 없습니다</p>
          <Link to="/mountains" className="mt-2 inline-block text-sm text-primary hover:underline">
            산 목록에서 시작하세요
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRecords.map((r) => (
            <Link
              key={r.mountainId}
              to={`/mountains/${r.mountainId}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mountain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{r.mountain.nameKo}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.mountain.region} · {r.mountain.height}m · {r.mountain.difficulty}
                  </p>
                  {r.notes && (
                    <p className="mt-1 text-xs text-muted-foreground/70 line-clamp-1">{r.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {r.weather && <span>{r.weather}</span>}
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(r.completedAt).toLocaleDateString("ko-KR")}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Records;
