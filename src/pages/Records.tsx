import { useState, useEffect, useCallback } from "react";
import { mountains } from "@/data/mountains";
import { useHikingJournals, type HikingJournal } from "@/hooks/useHikingJournals";
import { useAuth } from "@/contexts/AuthContext";
import { JournalForm } from "@/components/JournalForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Mountain, Calendar, Clock, Route, Users, Plus, Pencil, Trash2, MoreVertical,
  Globe, Lock, ChevronRight,
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
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const visibilityIcons: Record<string, typeof Globe> = {
  public: Globe,
  friends: Users,
  private: Lock,
};

const Records = () => {
  const { user } = useAuth();
  const { fetchMyJournals, deleteJournal } = useHikingJournals();
  const { toast } = useToast();

  const [journals, setJournals] = useState<HikingJournal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJournal, setEditingJournal] = useState<HikingJournal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HikingJournal | null>(null);
  const [friendProfiles, setFriendProfiles] = useState<Map<string, { nickname: string | null; avatar_url: string | null }>>(new Map());

  const loadJournals = useCallback(async () => {
    setLoading(true);
    const data = await fetchMyJournals();
    setJournals(data);
    setLoading(false);
  }, [fetchMyJournals]);

  useEffect(() => {
    if (user) loadJournals();
    else setLoading(false);
  }, [user, loadJournals]);

  // Load tagged friend profiles
  useEffect(() => {
    const allFriendIds = [...new Set(journals.flatMap((j) => j.tagged_friends || []))];
    if (allFriendIds.length === 0) return;
    supabase
      .from("profiles")
      .select("user_id, nickname, avatar_url")
      .in("user_id", allFriendIds)
      .then(({ data }) => {
        if (data) setFriendProfiles(new Map(data.map((p) => [p.user_id, p])));
      });
  }, [journals]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await deleteJournal(deleteTarget.id);
    if (error) {
      toast({ title: "삭제 실패", variant: "destructive" });
    } else {
      toast({ title: "일지를 삭제했습니다" });
      setJournals((prev) => prev.filter((j) => j.id !== deleteTarget.id));
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
    loadJournals();
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

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">내 등산 일지</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{journals.length}개의 기록</p>
        </div>
        <Button size="sm" onClick={() => { setEditingJournal(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> 일지 작성
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex gap-3">
                <Skeleton className="h-14 w-14 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : journals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center">
          <Mountain className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">아직 등산 일지가 없습니다</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setShowForm(true)}
          >
            첫 일지 작성하기
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {journals.map((journal) => {
            const mountain = mountains.find((m) => m.id === journal.mountain_id);
            if (!mountain) return null;
            const tagged = journal.tagged_friends || [];
            const photos = journal.photos || [];
            const VisIcon = visibilityIcons[journal.visibility] || Globe;

            return (
              <div
                key={journal.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  {photos.length > 0 ? (
                    <img
                      src={photos[0]}
                      alt=""
                      className="h-14 w-14 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Mountain className="h-6 w-6 text-primary" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground text-sm">{mountain.nameKo}</p>
                      <VisIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(journal.hiked_at), "yyyy.M.d (EEE)", { locale: ko })}
                      </span>
                      {journal.weather && <span>{journal.weather}</span>}
                      {journal.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {journal.duration}
                        </span>
                      )}
                    </div>
                    {journal.course_name && (
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5 flex items-center gap-1">
                        <Route className="h-2.5 w-2.5" /> {journal.course_name}
                        {journal.course_starting_point && ` · ${journal.course_starting_point}`}
                      </p>
                    )}
                    {journal.difficulty && (
                      <span className="inline-block mt-1 text-[10px] bg-secondary/60 rounded px-1.5 py-0.5 text-muted-foreground">
                        난이도: {journal.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary/50">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(journal)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" /> 수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(journal)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> 삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Photos strip */}
                {photos.length > 1 && (
                  <div className="flex gap-1.5 mt-3 overflow-x-auto">
                    {photos.slice(1, 5).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="h-16 w-16 rounded-lg object-cover shrink-0"
                      />
                    ))}
                    {photos.length > 5 && (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary/60 shrink-0">
                        <span className="text-xs text-muted-foreground font-medium">+{photos.length - 5}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {journal.notes && (
                  <p className="mt-2.5 text-xs text-foreground/80 leading-relaxed line-clamp-2">
                    {journal.notes}
                  </p>
                )}

                {/* Tagged friends */}
                {tagged.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-border/50">
                    <p className="text-[10px] text-primary font-medium mb-1.5 flex items-center gap-1">
                      <Users className="h-3 w-3" /> 함께한 친구
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
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
              </div>
            );
          })}
        </div>
      )}

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
            <AlertDialogTitle>일지를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제된 일지는 복구할 수 없습니다. 사진과 댓글도 함께 삭제됩니다.
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

export default Records;
