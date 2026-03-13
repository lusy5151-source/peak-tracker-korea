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
const mockAnnouncements: Announcement[] = [];

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
