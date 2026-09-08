export interface MacroTargets {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface NutritionPreferences {
  targets: MacroTargets;
  goalNote: string;
  likedFoods: string[];
  dislikedFoods: string[];
  likedMeals: string[];
  dislikedMeals: string[];
}

export interface PlannedMeal {
  name: string;
  meal: "breakfast" | "lunch" | "dinner" | "other";
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  fatSecretFoodId?: string;
  fatSecretServingId?: string;
  units?: number;
}

export interface NutritionPlanDay {
  date: string;
  meals: PlannedMeal[];
}

export interface NutritionDiarySummary extends MacroTargets {
  date: string;
  fiber?: number;
  entriesCount: number;
  syncedAt: string;
}

export interface NutritionConnectionStatus {
  configured: boolean;
  connected: boolean;
  accountLabel?: string;
}

export const EMPTY_TARGETS: MacroTargets = {
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
};

export const DEFAULT_PREFERENCES: NutritionPreferences = {
  targets: EMPTY_TARGETS,
  goalNote: "",
  likedFoods: [],
  dislikedFoods: [],
  likedMeals: [],
  dislikedMeals: [],
};
