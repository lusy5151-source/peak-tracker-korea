import { useState, useMemo } from "react";
import { mountains, regions } from "@/data/mountains";
import { useStore } from "@/context/StoreContext";
import { Search, CheckCircle2, Circle, Mountain, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

const MountainList = () => {
  const { isCompleted, toggleComplete, completedCount } = useStore();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("전체");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("전체");
  const [showCompleted, setShowCompleted] = useState<"all" | "done" | "todo">("all");

  const filtered = useMemo(() => {
    return mountains.filter((m) => {
      const matchSearch = m.nameKo.includes(search) || m.name.toLowerCase().includes(search.toLowerCase());
      const matchRegion = regionFilter === "전체" || m.region === regionFilter;
      const matchDifficulty = difficultyFilter === "전체" || m.difficulty === difficultyFilter;
      const matchStatus =
        showCompleted === "all" ||
        (showCompleted === "done" && isCompleted(m.id)) ||
        (showCompleted === "todo" && !isCompleted(m.id));
      return matchSearch && matchRegion && matchDifficulty && matchStatus;
    });
  }, [search, regionFilter, difficultyFilter, showCompleted, isCompleted]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">산 목록</h1>
        <p className="mt-1 text-muted-foreground">
          {completedCount}개 완등 · {100 - completedCount}개 남음
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="산 이름으로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {["전체", ...regions].map((r) => (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                regionFilter === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {["전체", "쉬움", "보통", "어려움"].map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                difficultyFilter === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {([["all", "전체"], ["done", "완등"], ["todo", "미등"]] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setShowCompleted(val)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                showCompleted === val
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">검색 결과가 없습니다</p>
        ) : (
          filtered.map((m) => {
            const completed = isCompleted(m.id);
            return (
              <div
                key={m.id}
                className={`flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-sm transition-colors ${
                  completed ? "border-primary/20 bg-nature-50/50" : "border-border"
                }`}
              >
                <button
                  onClick={() => toggleComplete(m.id)}
                  className="shrink-0 text-primary"
                  aria-label={completed ? "완등 취소" : "완등 표시"}
                >
                  {completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </button>
                <Link to={`/mountains/${m.id}`} className="flex flex-1 items-center justify-between min-w-0">
                  <div className="min-w-0">
                    <p className={`font-medium truncate ${completed ? "text-primary" : "text-foreground"}`}>
                      {m.nameKo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.region} · {m.height}m · {m.difficulty}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MountainList;
