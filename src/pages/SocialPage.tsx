import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import { useStore } from "@/context/StoreContext";
import {
  Users, Mountain, Search, UserPlus, Check, X, ChevronRight, Bell, Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

const SocialPage = () => {
  const { user } = useAuth();
  const { completedCount } = useStore();
  const {
    friends, pendingReceived, pendingSent,
    sendRequest, acceptRequest, declineRequest, removeFriend, searchUsers,
  } = useFriends();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState<"friends" | "requests">("friends");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const results = await searchUsers(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const handleSendRequest = async (addresseeId: string) => {
    const { error } = await sendRequest(addresseeId);
    if (error) {
      toast({ title: "오류", description: "이미 친구이거나 요청을 보냈습니다.", variant: "destructive" });
    } else {
      toast({ title: "친구 요청을 보냈습니다" });
      setSearchResults((prev) => prev.filter((p) => p.user_id !== addresseeId));
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">로그인 후 친구 기능을 사용할 수 있습니다.</p>
        <Link to="/auth" className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-foreground">함께 걷기</h1>
        <p className="mt-1 text-muted-foreground">친구들의 등산 여정을 확인하고 함께 동기를 나누세요</p>
      </div>

      {/* Search users */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="닉네임으로 친구 찾기..."
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            검색
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2">
            {searchResults.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg bg-secondary/40 p-3">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm">
                    👤
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{p.nickname || "사용자"}</p>
                  {p.location && (
                    <p className="text-[10px] text-muted-foreground">{p.location}</p>
                  )}
                </div>
                <button
                  onClick={() => handleSendRequest(p.user_id)}
                  className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <UserPlus className="h-3 w-3" /> 추가
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("friends")}
          className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
            tab === "friends" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          친구 {friends.length > 0 && `(${friends.length})`}
        </button>
        <button
          onClick={() => setTab("requests")}
          className={`relative flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
            tab === "requests" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          요청
          {pendingReceived.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {pendingReceived.length}
            </span>
          )}
        </button>
      </div>

      {/* Friends list */}
      {tab === "friends" && (
        <div className="space-y-2.5">
          {friends.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">아직 친구가 없습니다</p>
              <p className="text-xs text-muted-foreground/70">위에서 닉네임으로 검색하여 친구를 추가하세요</p>
            </div>
          ) : (
            friends.map((f) => (
              <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                {f.friendProfile.avatar_url ? (
                  <img src={f.friendProfile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg">👤</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{f.friendProfile.nickname || "사용자"}</p>
                  {f.friendProfile.bio && (
                    <p className="text-xs text-muted-foreground truncate">{f.friendProfile.bio}</p>
                  )}
                </div>
                <button
                  onClick={() => removeFriend(f.id)}
                  className="rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Requests */}
      {tab === "requests" && (
        <div className="space-y-4">
          {pendingReceived.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Bell className="h-4 w-4 text-primary" /> 받은 요청
              </h3>
              <div className="space-y-2">
                {pendingReceived.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                    {f.friendProfile.avatar_url ? (
                      <img src={f.friendProfile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg">👤</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{f.friendProfile.nickname || "사용자"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptRequest(f.id)}
                        className="rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => declineRequest(f.id)}
                        className="rounded-lg bg-secondary p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingSent.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">보낸 요청</h3>
              <div className="space-y-2">
                {pendingSent.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm">👤</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{f.friendProfile.nickname || "사용자"}</p>
                      <p className="text-[10px] text-muted-foreground">대기중</p>
                    </div>
                    <button
                      onClick={() => declineRequest(f.id)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      취소
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingReceived.length === 0 && pendingSent.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">친구 요청이 없습니다</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialPage;
