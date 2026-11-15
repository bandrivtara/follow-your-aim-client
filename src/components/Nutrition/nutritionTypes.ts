export interface NutritionTargets {
  calories: number;
  protein: number;
  fat?: number;
  carbs?: number;
  fiber?: number;
  saturatedFat?: number;
}

export type NutritionMealStatus = "pending" | "eaten" | "skipped";

export interface NutritionMeal {
  id: string;
  title: string;
  time: string;
  calories: number;
  protein: number;
  fat?: number;
  carbs?: number;
  fiber?: number;
  portionDescription?: string;
  description?: string;
  recipeId?: string;
  status: NutritionMealStatus;
  failureReason?: string;
}

export interface NutritionDay {
  date: string;
  note?: string;
  meals: NutritionMeal[];
}

export interface NutritionRecipe {
  id: string;
  title: string;
  portions: number;
  caloriesPerPortion?: number;
  activeMinutes?: number;
  totalMinutes?: number;
  equipment?: string[];
  ingredients: string[];
  steps: string[];
  storage?: string[];
  prepNotes?: string[];
}

export interface NutritionShoppingItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  estimatedPrice?: number;
  checked: boolean;
}

export interface NutritionShoppingTrip {
  id: string;
  title: string;
  plannedDate?: string;
  store?: string;
  items: NutritionShoppingItem[];
}

export interface NutritionPrepTask {
  id: string;
  title: string;
  quantity?: number;
  unit?: string;
  destination?: string;
  useDates: string[];
  dependsOnShoppingTripId?: string;
  checked: boolean;
}

export interface NutritionPrepSession {
  id: string;
  plannedDate?: string;
  plannedTime?: string;
  title: string;
  estimatedActiveMinutes?: number;
  equipment: string[];
  tasks: NutritionPrepTask[];
}

export interface NutritionDefrostStep {
  moveToFridgeDate: string;
  useDate: string;
  portions: number;
}

export interface NutritionFreezerBatch {
  id: string;
  recipeId?: string;
  title: string;
  plannedPrepDate?: string;
  totalPortions: number;
  currentWeekPortions: number;
  reservePortions: number;
  packSizePortions?: number;
  defrostPlan: NutritionDefrostStep[];
  finishAfterDefrost?: string;
  inventoryStatus?: string;
}

export interface NutritionWeek {
  schemaVersion: "fya-nutrition-v1" | "fya-nutrition-v2";
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  importedAt: string;
  targets: NutritionTargets;
  approvedProducts: string[];
  excludedProducts: string[];
  candidateProducts: string[];
  days: NutritionDay[];
  recipes: NutritionRecipe[];
  shoppingTrips: NutritionShoppingTrip[];
  prepSessions: NutritionPrepSession[];
  freezerBatches: NutritionFreezerBatch[];
}

export interface StoredNutritionWeek extends NutritionWeek {
  id: string;
  updatedAt: number;
}
