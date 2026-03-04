import { useState, useMemo } from "react";
import { mountains, regions } from "@/data/mountains";
import { useStore } from "@/context/StoreContext";
import { Search, CheckCircle2, Circle, ChevronRight, ArrowUpDown, SlidersHorizontal, Mountain, Star, Smile, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

type SortKey = "name" | "height" | "popularity";
type CategoryFilter = "all" | "baekdu" | "popular" | "beginner" | "general";

const MountainList = () => {
  const { isCompleted, toggleComplete, completedCount } = useStore();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("전체");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("전체");
  const [showCompleted, setShowCompleted] = useState<"all" | "done" | "todo">("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  const totalBaekdu = mountains.filter((m) => m.is_baekdu).length;
  const completedBaekdu = mountains.filter((m) => m.is_baekdu && isCompleted(m.id)).length;

  const filtered = useMemo(() => {
    let list = mountains.filter((m) => {
      const matchSearch = m.nameKo.includes(search) || m.name.toLowerCase().includes(search.toLowerCase());
      const matchRegion = regionFilter === "전체" || m.region === regionFilter;
      const matchDifficulty = difficultyFilter === "전체" || m.difficulty === difficultyFilter;
      const matchStatus =
        showCompleted === "all" ||
        (showCompleted === "done" && isCompleted(m.id)) ||
        (showCompleted === "todo" && !isCompleted(m.id));

      let matchCategory = true;
      if (category === "baekdu") matchCategory = m.is_baekdu;
      else if (category === "popular") matchCategory = (m.popularity || 0) >= 4;
      else if (category === "beginner") matchCategory = m.difficulty === "쉬움";
      else if (category === "general") matchCategory = !m.is_baekdu;

      return matchSearch && matchRegion && matchDifficulty && matchStatus && matchCategory;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.nameKo.localeCompare(b.nameKo, "ko");
      else if (sortKey === "height") cmp = a.height - b.height;
      else if (sortKey === "popularity") cmp = (a.popularity || 0) - (b.popularity || 0);
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [search, regionFilter, difficultyFilter, showCompleted, isCompleted, sortKey, sortAsc, category]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === "name"); }
  };

  const categories: { key: CategoryFilter; label: string; icon: any }[] = [
    { key: "all", label: "전체", icon: Mountain },
    { key: "baekdu", label: "백대명산", icon: Star },
    { key: "popular", label: "인기 산", icon: Star },
    { key: "beginner", label: "초보자용", icon: Smile },
    { key: "general", label: "일반 산", icon: MapPin },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">산 목록</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          전체 {mountains.length}개 · 완등 {completedCount}개 · 백대명산 {completedBaekdu}/{totalBaekdu}
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

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {categories.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              category === key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Filter toggle + Sort */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          필터 {showFilters ? "접기" : "펼치기"}
        </button>
        <div className="flex gap-1">
          {([["name", "이름"], ["height", "높이"], ["popularity", "인기"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={`flex items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                sortKey === key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {sortKey === key && (
                <ArrowUpDown className="h-3 w-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters (collapsible) */}
      {showFilters && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex flex-wrap gap-1.5">
            {["전체", ...regions].map((r) => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  regionFilter === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["전체", "쉬움", "보통", "어려움"].map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  difficultyFilter === d
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {([["all", "전체"], ["done", "완등"], ["todo", "미등"]] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setShowCompleted(val)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
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
      )}

      {/* Result count */}
      <p className="text-xs text-muted-foreground">{filtered.length}개 결과</p>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">검색 결과가 없습니다</p>
        ) : (
          filtered.map((m) => {
            const completed = isCompleted(m.id);
            const diffColor =
              m.difficulty === "쉬움" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : m.difficulty === "보통" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

            return (
              <div
                key={m.id}
                className={`flex items-center gap-3 rounded-xl border bg-card p-3.5 shadow-sm transition-colors ${
                  completed ? "border-primary/20 bg-primary/5" : "border-border"
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
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <p className={`font-medium truncate ${completed ? "text-primary" : "text-foreground"}`}>
                        {m.nameKo}
                      </p>
                      {m.is_baekdu && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400">
                          백대
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{m.region}</span>
                      <span>·</span>
                      <span>{m.height}m</span>
                      <span className={`rounded px-1 py-0.5 text-[10px] font-medium ${diffColor}`}>
                        {m.difficulty}
                      </span>
                    </div>
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
