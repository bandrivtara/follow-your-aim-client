import dayjs, { Dayjs } from "dayjs";

export const APPLE_HEALTH_SHORTCUT_NAME = "FYA Sync Health";
export const APPLE_HEALTH_PENDING_KEY = "fya.appleHealth.pendingSync";
export const APPLE_HEALTH_SYNC_MAX_AGE_MS = 15 * 60 * 1000;

export interface PendingAppleHealthSync {
  nonce: string;
  createdAt: number;
}

export interface AppleHealthSyncPayload {
  nonce: string;
  date: string;
  steps: number;
  activeCalories: number;
}

export type AppleHealthSyncResult =
  | { payload: AppleHealthSyncPayload; error?: never }
  | { payload?: never; error: string };

const parseHealthNumber = (rawValue: string | null, max: number) => {
  if (!rawValue) return null;

  const compactValue = rawValue
    .replace(/[\s\u00a0\u202f]/g, "")
    .replace(/[^\d,.-]/g, "");
  const hasComma = compactValue.includes(",");
  const hasDot = compactValue.includes(".");
  const singleSeparatorParts = compactValue.split(hasComma ? "," : ".");
  const looksLikeThousands =
    hasComma !== hasDot &&
    singleSeparatorParts.length === 2 &&
    singleSeparatorParts[1].length === 3;
  const normalizedValue = looksLikeThousands
    ? compactValue.replace(/[,.]/g, "")
    : hasComma && !hasDot
      ? compactValue.replace(",", ".")
      : compactValue.replace(/,/g, "");
  const value = Number(normalizedValue);

  if (!Number.isFinite(value) || value < 0 || value > max) return null;
  return Math.round(value);
};

export const createAppleHealthNonce = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const buildAppleHealthCallbackUrl = (
  origin: string,
  pathname: string,
  nonce: string,
) =>
  `${origin}${pathname}#/?healthSync=${encodeURIComponent(nonce)}`;

export const buildAppleHealthShortcutUrl = (callbackUrl: string) =>
  `shortcuts://run-shortcut?name=${encodeURIComponent(
    APPLE_HEALTH_SHORTCUT_NAME,
  )}&input=text&text=${encodeURIComponent(callbackUrl)}`;

export const parseAppleHealthCallback = (
  search: string,
  pendingSync: PendingAppleHealthSync | null,
  now: Dayjs = dayjs(),
): AppleHealthSyncResult => {
  const params = new URLSearchParams(search);
  const nonce = params.get("healthSync") || "";

  if (!nonce) return { error: "Відсутній код синхронізації." };
  if (!pendingSync || pendingSync.nonce !== nonce) {
    return { error: "Запит синхронізації не підтверджено цим пристроєм." };
  }
  if (Date.now() - pendingSync.createdAt > APPLE_HEALTH_SYNC_MAX_AGE_MS) {
    return { error: "Час очікування Apple Health минув. Запусти синхронізацію ще раз." };
  }

  const date = params.get("date") || "";
  if (date !== now.format("YYYY-MM-DD")) {
    return { error: "Apple Health повернув дані не за сьогоднішню дату." };
  }

  const steps = parseHealthNumber(params.get("steps"), 200_000);
  const activeCalories = parseHealthNumber(
    params.get("activeCalories"),
    20_000,
  );

  if (steps === null || activeCalories === null) {
    return { error: "Не вдалося розпізнати кроки або активні калорії." };
  }

  return {
    payload: { nonce, date, steps, activeCalories },
  };
};
