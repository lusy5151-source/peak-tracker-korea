import { useState, useCallback, useEffect } from "react";

export type WeatherCondition = "맑음" | "구름" | "흐림" | "비" | "눈" | "안개" | "";

export interface CompletionRecord {
  mountainId: number;
  completedAt: string;
  notes: string;
  weather: WeatherCondition;
  photos: string[]; // base64 data URLs
  taggedFriends?: string[]; // user_ids of tagged friends
  courseName?: string;
  courseStartingPoint?: string;
  courseNotes?: string;
  duration?: string; // e.g. "3시간 30분"
  difficulty?: string; // personal perceived difficulty
}

const STORAGE_KEY = "korea-100-mountains";

function loadRecords(): CompletionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: CompletionRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function useMountainStore() {
  const [records, setRecords] = useState<CompletionRecord[]>(loadRecords);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  const isCompleted = useCallback(
    (id: number) => records.some((r) => r.mountainId === id),
    [records]
  );

  const getRecord = useCallback(
    (id: number) => records.find((r) => r.mountainId === id),
    [records]
  );

  const toggleComplete = useCallback(
    (id: number) => {
      setRecords((prev) => {
        if (prev.some((r) => r.mountainId === id)) {
          return prev.filter((r) => r.mountainId !== id);
        }
        return [
          ...prev,
          {
            mountainId: id,
            completedAt: new Date().toISOString(),
            notes: "",
            weather: "",
            photos: [],
            taggedFriends: [],
            courseName: "",
            courseStartingPoint: "",
            courseNotes: "",
            duration: "",
            difficulty: "",
          },
        ];
      });
    },
    []
  );

  const updateNotes = useCallback((id: number, notes: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.mountainId === id ? { ...r, notes } : r))
    );
  }, []);

  const updateDate = useCallback((id: number, date: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.mountainId === id ? { ...r, completedAt: date } : r))
    );
  }, []);

  const updateWeather = useCallback((id: number, weather: WeatherCondition) => {
    setRecords((prev) =>
      prev.map((r) => (r.mountainId === id ? { ...r, weather } : r))
    );
  }, []);

  const addPhotos = useCallback((id: number, newPhotos: string[]) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.mountainId === id ? { ...r, photos: [...(r.photos || []), ...newPhotos] } : r
      )
    );
  }, []);

  const removePhoto = useCallback((id: number, index: number) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.mountainId === id
          ? { ...r, photos: (r.photos || []).filter((_, i) => i !== index) }
          : r
      )
    );
  }, []);

  const updateTaggedFriends = useCallback((id: number, taggedFriends: string[]) => {
    setRecords((prev) =>
      prev.map((r) => (r.mountainId === id ? { ...r, taggedFriends } : r))
    );
  }, []);

  const updateCourseInfo = useCallback(
    (id: number, course: { courseName?: string; courseStartingPoint?: string; courseNotes?: string }) => {
      setRecords((prev) =>
        prev.map((r) => (r.mountainId === id ? { ...r, ...course } : r))
      );
    },
    []
  );

  const updateDuration = useCallback((id: number, duration: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.mountainId === id ? { ...r, duration } : r))
    );
  }, []);

  const updateDifficulty = useCallback((id: number, difficulty: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.mountainId === id ? { ...r, difficulty } : r))
    );
  }, []);

  return {
    records,
    isCompleted,
    getRecord,
    toggleComplete,
    updateNotes,
    updateDate,
    updateWeather,
    addPhotos,
    removePhoto,
    updateTaggedFriends,
    updateCourseInfo,
    updateDuration,
    updateDifficulty,
    completedCount: records.length,
  };
}
