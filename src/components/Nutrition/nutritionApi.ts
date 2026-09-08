import {
  NutritionConnectionStatus,
  NutritionDiarySummary,
  NutritionPlanDay,
} from "./nutritionTypes";

const API_BASE = (process.env.REACT_APP_NUTRITION_API_BASE_URL || "").replace(/\/$/, "");

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  if (!API_BASE) throw new Error("Backend харчування ще не налаштовано.");
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Помилка інтеграції FatSecret.");
  return body as T;
};

export const nutritionApi = {
  isConfigured: Boolean(API_BASE),
  status: () => request<NutritionConnectionStatus>("/nutrition/status"),
  connectUrl: API_BASE ? `${API_BASE}/nutrition/oauth/start` : "",
  syncDay: (date: string) =>
    request<NutritionDiarySummary>(`/nutrition/diary?date=${encodeURIComponent(date)}`),
  publishPlan: (days: NutritionPlanDay[]) =>
    request<{ created: number; skipped: number }>("/nutrition/plans/publish", {
      method: "POST",
      body: JSON.stringify({ days }),
    }),
};
