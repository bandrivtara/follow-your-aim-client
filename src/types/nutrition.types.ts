export type NutritionMealStatus = "pending" | "eaten" | "skipped";
export type NutritionSchemaVersion = "fya-nutrition-v1" | "fya-nutrition-v2";

export interface INutritionMeal {
  id: string;
  title: string;
  time: string;
  calories: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  fiber?: number;
  saturatedFat?: number;
  portionDescription?: string;
  description?: string;
  recipeId?: string;
  householdOverrides?: INutritionHouseholdOverride[];
  status?: NutritionMealStatus;
  skippedReason?: string;
  comment?: string;
}

export interface INutritionHouseholdOverride {
  participantId: string;
  title: string;
  portionDescription?: string;
  notes?: string;
}

export interface INutritionRecipe {
  id: string;
  title: string;
  ingredients: string[];
  steps: string[];
  portions?: number;
  caloriesPerPortion?: number;
  portionDescription?: string;
  batchIngredients?: string[];
}

export interface INutritionSettings {
  calorieTarget: number;
  proteinTarget?: number;
  fatTarget?: number;
  carbsTarget?: number;
  fiberTarget?: number;
  saturatedFatTarget?: number;
  defaultMealTimes?: string[];
  approvedProducts?: string[];
  excludedProducts?: string[];
  candidateProducts?: string[];
  weighingRules?: string[];
  updatedAt?: number;
}

export interface INutritionPlanDay {
  date: string;
  meals: INutritionMeal[];
  note?: string;
}

export interface INutritionHouseholdParticipant {
  id: string;
  name: string;
  tracked?: boolean;
}

export interface INutritionHousehold {
  participants: INutritionHouseholdParticipant[];
  defaultSharedMeals?: boolean;
  notes?: string;
}

export interface INutritionCheatMeal {
  requiresConfirmation?: boolean;
  status?: string;
  plannedDate: string;
  plannedTime?: string;
  maxCalories?: number;
  mealTitle?: string;
  participants?: string[];
  alcoholPlanned?: boolean | null;
  includedInWeeklyBudget?: boolean;
  notes?: string;
}

export interface INutritionWeeklyEvents {
  cheatMeal?: INutritionCheatMeal;
}

export interface INutritionShoppingItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  estimatedPrice?: number;
}

export interface INutritionShoppingTrip {
  id: string;
  title: string;
  plannedDate: string;
  store?: string;
  estimatedTotal?: number;
  currency?: string;
  priceCheckedAt?: string;
  priceAccuracy?: string;
  items: INutritionShoppingItem[];
}

export interface INutritionPrepTask {
  id: string;
  title: string;
  quantity?: number;
  unit?: string;
  destination?: string;
  useDates?: string[];
  dependsOnShoppingTripId?: string;
}

export interface INutritionPrepSession {
  id: string;
  plannedDate: string;
  plannedTime?: string;
  title: string;
  estimatedActiveMinutes?: number;
  equipment?: string[];
  tasks: INutritionPrepTask[];
}

export interface INutritionDefrostEntry {
  moveToFridgeDate: string;
  useDate: string;
  portions?: number;
}

export interface INutritionFreezerBatch {
  id: string;
  recipeId?: string;
  title: string;
  plannedPrepDate?: string;
  totalPortions?: number;
  currentWeekPortions?: number;
  reservePortions?: number;
  packSizePortions?: number;
  defrostPlan?: INutritionDefrostEntry[];
  finishAfterDefrost?: string;
  inventoryStatus?: string;
}

export interface INutritionWeekPlan {
  id?: string;
  schemaVersion: NutritionSchemaVersion;
  weekStart: string;
  weekEnd: string;
  days: INutritionPlanDay[];
  recipes: INutritionRecipe[];
  household?: INutritionHousehold;
  weeklyEvents?: INutritionWeeklyEvents;
  shoppingTrips?: INutritionShoppingTrip[];
  prepSessions?: INutritionPrepSession[];
  freezerBatches?: INutritionFreezerBatch[];
  generatedAt?: string;
  updatedAt?: number;
}

export interface INutritionDayLog {
  id?: string;
  date: string;
  targetCalories: number;
  meals: INutritionMeal[];
  dailyComment?: string;
  consumedCalories?: number;
  consumedProtein?: number;
  consumedFat?: number;
  consumedCarbs?: number;
  consumedFiber?: number;
  finalizedAt?: number;
  syncedToHistoryAt?: number;
  updatedAt?: number;
}

export interface INutritionImportBundle {
  schemaVersion: NutritionSchemaVersion;
  exportedAt?: string;
  settings: INutritionSettings;
  plan: INutritionWeekPlan;
  household?: INutritionHousehold;
  weeklyEvents?: INutritionWeeklyEvents;
  shoppingTrips?: INutritionShoppingTrip[];
  prepSessions?: INutritionPrepSession[];
  freezerBatches?: INutritionFreezerBatch[];
}
