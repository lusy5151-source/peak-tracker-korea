import { useState, useCallback, useEffect } from "react";

export type WeatherCondition = "맑음" | "구름" | "흐림" | "비" | "눈" | "안개" | "";

export interface CompletionRecord {
  mountainId: number;
  completedAt: string;
  notes: string;
  weather: WeatherCondition;
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
          { mountainId: id, completedAt: new Date().toISOString(), notes: "" },
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

  return {
    records,
    isCompleted,
    getRecord,
    toggleComplete,
    updateNotes,
    updateDate,
    completedCount: records.length,
  };
}
