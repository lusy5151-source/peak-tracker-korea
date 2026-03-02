import { useStore } from "@/context/StoreContext";
import { mountains } from "@/data/mountains";
import { Mountain, Calendar, ChevronRight, Clock, Route, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Records = () => {
  const { records } = useStore();
  const [friendProfiles, setFriendProfiles] = useState<Map<string, { nickname: string | null; avatar_url: string | null }>>(new Map());

  // Load all tagged friend profiles
  useEffect(() => {
    const allFriendIds = [...new Set(records.flatMap((r) => r.taggedFriends || []))];
    if (allFriendIds.length === 0) return;
    supabase
      .from("profiles")
      .select("user_id, nickname, avatar_url")
      .in("user_id", allFriendIds)
      .then(({ data }) => {
        if (data) setFriendProfiles(new Map(data.map((p) => [p.user_id, p])));
      });
  }, [records]);

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
          {sortedRecords.map((r) => {
            const tagged = r.taggedFriends || [];
            return (
              <Link
                key={r.mountainId}
                to={`/mountains/${r.mountainId}`}
                className="block rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {r.photos && r.photos.length > 0 ? (
                      <img src={r.photos[0]} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <Mountain className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{r.mountain.nameKo}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(r.completedAt).toLocaleDateString("ko-KR")}
                        </span>
                        {r.weather && <span>{r.weather}</span>}
                        {r.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {r.duration}
                          </span>
                        )}
                      </div>
                      {r.courseName && (
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                          <Route className="h-2.5 w-2.5" /> {r.courseName}
                          {r.courseStartingPoint && ` · ${r.courseStartingPoint}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                </div>

                {/* Tagged friends */}
                {tagged.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-border/50">
                    <p className="text-[10px] text-primary font-medium mb-1.5 flex items-center gap-1">
                      <Users className="h-3 w-3" /> 함께 완등한 친구
                    </p>
                    <div className="flex items-center gap-1.5">
                      {tagged.slice(0, 5).map((fId) => {
                        const profile = friendProfiles.get(fId);
                        return (
                          <div key={fId} className="flex items-center gap-1 rounded-md bg-secondary/60 px-2 py-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={profile?.avatar_url || ""} />
                              <AvatarFallback className="text-[7px]">{profile?.nickname?.[0] || "?"}</AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] font-medium text-foreground">{profile?.nickname || "친구"}</span>
                          </div>
                        );
                      })}
                      {tagged.length > 5 && (
                        <span className="text-[10px] text-muted-foreground">+{tagged.length - 5}명</span>
                      )}
                    </div>
                  </div>
                )}

                {r.notes && (
                  <p className="mt-2 text-xs text-muted-foreground/70 line-clamp-1">{r.notes}</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Records;
