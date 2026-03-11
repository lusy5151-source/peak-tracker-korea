import { useState } from "react";
import { AlertTriangle, TreePine, CloudLightning, Construction, ChevronRight, X, Flame, Shield, Info, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AnnouncementCategory = "all" | "app" | "mountain" | "event";
type AlertType = "trail_closure" | "weather_alert" | "wildfire" | "app_update" | "event";

interface Announcement {
  id: string;
  title: string;
  mountainName?: string;
  date: string;
  description: string;
  fullDescription: string;
  category: AnnouncementCategory;
  alertType: AlertType;
  severity: "info" | "warning" | "critical";
  source?: string;
}

const alertIcons: Record<AlertType, typeof AlertTriangle> = {
  trail_closure: Construction,
  weather_alert: CloudLightning,
  wildfire: Flame,
  app_update: Info,
  event: Megaphone,
};

const severityStyles: Record<string, string> = {
  info: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-800",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  critical: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
};

const severityIconBg: Record<string, string> = {
  info: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400",
  warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  critical: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
};

const severityBadge: Record<string, string> = {
  info: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const categoryLabels: Record<AnnouncementCategory, string> = {
  all: "전체",
  app: "앱 업데이트",
  mountain: "산악 정보",
  event: "이벤트",
};

// Mock announcements combining all data sources
const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "설악산 공룡능선 탐방로 통제",
    mountainName: "설악산",
    date: "2026-03-10",
    description: "해빙기 낙석 위험으로 공룡능선 탐방로가 임시 통제됩니다.",
    fullDescription: "국립공원공단에서 해빙기 안전사고 예방을 위해 설악산 공룡능선 탐방로를 2026년 3월 10일부터 4월 15일까지 임시 통제합니다. 낙석 및 낙빙 위험이 있으니 등산 시 주의하시기 바랍니다. 대체 탐방로로 천불동계곡 코스를 이용하시기 바랍니다.",
    category: "mountain",
    alertType: "trail_closure",
    severity: "warning",
    source: "국립공원공단",
  },
  {
    id: "2",
    title: "지리산 산악기상 특보 발효",
    mountainName: "지리산",
    date: "2026-03-11",
    description: "강풍주의보 발효 중. 능선부 풍속 20m/s 이상 예상.",
    fullDescription: "기상청에서 지리산 일대 강풍주의보를 발효했습니다. 능선부 풍속 20m/s 이상이 예상되며 체감온도가 급격히 낮아질 수 있습니다. 3월 11일~12일 동안 능선 산행을 자제해 주시기 바랍니다. 특히 천왕봉~중산리 구간은 바람이 매우 강할 수 있어 각별한 주의가 필요합니다.",
    category: "mountain",
    alertType: "weather_alert",
    severity: "critical",
    source: "기상청",
  },
  {
    id: "3",
    title: "경북 일부 지역 산불 위험 높음",
    mountainName: "팔공산",
    date: "2026-03-09",
    description: "건조한 날씨로 산불 위험도가 '높음' 단계입니다.",
    fullDescription: "산림청에서 경북 일부 지역의 산불 위험 등급을 '높음'으로 상향했습니다. 팔공산 일대를 포함한 경북 동부 지역에서 건조한 날씨가 지속되고 있으며, 입산 시 화기 취급을 절대 금지합니다. 산불 신고: 119 또는 산림청 1688-3119",
    category: "mountain",
    alertType: "wildfire",
    severity: "critical",
    source: "산림청",
  },
  {
    id: "4",
    title: "완등 앱 v2.5 업데이트 안내",
    date: "2026-03-08",
    description: "SNS 공유 카드 디자인 개선 및 공동 완등 기능이 업데이트되었습니다.",
    fullDescription: "완등 앱 v2.5 업데이트 내용:\n\n• SNS 공유 카드 디자인이 4:5 비율로 변경되어 Instagram에 최적화되었습니다.\n• 공동 완등 기능이 개선되어 참가자 관리가 더 쉬워졌습니다.\n• 등산 일지에 코스 정보를 더 상세하게 기록할 수 있습니다.\n• 다양한 버그 수정 및 성능 개선",
    category: "app",
    alertType: "app_update",
    severity: "info",
    source: "완등 팀",
  },
  {
    id: "5",
    title: "북한산 봄맞이 등산 축제",
    mountainName: "북한산",
    date: "2026-03-15",
    description: "3월 15일~16일 북한산 둘레길 봄 축제가 개최됩니다.",
    fullDescription: "북한산 국립공원에서 봄맞이 등산 축제를 개최합니다.\n\n일시: 2026년 3월 15일(토) ~ 16일(일)\n장소: 북한산 둘레길 일대\n\n프로그램:\n• 야생화 탐방 프로그램\n• 등산 안전교육\n• 포토 스팟 이벤트\n• 참가자 선착순 기념품 증정\n\n참가 신청: 국립공원공단 홈페이지",
    category: "event",
    alertType: "event",
    severity: "info",
    source: "국립공원공단",
  },
  {
    id: "6",
    title: "덕유산 향적봉 코스 일부 구간 통제",
    mountainName: "덕유산",
    date: "2026-03-07",
    description: "등산로 보수공사로 인해 일부 구간이 통제됩니다.",
    fullDescription: "덕유산 향적봉 등산 코스 중 중봉~향적봉 구간이 등산로 보수공사로 인해 2026년 3월 7일부터 3월 31일까지 통제됩니다. 무주리조트 곤돌라를 이용한 향적봉 접근은 가능합니다.",
    category: "mountain",
    alertType: "trail_closure",
    severity: "warning",
    source: "국립공원공단",
  },
];

export function AnnouncementSection() {
  const [selectedCategory, setSelectedCategory] = useState<AnnouncementCategory>("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const filtered = selectedCategory === "all"
    ? mockAnnouncements
    : mockAnnouncements.filter((a) => a.category === selectedCategory);

  // Count critical/warning alerts
  const alertCount = mockAnnouncements.filter((a) => a.severity === "critical" || a.severity === "warning").length;

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {(Object.keys(categoryLabels) as AnnouncementCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {categoryLabels[cat]}
            {cat === "mountain" && alertCount > 0 && (
              <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {alertCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Announcement cards */}
      <div className="space-y-2">
        {filtered.map((announcement) => {
          const Icon = alertIcons[announcement.alertType];
          return (
            <button
              key={announcement.id}
              onClick={() => setSelectedAnnouncement(announcement)}
              className={`w-full text-left rounded-2xl border p-4 transition-all hover:shadow-md ${severityStyles[announcement.severity]}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${severityIconBg[announcement.severity]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold truncate">{announcement.title}</p>
                    {announcement.severity === "critical" && (
                      <Badge className={`text-[9px] px-1.5 py-0 h-4 ${severityBadge[announcement.severity]}`}>긴급</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] opacity-70">
                    {announcement.mountainName && (
                      <span className="flex items-center gap-0.5">
                        <TreePine className="h-3 w-3" /> {announcement.mountainName}
                      </span>
                    )}
                    <span>{announcement.date}</span>
                    {announcement.source && <span>· {announcement.source}</span>}
                  </div>
                  <p className="text-xs mt-1 line-clamp-1 opacity-80">{announcement.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-40 mt-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail modal */}
      {selectedAnnouncement && (
        <AnnouncementDetail
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}
    </div>
  );
}

function AnnouncementDetail({ announcement, onClose }: { announcement: Announcement; onClose: () => void }) {
  const Icon = alertIcons[announcement.alertType];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-card border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`rounded-t-3xl sm:rounded-t-3xl p-5 ${severityStyles[announcement.severity]}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${severityIconBg[announcement.severity]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">{announcement.title}</h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs opacity-70">
                  {announcement.mountainName && (
                    <span className="flex items-center gap-0.5">
                      <TreePine className="h-3 w-3" /> {announcement.mountainName}
                    </span>
                  )}
                  <span>{announcement.date}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-black/10 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {announcement.source && (
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">출처: {announcement.source}</span>
            </div>
          )}
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
            {announcement.fullDescription}
          </p>
          <Button className="w-full rounded-xl" onClick={onClose}>
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
