import { mockFriends } from "@/data/mockFriends";
import { mountains } from "@/data/mountains";
import { useStore } from "@/context/StoreContext";
import { Users, Mountain, TrendingUp, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const SocialPage = () => {
  const { completedCount } = useStore();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">함께 걷기</h1>
        <p className="mt-1 text-muted-foreground">친구들의 등산 여정을 확인하고 함께 동기를 나누세요</p>
      </div>

      {/* My progress card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl">🧗</div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">나</p>
            <p className="text-xs text-muted-foreground">{completedCount}개 산 완등</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{completedCount}</p>
            <p className="text-[10px] text-muted-foreground">/ 100</p>
          </div>
        </div>
      </div>

      {/* Friends list */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">친구 목록</h2>
          <span className="ml-auto text-xs text-muted-foreground">{mockFriends.length}명</span>
        </div>

        <div className="space-y-3">
          {mockFriends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-5 text-center">
        <Users className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p className="mt-2 text-sm text-muted-foreground">
          소셜 기능은 현재 미리보기 모드입니다.
          <br />
          <span className="text-xs">실제 친구 추가는 백엔드 연동 후 사용 가능합니다.</span>
        </p>
      </div>
    </div>
  );
};

function FriendCard({ friend }: { friend: typeof mockFriends[0] }) {
  const recentMountains = friend.recentMountainIds
    .map((id) => mountains.find((m) => m.id === id))
    .filter(Boolean);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg">
          {friend.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">{friend.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mountain className="h-3 w-3" />
            {friend.completedCount}개 완등
            <TrendingUp className="ml-1 h-3 w-3" />
            {Math.round((friend.completedCount / 100) * 100)}%
          </div>
        </div>
        <div className="w-20 h-2 rounded-full bg-secondary">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${friend.completedCount}%` }}
          />
        </div>
      </div>

      {recentMountains.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-[10px] text-muted-foreground mr-1">최근:</span>
          {recentMountains.map((m) => (
            <Link
              key={m!.id}
              to={`/mountains/${m!.id}`}
              className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {m!.nameKo}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SocialPage;
