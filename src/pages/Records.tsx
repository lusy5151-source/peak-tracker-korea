import { useState, useEffect, useCallback } from "react";
import { mountains } from "@/data/mountains";
import { useHikingJournals, type HikingJournal } from "@/hooks/useHikingJournals";
import { useAuth } from "@/contexts/AuthContext";
import { JournalForm } from "@/components/JournalForm";
import { JournalCard, JournalGridCard } from "@/components/JournalCard";
import { Button } from "@/components/ui/button";
import MountainMascot from "@/components/MountainMascot";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Mountain, Plus, Pencil, Trash2, MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Records = () => {
  const { user } = useAuth();
  const { fetchMyJournals, fetchFeed, deleteJournal } = useHikingJournals();
  const { toast } = useToast();

  const [myJournals, setMyJournals] = useState<HikingJournal[]>([]);
  const [feedJournals, setFeedJournals] = useState<HikingJournal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJournal, setEditingJournal] = useState<HikingJournal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HikingJournal | null>(null);
  const [activeTab, setActiveTab] = useState("feed");
  const [selectedJournal, setSelectedJournal] = useState<HikingJournal | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [mine, feed] = await Promise.all([fetchMyJournals(), fetchFeed()]);
    setMyJournals(mine);
    setFeedJournals(feed);
    setLoading(false);
  }, [fetchMyJournals, fetchFeed]);

  useEffect(() => {
    if (user) loadData();
    else setLoading(false);
  }, [user, loadData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await deleteJournal(deleteTarget.id);
    if (error) {
      toast({ title: "삭제 실패", variant: "destructive" });
    } else {
      toast({ title: "기록을 삭제했습니다" });
      setMyJournals((prev) => prev.filter((j) => j.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const handleEdit = (journal: HikingJournal) => {
    setEditingJournal(journal);
    setShowForm(true);
  };

  const handleFormSaved = () => {
    setShowForm(false);
    setEditingJournal(null);
    loadData();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingJournal(null);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Mountain className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">로그인이 필요합니다</p>
        <Button asChild><Link to="/auth">로그인</Link></Button>
      </div>
    );
  }

  // Combined feed: my journals + friends' journals, sorted by newest
  const allFeed = [...myJournals.map((j) => ({ ...j, _isMine: true })), ...feedJournals.map((j) => ({ ...j, _isMine: false }))]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-5 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">기록</h1>
          <p className="text-xs text-muted-foreground mt-0.5">나와 친구들의 등산 기록</p>
        </div>
        <Button size="sm" className="rounded-xl gap-1.5" onClick={() => { setEditingJournal(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> 기록 작성
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedJournal(null); }}>
        <TabsList className="w-full bg-secondary/50 rounded-xl">
          <TabsTrigger value="feed" className="flex-1 rounded-lg text-xs">전체 피드</TabsTrigger>
          <TabsTrigger value="mine" className="flex-1 rounded-lg text-xs">내 기록</TabsTrigger>
          <TabsTrigger value="grid" className="flex-1 rounded-lg text-xs">갤러리</TabsTrigger>
        </TabsList>

        {/* Feed tab: all records */}
        <TabsContent value="feed" className="space-y-4 mt-4">
          {loading ? (
            <LoadingSkeleton />
          ) : allFeed.length === 0 ? (
            <EmptyState onAdd={() => setShowForm(true)} />
          ) : (
            allFeed.map((j) => (
              <div key={j.id} className="relative">
                <JournalCard
                  journal={j}
                  showAuthor
                  onRefresh={loadData}
                />
                {(j as any)._isMine && (
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(j)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> 수정
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(j)} className="text-destructive focus:text-destructive">
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        {/* My records tab */}
        <TabsContent value="mine" className="space-y-4 mt-4">
          {loading ? (
            <LoadingSkeleton />
          ) : myJournals.length === 0 ? (
            <EmptyState onAdd={() => setShowForm(true)} />
          ) : (
            myJournals.map((j) => (
              <div key={j.id} className="relative">
                <JournalCard journal={j} showAuthor={false} onRefresh={loadData} />
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(j)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" /> 수정
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteTarget(j)} className="text-destructive focus:text-destructive">
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> 삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Grid (gallery) tab */}
        <TabsContent value="grid" className="mt-4">
          {loading ? (
            <LoadingSkeleton />
          ) : selectedJournal ? (
            <div className="space-y-3">
              <button onClick={() => setSelectedJournal(null)} className="text-xs text-primary hover:underline">← 갤러리로</button>
              <div className="relative">
                <JournalCard journal={selectedJournal} showAuthor={false} onRefresh={loadData} />
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(selectedJournal)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" /> 수정
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteTarget(selectedJournal)} className="text-destructive focus:text-destructive">
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> 삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ) : myJournals.length === 0 ? (
            <EmptyState onAdd={() => setShowForm(true)} />
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {myJournals.map((j) => (
                <JournalGridCard key={j.id} journal={j} onClick={() => setSelectedJournal(j)} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Journal Form Modal */}
      {showForm && (
        <JournalForm
          editJournal={editingJournal}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기록을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제된 기록은 복구할 수 없습니다. 사진과 댓글도 함께 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <MountainMascot size={70} mood="loading" />
      <span className="text-sm text-muted-foreground">기록을 불러오는 중...</span>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <MountainMascot size={90} mood="waving" className="mx-auto" />
      <p className="mt-4 text-muted-foreground">아직 등산 기록이 없습니다</p>
      <p className="text-xs text-muted-foreground/70 mt-1">첫 등산 기록을 작성해보세요</p>
      <Button variant="outline" size="sm" className="mt-3 rounded-xl" onClick={onAdd}>
        기록 작성하기
      </Button>
    </div>
  );
}

export default Records;
