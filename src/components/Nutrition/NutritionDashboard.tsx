import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  CalendarMonthRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  CloudDoneRounded,
  LocalGroceryStoreRounded,
  MenuBookRounded,
  RestaurantMenuRounded,
  UploadFileRounded,
} from "@mui/icons-material";
import {
  useGetNutritionWeeksQuery,
  useSaveNutritionWeekMutation,
} from "store/services/nutritionWeeks";
import {
  calculateShoppingProgress,
  mergeNutritionProgress,
  parseNutritionPackage,
  sumNutritionMeals,
} from "./nutritionLogic";
import {
  NutritionMeal,
  NutritionRecipe,
  StoredNutritionWeek,
} from "./nutritionTypes";
import NutritionLayout from "./NutritionDashboard.styled";

const statusLabels: Record<NutritionMeal["status"], string> = {
  pending: "Очікує",
  eaten: "З’їв",
  skipped: "Пропустив",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const details = error as Record<string, unknown>;
    if (typeof details.message === "string") return details.message;
    if (typeof details.error === "string") return details.error;
    if (typeof details.data === "string") return details.data;
  }
  return fallback;
};

const NutritionDashboard = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState(0);
  const [selectedWeekId, setSelectedWeekId] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<NutritionRecipe | null>(
    null,
  );
  const [selectedMeal, setSelectedMeal] = useState<NutritionMeal | null>(null);
  const [notice, setNotice] = useState("");
  const [localError, setLocalError] = useState("");
  const {
    data: weeks = [],
    isLoading,
    error: loadError,
  } = useGetNutritionWeeksQuery();
  const [saveWeek, { isLoading: isSaving }] = useSaveNutritionWeekMutation();

  useEffect(() => {
    if (!weeks.length || selectedWeekId) return;
    const today = dayjs().format("YYYY-MM-DD");
    const current = weeks.find(
      (week) => week.weekStart <= today && week.weekEnd >= today,
    );
    setSelectedWeekId((current || weeks[weeks.length - 1]).id);
  }, [selectedWeekId, weeks]);

  const selectedWeek = weeks.find((week) => week.id === selectedWeekId);
  const selectedWeekIndex = weeks.findIndex(
    (week) => week.id === selectedWeekId,
  );
  const shoppingProgress = useMemo(
    () => calculateShoppingProgress(selectedWeek?.shoppingTrips || []),
    [selectedWeek],
  );
  const weekTotals = useMemo(
    () =>
      selectedWeek?.days.reduce(
        (total, day) => {
          const macros = sumNutritionMeals(day.meals);
          return {
            calories: total.calories + macros.calories,
            protein: total.protein + macros.protein,
            meals: total.meals + day.meals.length,
            eaten:
              total.eaten +
              day.meals.filter((meal) => meal.status === "eaten").length,
          };
        },
        { calories: 0, protein: 0, meals: 0, eaten: 0 },
      ) || { calories: 0, protein: 0, meals: 0, eaten: 0 },
    [selectedWeek],
  );

  const persistWeek = async (week: StoredNutritionWeek) => {
    try {
      await saveWeek(week).unwrap();
      setLocalError("");
    } catch (error) {
      setLocalError(
        getErrorMessage(error, "Не вдалося зберегти зміни у Firebase."),
      );
    }
  };

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = parseNutritionPackage(await file.text());
      const current = weeks.find((week) => week.id === parsed.weekStart);
      const merged = mergeNutritionProgress(parsed, current);
      await saveWeek(merged).unwrap();
      setSelectedWeekId(merged.weekStart);
      setTab(0);
      setLocalError("");
      setNotice("Тижневий пакет із Health імпортовано у Firebase.");
    } catch (error) {
      setLocalError(getErrorMessage(error, "Не вдалося імпортувати файл."));
    }
  };

  const updateMealStatus = (
    dayDate: string,
    mealId: string,
    status: NutritionMeal["status"],
  ) => {
    if (!selectedWeek) return;
    void persistWeek({
      ...selectedWeek,
      days: selectedWeek.days.map((day) =>
        day.date === dayDate
          ? {
              ...day,
              meals: day.meals.map((meal) =>
                meal.id === mealId ? { ...meal, status } : meal,
              ),
            }
          : day,
      ),
    });
  };

  const toggleShoppingItem = (tripId: string, itemId: string) => {
    if (!selectedWeek) return;
    void persistWeek({
      ...selectedWeek,
      shoppingTrips: selectedWeek.shoppingTrips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              items: trip.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item,
              ),
            }
          : trip,
      ),
    });
  };

  const openMeal = (meal: NutritionMeal) => {
    const recipe = selectedWeek?.recipes.find(
      (candidate) => candidate.id === meal.recipeId,
    );
    if (recipe) setSelectedRecipe(recipe);
    else setSelectedMeal(meal);
  };

  const errorMessage =
    localError ||
    (loadError
      ? typeof loadError === "string"
        ? loadError
        : "Не вдалося завантажити харчування з Firebase."
      : "");

  return (
    <NutritionLayout>
      <header className="nutrition-header">
        <div>
          <Typography className="nutrition-kicker">
            Health → Follow Your Aim
          </Typography>
          <Typography className="page-title" component="h1">
            Харчування
          </Typography>
          <Typography className="page-subtitle">
            Готовий тижневий план, рецепти та закупи з проєкту Health.
          </Typography>
        </div>
        <div className="nutrition-header-actions">
          <Chip icon={<CloudDoneRounded />} label="Зберігається у Firebase" />
          <input
            ref={fileInputRef}
            hidden
            type="file"
            accept="application/json,.json"
            onChange={importFile}
          />
          <Button
            variant="contained"
            startIcon={
              isSaving ? <CircularProgress size={16} /> : <UploadFileRounded />
            }
            disabled={isSaving}
            onClick={() => fileInputRef.current?.click()}
          >
            Імпортувати з Health
          </Button>
        </div>
      </header>

      {errorMessage && (
        <Alert severity="error" onClose={() => setLocalError("")}>
          {errorMessage}
        </Alert>
      )}

      {isLoading ? (
        <div className="nutrition-loading">
          <CircularProgress />
          <Typography color="text.secondary">Завантажую тижні…</Typography>
        </div>
      ) : !selectedWeek ? (
        <Card className="dashboard-card nutrition-first-import">
          <CardContent>
            <UploadFileRounded />
            <Typography variant="h5">Імпортуй перший план із Health</Typography>
            <Typography color="text.secondary">
              Підтримуються пакети fya-nutrition-v1 і fya-nutrition-v2.
            </Typography>
            <Button
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
            >
              Вибрати JSON-файл
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="week-toolbar" aria-label="Вибір тижня">
            <IconButton
              aria-label="Попередній тиждень"
              disabled={selectedWeekIndex <= 0}
              onClick={() => setSelectedWeekId(weeks[selectedWeekIndex - 1].id)}
            >
              <ChevronLeftRounded />
            </IconButton>
            <div>
              <Typography variant="h6">
                {dayjs(selectedWeek.weekStart).locale("uk").format("D MMM")} –{" "}
                {dayjs(selectedWeek.weekEnd).locale("uk").format("D MMM YYYY")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {weekTotals.meals} прийомів · {selectedWeek.recipes.length}{" "}
                рецептів · {shoppingProgress.total} позицій закупів
              </Typography>
            </div>
            <IconButton
              aria-label="Наступний тиждень"
              disabled={selectedWeekIndex >= weeks.length - 1}
              onClick={() => setSelectedWeekId(weeks[selectedWeekIndex + 1].id)}
            >
              <ChevronRightRounded />
            </IconButton>
          </section>

          <Tabs
            className="nutrition-tabs"
            value={tab}
            onChange={(_event, value) => setTab(value)}
            aria-label="Розділи харчування"
          >
            <Tab
              icon={<CalendarMonthRounded />}
              iconPosition="start"
              label="План"
            />
            <Tab
              icon={<LocalGroceryStoreRounded />}
              iconPosition="start"
              label="Закупи"
            />
            <Tab
              icon={<MenuBookRounded />}
              iconPosition="start"
              label="Рецепти"
            />
          </Tabs>

          {tab === 0 && (
            <section
              className="nutrition-panel planner-section"
              role="tabpanel"
            >
              <div className="macro-grid">
                {[
                  ["Калорії / день", selectedWeek.targets.calories, " ккал"],
                  ["Білок / день", selectedWeek.targets.protein, " г"],
                  ["Заплановано", weekTotals.meals, " прийомів"],
                  ["Виконано", weekTotals.eaten, " із " + weekTotals.meals],
                ].map(([label, value, suffix], index) => (
                  <Card
                    className={"metric-card metric-card--" + index}
                    key={label}
                  >
                    <CardContent>
                      <span>{label}</span>
                      <strong className="metric-value">
                        {Math.round(Number(value)) + String(suffix)}
                      </strong>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="week-grid">
                {selectedWeek.days.map((day) => {
                  const totals = sumNutritionMeals(day.meals);
                  const eaten = day.meals.filter(
                    (meal) => meal.status === "eaten",
                  ).length;
                  return (
                    <Card
                      className={
                        "day-card" +
                        (day.date === dayjs().format("YYYY-MM-DD")
                          ? " day-card--today"
                          : "") +
                        (day.meals.length > 0 && eaten === day.meals.length
                          ? " day-card--complete"
                          : "")
                      }
                      key={day.date}
                    >
                      <CardContent>
                        <div className="day-heading">
                          <div>
                            <span className="day-name">
                              {dayjs(day.date).locale("uk").format("dddd")}
                            </span>
                            <span className="day-date">
                              {dayjs(day.date).format("DD.MM")}
                            </span>
                          </div>
                          <b>{Math.round(totals.calories)} ккал</b>
                        </div>
                        <div className="day-macro-row">
                          <span>Б {Math.round(totals.protein)} г</span>
                          <span>
                            Ж {totals.fat ? Math.round(totals.fat) : "—"} г
                          </span>
                          <span>
                            В {totals.carbs ? Math.round(totals.carbs) : "—"} г
                          </span>
                        </div>
                        <div className="day-progress">
                          <LinearProgress
                            variant="determinate"
                            value={
                              day.meals.length
                                ? (eaten / day.meals.length) * 100
                                : 0
                            }
                          />
                          <span>
                            {eaten}/{day.meals.length} виконано
                          </span>
                        </div>
                        {day.note && (
                          <Typography className="day-note" variant="caption">
                            {day.note}
                          </Typography>
                        )}
                        <Divider />
                        <div className="day-meals">
                          {day.meals.map((meal) => (
                            <article className="planned-meal" key={meal.id}>
                              <button
                                type="button"
                                onClick={() => openMeal(meal)}
                              >
                                <span>{meal.time}</span>
                                <strong>{meal.title}</strong>
                                <small>
                                  {meal.calories} ккал · Б {meal.protein} г
                                </small>
                              </button>
                              <select
                                className={
                                  "meal-status meal-status--" + meal.status
                                }
                                aria-label={"Статус: " + meal.title}
                                value={meal.status}
                                onChange={(event) =>
                                  updateMealStatus(
                                    day.date,
                                    meal.id,
                                    event.target
                                      .value as NutritionMeal["status"],
                                  )
                                }
                              >
                                {Object.entries(statusLabels).map(
                                  ([value, label]) => (
                                    <option value={value} key={value}>
                                      {label}
                                    </option>
                                  ),
                                )}
                              </select>
                            </article>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {tab === 1 && (
            <section
              className="nutrition-panel shopping-section"
              role="tabpanel"
            >
              <div className="nutrition-section-heading">
                <div>
                  <Typography variant="h5">Закупи на тиждень</Typography>
                  <Typography color="text.secondary">
                    {shoppingProgress.checked} із {shoppingProgress.total}{" "}
                    куплено
                    {shoppingProgress.estimatedPrice
                      ? " · орієнтовно " +
                        shoppingProgress.estimatedPrice.toFixed(0) +
                        " PLN"
                      : ""}
                  </Typography>
                </div>
              </div>
              {selectedWeek.shoppingTrips.length ? (
                <div className="shopping-grid">
                  {selectedWeek.shoppingTrips.map((trip) => {
                    const checked = trip.items.filter(
                      (item) => item.checked,
                    ).length;
                    return (
                      <Card
                        className="dashboard-card shopping-card"
                        key={trip.id}
                      >
                        <CardContent>
                          <div className="card-heading">
                            <div>
                              <Typography variant="h6">{trip.title}</Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {[trip.plannedDate, trip.store]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </Typography>
                            </div>
                            <Chip label={checked + "/" + trip.items.length} />
                          </div>
                          <LinearProgress
                            variant="determinate"
                            value={
                              trip.items.length
                                ? (checked / trip.items.length) * 100
                                : 0
                            }
                          />
                          <Divider />
                          <div className="shopping-list">
                            {trip.items.map((item) => (
                              <FormControlLabel
                                key={item.id}
                                className={
                                  item.checked
                                    ? "shopping-item is-checked"
                                    : "shopping-item"
                                }
                                control={
                                  <Checkbox
                                    checked={item.checked}
                                    onChange={() =>
                                      toggleShoppingItem(trip.id, item.id)
                                    }
                                  />
                                }
                                label={
                                  <span>
                                    <strong>{item.name}</strong>
                                    <small>
                                      {[item.quantity, item.unit, item.category]
                                        .filter(
                                          (part) =>
                                            part !== undefined && part !== "",
                                        )
                                        .join(" ")}
                                      {item.estimatedPrice
                                        ? " · " +
                                          item.estimatedPrice.toFixed(2) +
                                          " PLN"
                                        : ""}
                                    </small>
                                  </span>
                                }
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Alert severity="info">
                  У цьому пакеті ще немає закупів. Додай shoppingTrips у Health
                  і повторно імпортуй файл.
                </Alert>
              )}
            </section>
          )}

          {tab === 2 && (
            <section
              className="nutrition-panel recipes-section"
              role="tabpanel"
            >
              <div className="nutrition-section-heading">
                <div>
                  <Typography variant="h5">Рецепти й підготовка</Typography>
                  <Typography color="text.secondary">
                    Інгредієнти, кроки, заготовки та зберігання.
                  </Typography>
                </div>
              </div>
              <div className="recipes-grid">
                {selectedWeek.recipes.map((recipe) => (
                  <Card
                    className="dashboard-card recipe-card"
                    key={recipe.id}
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <CardContent>
                      <RestaurantMenuRounded color="primary" />
                      <Typography variant="h6">{recipe.title}</Typography>
                      <Typography color="text.secondary">
                        {recipe.portions} порції
                        {recipe.caloriesPerPortion
                          ? " · " + recipe.caloriesPerPortion + " ккал/порція"
                          : ""}
                      </Typography>
                      <Typography className="recipe-preview">
                        {recipe.ingredients.slice(0, 3).join(" · ")}
                      </Typography>
                      <Button size="small">Відкрити рецепт</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Dialog
        open={Boolean(selectedRecipe || selectedMeal)}
        onClose={() => {
          setSelectedRecipe(null);
          setSelectedMeal(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedRecipe?.title || selectedMeal?.title}
        </DialogTitle>
        <DialogContent dividers className="recipe-dialog-content">
          {selectedRecipe ? (
            <>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={selectedRecipe.portions + " порції"} />
                {selectedRecipe.caloriesPerPortion !== undefined && (
                  <Chip
                    label={selectedRecipe.caloriesPerPortion + " ккал/порція"}
                  />
                )}
              </Stack>
              <Typography variant="h6">Інгредієнти</Typography>
              <ul>
                {selectedRecipe.ingredients.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Typography variant="h6">Приготування</Typography>
              <ol>
                {selectedRecipe.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              {selectedRecipe.prepNotes?.length ? (
                <>
                  <Typography variant="h6">Заготовки</Typography>
                  <ul>
                    {selectedRecipe.prepNotes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {selectedRecipe.storage?.length ? (
                <>
                  <Typography variant="h6">Зберігання</Typography>
                  <ul>
                    {selectedRecipe.storage.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          ) : (
            <>
              <Typography>{selectedMeal?.description}</Typography>
              <Typography color="text.secondary">
                {selectedMeal?.calories} ккал · білок {selectedMeal?.protein} г
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSelectedRecipe(null);
              setSelectedMeal(null);
            }}
          >
            Закрити
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3500}
        onClose={() => setNotice("")}
        message={notice}
      />
    </NutritionLayout>
  );
};

export default NutritionDashboard;
