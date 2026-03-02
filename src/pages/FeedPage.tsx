import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHikingJournals, type HikingJournal } from "@/hooks/useHikingJournals";
import { JournalCard } from "@/components/JournalCard";
import { Mountain, Compass } from "lucide-react";

const FeedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchFeed } = useHikingJournals();
  const [journals, setJournals] = useState<HikingJournal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetchFeed().then((data) => {
      setJournals(data);
      setLoading(false);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Compass className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">로그인하면 친구들의 등산 일지를 볼 수 있습니다</p>
        <Link to="/auth" className="text-sm text-primary hover:underline">로그인</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-foreground">피드</h1>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">불러오는 중...</div>
      ) : journals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Mountain className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">아직 공유된 일지가 없습니다</p>
          <p className="text-xs text-muted-foreground/70 mt-1">친구를 추가하고 등산 일지를 공유해보세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {journals.map((j) => (
            <JournalCard key={j.id} journal={j} showAuthor onRefresh={() => fetchFeed().then(setJournals)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedPage;
