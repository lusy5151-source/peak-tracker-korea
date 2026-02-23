import { useStore } from "@/context/StoreContext";
import { mountains } from "@/data/mountains";
import { Mountain, TrendingUp, CheckCircle2, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import ProgressRing from "@/components/ProgressRing";

const Dashboard = () => {
  const { records, completedCount, isCompleted } = useStore();
  const percentage = Math.round((completedCount / 100) * 100);

  const recentRecords = [...records]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5);

  const recentMountains = recentRecords.map((r) => ({
    ...mountains.find((m) => m.id === r.mountainId)!,
    completedAt: r.completedAt,
  }));

  const difficultyStats = {
    easy: mountains.filter((m) => m.difficulty === "쉬움" && isCompleted(m.id)).length,
    medium: mountains.filter((m) => m.difficulty === "보통" && isCompleted(m.id)).length,
    hard: mountains.filter((m) => m.difficulty === "어려움" && isCompleted(m.id)).length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">대한민국 백대명산</h1>
        <p className="mt-1 text-muted-foreground">나만의 등산 기록을 관리하세요</p>
      </div>

      {/* Progress Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="col-span-1 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 shadow-sm">
          <ProgressRing percentage={percentage} />
          <p className="mt-4 text-sm font-medium text-muted-foreground">완등 진행률</p>
        </div>

        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
          <StatCard icon={CheckCircle2} label="완등한 산" value={`${completedCount}`} sub="/ 100" />
          <StatCard icon={TrendingUp} label="진행률" value={`${percentage}%`} sub="달성" />
          <StatCard icon={Mountain} label="남은 산" value={`${100 - completedCount}`} sub="개 남음" />
          <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground mb-2">난이도별 완등</p>
            <div className="space-y-1.5">
              <DifficultyBar label="쉬움" count={difficultyStats.easy} total={mountains.filter(m => m.difficulty === "쉬움").length} />
              <DifficultyBar label="보통" count={difficultyStats.medium} total={mountains.filter(m => m.difficulty === "보통").length} />
              <DifficultyBar label="어려움" count={difficultyStats.hard} total={mountains.filter(m => m.difficulty === "어려움").length} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">최근 완등</h2>
          <Link to="/records" className="text-sm text-primary hover:underline">
            모두 보기
          </Link>
        </div>
        {recentMountains.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Mountain className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              아직 완등 기록이 없습니다.{" "}
              <Link to="/mountains" className="text-primary hover:underline">
                산 목록에서 시작하세요
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMountains.map((m) => (
              <Link
                key={m.id}
                to={`/mountains/${m.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Mountain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{m.nameKo}</p>
                    <p className="text-xs text-muted-foreground">{m.region} · {m.height}m</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(m.completedAt).toLocaleDateString("ko-KR")}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-5 shadow-sm">
      <Icon className="mb-2 h-5 w-5 text-primary" />
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">
        {value}
        <span className="ml-1 text-sm font-normal text-muted-foreground">{sub}</span>
      </p>
    </div>
  );
}

function DifficultyBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-secondary">
        <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-xs text-muted-foreground">{count}/{total}</span>
    </div>
  );
}

export default Dashboard;
