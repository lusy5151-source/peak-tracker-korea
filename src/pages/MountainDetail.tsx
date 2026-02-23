import { useParams, Link } from "react-router-dom";
import { mountains } from "@/data/mountains";
import { useStore } from "@/context/StoreContext";
import { ArrowLeft, Mountain, MapPin, TrendingUp, CheckCircle2, Circle, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

const MountainDetail = () => {
  const { id } = useParams<{ id: string }>();
  const mountain = mountains.find((m) => m.id === Number(id));
  const { isCompleted, toggleComplete, getRecord, updateNotes, updateDate } = useStore();

  if (!mountain) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">산을 찾을 수 없습니다</p>
        <Link to="/mountains" className="mt-2 inline-block text-sm text-primary hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const completed = isCompleted(mountain.id);
  const record = getRecord(mountain.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/mountains" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        산 목록
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{mountain.nameKo}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{mountain.name}</p>
          </div>
          <button
            onClick={() => toggleComplete(mountain.id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              completed
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
            {completed ? "완등" : "미등"}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          <InfoItem icon={Mountain} label="높이" value={`${mountain.height}m`} />
          <InfoItem icon={MapPin} label="지역" value={mountain.region} />
          <InfoItem icon={TrendingUp} label="난이도" value={mountain.difficulty} />
        </div>

        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{mountain.description}</p>
      </div>

      {/* Notes */}
      {completed && record && <NotesSection record={record} mountainId={mountain.id} updateNotes={updateNotes} updateDate={updateDate} />}
    </div>
  );
};

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function NotesSection({
  record,
  mountainId,
  updateNotes,
  updateDate,
}: {
  record: { completedAt: string; notes: string };
  mountainId: number;
  updateNotes: (id: number, notes: string) => void;
  updateDate: (id: number, date: string) => void;
}) {
  const [notes, setNotes] = useState(record.notes);
  const [date, setDate] = useState(record.completedAt.slice(0, 10));

  useEffect(() => {
    setNotes(record.notes);
    setDate(record.completedAt.slice(0, 10));
  }, [record]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-foreground">내 기록</h2>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          <Calendar className="mr-1 inline h-3.5 w-3.5" />
          방문 날짜
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            updateDate(mountainId, e.target.value);
          }}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">메모</label>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => updateNotes(mountainId, notes)}
          placeholder="등산 후기, 코스 정보, 날씨 등을 기록하세요..."
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  );
}

export default MountainDetail;
