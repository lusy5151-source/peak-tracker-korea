import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHikingGroups, type HikingGroup } from "@/hooks/useHikingGroups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Globe, Lock, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const GroupsPage = () => {
  const { user } = useAuth();
  const { myGroups, loading, createGroup, fetchPublicGroups, joinGroup } = useHikingGroups();
  const [publicGroups, setPublicGroups] = useState<HikingGroup[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPublicGroups().then(setPublicGroups);
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    const { error } = await createGroup({ name: name.trim(), description: description.trim() || undefined, is_public: isPublic });
    setCreating(false);
    if (error) {
      toast({ title: "오류", description: "모임 생성에 실패했습니다", variant: "destructive" });
    } else {
      toast({ title: "모임 생성 완료!" });
      setShowCreate(false);
      setName("");
      setDescription("");
      fetchPublicGroups().then(setPublicGroups);
    }
  };

  const handleJoin = async (groupId: string) => {
    const { error } = await joinGroup(groupId);
    if (error) {
      toast({ title: "이미 가입된 모임입니다", variant: "destructive" });
    } else {
      toast({ title: "모임에 가입했습니다!" });
      fetchPublicGroups().then(setPublicGroups);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Users className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">로그인이 필요합니다</p>
        <Link to="/auth" className="text-sm text-primary hover:underline">로그인</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">산악회</h1>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full gap-1.5">
              <Plus className="h-4 w-4" /> 산악회 만들기
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>새 산악회 만들기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-xs">모임 이름</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="월간 등산 모임" className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs">설명</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="모임 소개를 입력하세요" className="mt-1 rounded-xl" rows={3} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">공개 모임</Label>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
              <Button onClick={handleCreate} disabled={creating || !name.trim()} className="w-full rounded-xl">
                {creating ? "생성 중..." : "모임 만들기"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* My groups */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">내 모임</h2>
        {loading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">불러오는 중...</div>
        ) : myGroups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">아직 가입한 모임이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myGroups.map((g) => (
              <GroupCard key={g.id} group={g} isMember />
            ))}
          </div>
        )}
      </section>

      {/* Public groups */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">공개 모임</h2>
        {publicGroups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <Globe className="mx-auto h-8 w-8 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">공개 모임이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {publicGroups.map((g) => {
              const isMember = myGroups.some((mg) => mg.id === g.id);
              return (
                <GroupCard key={g.id} group={g} isMember={isMember} onJoin={!isMember ? () => handleJoin(g.id) : undefined} />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

function GroupCard({ group, isMember, onJoin }: { group: HikingGroup; isMember: boolean; onJoin?: () => void }) {
  const navigate = useNavigate();
  return (
    <div
      className="rounded-2xl bg-card border border-border p-4 shadow-sm cursor-pointer hover:border-primary/30 transition-colors"
      onClick={() => navigate(`/groups/${group.id}`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground">{group.name}</h3>
              {group.is_public ? (
                <Globe className="h-3 w-3 text-muted-foreground" />
              ) : (
                <Lock className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            {group.description && (
              <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{group.description}</p>
            )}
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {group.member_count || 0}명 · {new Date(group.created_at).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>
        {onJoin ? (
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onJoin(); }} className="rounded-full text-xs">
            가입
          </Button>
        ) : isMember ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : null}
      </div>
    </div>
  );
}

export default GroupsPage;
