export interface StoredFocusTimerSession {
  elapsedSeconds: number;
}

export const isMinuteUnit = (unit = "") => {
  const normalized = unit.trim().toLocaleLowerCase("uk-UA");
  return (
    normalized === "хв" ||
    normalized.startsWith("хвил") ||
    normalized === "min" ||
    normalized.startsWith("minute")
  );
};

export const getFocusTimerStorageKey = (
  date: string,
  habitId: string,
  fieldId: string,
) => `fya.focus-timer.v1.${date}.${habitId}.${fieldId}`;

export const parseFocusTimerSession = (
  value: string | null,
): StoredFocusTimerSession => {
  if (!value) return { elapsedSeconds: 0 };

  try {
    const parsed = JSON.parse(value);
    const elapsedSeconds = Number(parsed?.elapsedSeconds);
    return {
      elapsedSeconds: Number.isFinite(elapsedSeconds)
        ? Math.max(0, Math.floor(elapsedSeconds))
        : 0,
    };
  } catch {
    return { elapsedSeconds: 0 };
  }
};

export const getRecordedMinutes = (elapsedSeconds: number) =>
  Number((Math.max(0, elapsedSeconds) / 60).toFixed(1));

export const formatFocusTime = (elapsedSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(elapsedSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const time = [minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");

  return hours ? `${String(hours).padStart(2, "0")}:${time}` : time;
};
