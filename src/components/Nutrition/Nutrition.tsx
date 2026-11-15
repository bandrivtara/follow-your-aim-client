import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import DoneAllOutlined from "@mui/icons-material/DoneAllOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import PrintOutlined from "@mui/icons-material/PrintOutlined";
import ShareOutlined from "@mui/icons-material/ShareOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import RestaurantMenuOutlined from "@mui/icons-material/RestaurantMenuOutlined";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/uk";
import { useGetHabitListQuery } from "store/services/habits";
import {
  useGetNutritionDayQuery,
  useGetNutritionDaysBetweenQuery,
  useGetNutritionPlanQuery,
  useGetNutritionSettingsQuery,
  useImportNutritionBundleMutation,
  useLazyGetNutritionDayQuery,
  useLazyGetNutritionPlanQuery,
  useSaveNutritionDayMutation,
} from "store/services/nutrition";
import {
  useGetHistoryBetweenDatesQuery,
  useUpdateHistoryMutation,
} from "store/services/history";
import { getDashboardActivitiesForDate } from "components/Main/dashboardCalculations";
import { INutritionDayLog, INutritionMeal } from "types/nutrition.types";
import {
  buildNutritionAnalysisExport,
  buildNutritionDayDraft,
  buildTelegramPlanText,
  calculateNutritionTotals,
  downloadJson,
  getNutritionWeekStart,
  getPlanDay,
  hasMissingSkipReason,
  isNutritionHabitTitle,
  parseNutritionBundle,
  printNutritionRecipes,
  printWeeklyNutritionPlan,
} from "./nutritionUtils";
import NutritionWeekOverview from "./NutritionWeekOverview";
import NutritionOperations from "./NutritionOperations";

const mealStatusOptions = [
  { value: "pending", label: "Очікує" },
  { value: "eaten", label: "З'їв" },
  { value: "skipped", label: "Не з'їв" },
] as const;

const getTimeLabel = (value: unknown) =>
  Array.isArray(value) && value.length >= 2
    ? `${String(value[0]).padStart(2, "0")}:${String(value[1]).padStart(2, "0")}`
    : "час не вказано";

const Nutrition = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [draft, setDraft] = useState<INutritionDayLog | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [autoSyncDone, setAutoSyncDone] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const weekStart = getNutritionWeekStart(selectedDate);
  const weekEnd = weekStart.add(6, "day");
  const settings = useGetNutritionSettingsQuery();
  const plan = useGetNutritionPlanQuery(weekStart.format("YYYY-MM-DD"));
  const dayLog = useGetNutritionDayQuery(selectedDate.format("YYYY-MM-DD"));
  const weekLogs = useGetNutritionDaysBetweenQuery({
    dateFrom: weekStart.format("YYYY-MM-DD"),
    dateTo: weekEnd.format("YYYY-MM-DD"),
  });
  const habits = useGetHabitListQuery();
  const history = useGetHistoryBetweenDatesQuery([
    weekStart.startOf("month").unix(),
    weekEnd.startOf("month").unix(),
  ]);
  const [saveDay, saveState] = useSaveNutritionDayMutation();
  const [importBundle, importState] = useImportNutritionBundleMutation();
  const [updateHistory] = useUpdateHistoryMutation();
  const [loadNutritionDay] = useLazyGetNutritionDayQuery();
  const [loadNutritionPlan] = useLazyGetNutritionPlanQuery();

  const planDay = useMemo(
    () => getPlanDay(plan.data || null, selectedDate),
    [plan.data, selectedDate],
  );
  const calorieTarget = Number(settings.data?.calorieTarget || 2000);

  useEffect(() => {
    if (dayLog.isFetching || plan.isFetching) return;
    setDraft(
      buildNutritionDayDraft(
        selectedDate,
        planDay,
        dayLog.data || null,
        calorieTarget,
      ),
    );
    setIsDirty(false);
  }, [calorieTarget, dayLog.data, dayLog.isFetching, plan.isFetching, planDay, selectedDate]);

  const totals = useMemo(
    () => calculateNutritionTotals(draft?.meals || []),
    [draft?.meals],
  );
  const progress = draft?.targetCalories
    ? Math.min(100, Math.round((totals.calories / draft.targetCalories) * 100))
    : 0;

  const strengthTrainings = useMemo(() => {
    const strengthHabits = (habits.data || []).filter((habit) =>
      /силов|тренажер|gym|strength/i.test(habit.title),
    );
    const items: string[] = [];
    for (let index = 0; index < 7; index += 1) {
      const date = weekStart.add(index, "day");
      const activities = getDashboardActivitiesForDate(
        (history.data || []) as Record<string, any>[],
        date,
        habits.data || [],
      );
      strengthHabits.forEach((habit) => {
        const activity = activities.find((item) => item.id === habit.id);
        if (!activity?.isPlanned) return;
        const source = activity.source as Record<string, unknown>;
        items.push(
          `${date.locale("uk").format("dd, DD.MM")} · ${getTimeLabel(source.startTime || habit.startTime)}`,
        );
      });
    }
    return items;
  }, [habits.data, history.data, weekStart]);

  const saveWithTrackerSync = useCallback(async (
    log: INutritionDayLog,
    date: Dayjs,
    finalize: boolean,
  ) => {
    const dayTotals = calculateNutritionTotals(log.meals);
    const timestamp = Math.floor(Date.now() / 1000);
    const nutritionHabit = (habits.data || []).find((habit) =>
      isNutritionHabitTitle(habit.title),
    );
    let syncedToHistoryAt = log.syncedToHistoryAt;
    if (nutritionHabit) {
      const firstField = nutritionHabit.fields?.[0];
      const activity: Record<string, unknown> = {
        id: nutritionHabit.id,
        type: "habit",
        valueType: nutritionHabit.valueType,
        isPlanned: true,
        status: dayTotals.calories > 0 ? "done" : "failed",
        progress: log.targetCalories
          ? Math.min(100, Math.round((dayTotals.calories / log.targetCalories) * 100))
          : 0,
        nutritionalData: {
          calories: dayTotals.calories,
          protein: dayTotals.protein,
          targetCalories: log.targetCalories,
        },
      };
      if (nutritionHabit.valueType === "measures" && firstField?.id) {
        activity.measures = {
          [firstField.id]: {
            value: dayTotals.calories,
            plannedValue: log.targetCalories,
          },
        };
      }
      await updateHistory({
        id: date.format("YYYY-MM"),
        path: `${date.format("D")}.${nutritionHabit.id}`,
        data: activity,
      }).unwrap();
      syncedToHistoryAt = timestamp;
    }
    await saveDay({
      ...log,
      consumedCalories: dayTotals.calories,
      consumedProtein: dayTotals.protein,
      consumedFat: dayTotals.fat,
      consumedCarbs: dayTotals.carbs,
      consumedFiber: dayTotals.fiber,
      finalizedAt: finalize ? timestamp : log.finalizedAt,
      syncedToHistoryAt,
    }).unwrap();
    return Boolean(nutritionHabit);
  }, [habits.data, saveDay, updateHistory]);

  useEffect(() => {
    if (autoSyncDone || habits.isFetching) return;
    const run = async () => {
      setAutoSyncDone(true);
      const yesterday = dayjs().subtract(1, "day");
      const loaded = await loadNutritionDay(yesterday.format("YYYY-MM-DD"), true).unwrap();
      if (!loaded || loaded.finalizedAt) return;
      const loadedPlan = await loadNutritionPlan(
        getNutritionWeekStart(yesterday).format("YYYY-MM-DD"),
        true,
      ).unwrap();
      const finalized = buildNutritionDayDraft(
        yesterday,
        getPlanDay(loadedPlan, yesterday),
        loaded,
        Number(settings.data?.calorieTarget || 2000),
      );
      const finalizedTotals = calculateNutritionTotals(finalized.meals);
      if (finalizedTotals.pending > 0 || hasMissingSkipReason(finalized.meals)) {
        setNotice({
          type: "info",
          text: `За ${yesterday.format("DD.MM")} залишилися непозначені прийоми. Відкрий учорашній день і заверши його — неповні дані не підуть у статистику.`,
        });
        return;
      }
      const nutritionHabitFound = await saveWithTrackerSync(finalized, yesterday, true);
      setNotice({
        type: "info",
        text: nutritionHabitFound
          ? `Підсумок за ${yesterday.format("DD.MM")} синхронізовано з трекером.`
          : `Підсумок за ${yesterday.format("DD.MM")} збережено, але звичку «Харчування» у трекері не знайдено.`,
      });
    };
    run().catch((error) =>
      setNotice({ type: "error", text: `Не вдалося підсумувати вчорашній день: ${String(error)}` }),
    );
  }, [
    autoSyncDone,
    habits.data,
    habits.isFetching,
    loadNutritionDay,
    loadNutritionPlan,
    saveWithTrackerSync,
    settings.data?.calorieTarget,
  ]);

  const updateMeal = (id: string, patch: Partial<INutritionMeal>) => {
    setIsDirty(true);
    setDraft((current) =>
      current
        ? {
            ...current,
            meals: current.meals.map((meal) =>
              meal.id === id ? { ...meal, ...patch } : meal,
            ),
          }
        : current,
    );
  };

  const selectDate = (date: Dayjs) => {
    if (isDirty && !window.confirm("Є незбережені зміни. Перейти до іншого дня без збереження?")) {
      return;
    }
    setSelectedDate(date);
  };

  const addMeal = () => {
    setIsDirty(true);
    setDraft((current) =>
      current
        ? {
            ...current,
            meals: [
              ...current.meals,
              {
                id: `manual-${Date.now()}`,
                title: "Додатковий прийом їжі",
                time: dayjs().format("HH:mm"),
                calories: 0,
                protein: 0,
                status: "pending",
              },
            ],
          }
        : current,
    );
  };

  const markAllPendingAsEaten = () => {
    setIsDirty(true);
    setDraft((current) => current
      ? {
          ...current,
          meals: current.meals.map((meal) =>
            !meal.status || meal.status === "pending"
              ? { ...meal, status: "eaten" }
              : meal,
          ),
        }
      : current,
    );
  };

  const save = async () => {
    if (!draft) return;
    if (hasMissingSkipReason(draft.meals)) {
      setNotice({ type: "error", text: "Для кожного пропущеного прийому вкажи причину." });
      return;
    }
    try {
      const isPastDay = selectedDate.isBefore(dayjs(), "day");
      const canFinalize = totals.pending === 0;
      const synced = isPastDay && canFinalize
        ? await saveWithTrackerSync(draft, selectedDate, true)
        : (await saveDay({
            ...draft,
            consumedCalories: totals.calories,
            consumedProtein: totals.protein,
            consumedFat: totals.fat,
            consumedCarbs: totals.carbs,
            consumedFiber: totals.fiber,
          }).unwrap(), false);
      setIsDirty(false);
      setNotice({
        type: "success",
        text: synced
          ? "День збережено, а підсумок калорій оновлено у трекері."
          : isPastDay && !canFinalize
            ? "Чернетку збережено. Заверши статуси всіх прийомів — лише тоді день потрапить у статистику."
          : "День харчування збережено у Firebase.",
      });
    } catch (error) {
      setNotice({ type: "error", text: `Не вдалося зберегти: ${String(error)}` });
    }
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const bundle = parseNutritionBundle(await file.text());
      await importBundle(bundle).unwrap();
      setSelectedDate(dayjs(bundle.plan.weekStart));
      setNotice({ type: "success", text: `План ${bundle.plan.weekStart} — ${bundle.plan.weekEnd} імпортовано.` });
    } catch (error) {
      setNotice({ type: "error", text: `Імпорт не виконано: ${error instanceof Error ? error.message : String(error)}` });
    }
  };

  const exportAnalysis = () => {
    if (!plan.data) return;
    downloadJson(
      buildNutritionAnalysisExport({
        plan: plan.data,
        logs: weekLogs.data || [],
        trainingDays: strengthTrainings,
      }),
      `nutrition-report-${plan.data.weekStart}--${plan.data.weekEnd}.json`,
    );
  };

  const sharePlan = async () => {
    if (!plan.data) return;
    const text = buildTelegramPlanText(plan.data);
    if (navigator.share) {
      await navigator.share({ title: "Раціон на тиждень", text });
      return;
    }
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const isLoading = settings.isFetching || plan.isFetching || dayLog.isFetching;
  const hasLoadError = settings.isError || plan.isError || dayLog.isError || weekLogs.isError || habits.isError || history.isError;

  return (
    <Box maxWidth={1180} mx="auto" px={{ xs: 1.5, md: 3 }} py={3}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2} mb={2}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>Харчування</Typography>
          <Typography color="text.secondary">План → виконання → підсумок попереднього дня → тижневий аналіз</Typography>
        </Box>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <input ref={fileInputRef} hidden type="file" accept="application/json,.json" onChange={handleImport} />
          <Button variant="outlined" startIcon={<CloudUploadOutlined />} disabled={importState.isLoading} onClick={() => fileInputRef.current?.click()}>Імпорт JSON</Button>
          <Button variant="outlined" startIcon={<DownloadOutlined />} disabled={!plan.data} onClick={exportAnalysis}>JSON для аналізу</Button>
          <Button variant="outlined" startIcon={<PrintOutlined />} disabled={!plan.data} onClick={() => plan.data && printWeeklyNutritionPlan(plan.data)}>PDF плану</Button>
          <Button variant="outlined" startIcon={<PrintOutlined />} disabled={!plan.data?.recipes.length} onClick={() => plan.data && printNutritionRecipes(plan.data.recipes)}>PDF рецептів</Button>
          <Button variant="outlined" startIcon={<ShareOutlined />} disabled={!plan.data} onClick={() => sharePlan().catch((error) => setNotice({ type: "error", text: String(error) }))}>Поділитися</Button>
        </Stack>
      </Stack>

      {notice && <Alert severity={notice.type} onClose={() => setNotice(null)} sx={{ mb: 2 }}>{notice.text}</Alert>}
      {hasLoadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Не вдалося завантажити частину даних. Перевір підключення та права Firebase, потім онови сторінку.
        </Alert>
      )}

      <NutritionWeekOverview
        weekStart={weekStart}
        selectedDate={selectedDate}
        plan={plan.data || null}
        logs={weekLogs.data || []}
        calorieTarget={calorieTarget}
        onSelectDate={selectDate}
      />

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} gap={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              <IconButton aria-label="Попередній день" onClick={() => selectDate(selectedDate.subtract(1, "day"))}><ArrowBackOutlined /></IconButton>
              <DatePicker allowClear={false} value={selectedDate} format="DD.MM.YYYY" onChange={(value) => value && selectDate(value)} />
              <IconButton aria-label="Наступний день" onClick={() => selectDate(selectedDate.add(1, "day"))}><ArrowForwardOutlined /></IconButton>
              <Button onClick={() => selectDate(dayjs())}>Сьогодні</Button>
            </Stack>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip color="primary" label={`${totals.calories}/${draft?.targetCalories || calorieTarget} ккал`} />
              <Chip label={`${totals.protein} г білка`} />
              <Chip label={`${totals.fat} г жирів`} />
              <Chip label={`${totals.carbs} г вуглеводів`} />
              <Chip label={`З'їдено ${totals.eaten}`} />
              <Chip label={`Пропущено ${totals.skipped}`} />
              <Chip
                color={isDirty ? "warning" : "success"}
                variant={isDirty ? "filled" : "outlined"}
                label={isDirty ? "Є незбережені зміни" : draft?.updatedAt ? "Збережено" : "Новий день"}
              />
            </Stack>
          </Stack>
          <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, height: 9, borderRadius: 4 }} />
        </CardContent>
      </Card>

      {strengthTrainings.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Силові цього тижня:</strong> {strengthTrainings.join(" · ")}. Час прийомів їжі береться з імпортованого плану; тренування показані поруч як контекст.
        </Alert>
      )}

      <NutritionOperations
        plan={plan.data || null}
        settings={settings.data || null}
        selectedDate={selectedDate}
      />

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : (
        <Stack gap={2}>
          {!plan.data && (
            <Alert severity="warning">Для тижня {weekStart.format("DD.MM")} — {weekEnd.format("DD.MM")} ще немає імпортованого плану. Можна додати прийоми вручну або імпортувати JSON із проєкту Health.</Alert>
          )}
          {(draft?.meals || []).map((meal) => (
            <Card key={meal.id} variant="outlined">
              <CardContent>
                <Stack direction={{ xs: "column", md: "row" }} gap={1.5} alignItems={{ md: "flex-start" }}>
                  <TextField label="Час" type="time" value={meal.time} onChange={(event) => updateMeal(meal.id, { time: event.target.value })} InputLabelProps={{ shrink: true }} sx={{ width: { md: 130 } }} />
                  <TextField label="Страва" value={meal.title} onChange={(event) => updateMeal(meal.id, { title: event.target.value })} fullWidth />
                  <TextField label="Ккал" type="number" value={meal.calories} onChange={(event) => updateMeal(meal.id, { calories: Number(event.target.value) })} sx={{ width: { md: 120 } }} />
                  <TextField label="Білок, г" type="number" value={meal.protein || 0} onChange={(event) => updateMeal(meal.id, { protein: Number(event.target.value) })} sx={{ width: { md: 120 } }} />
                  <TextField select label="Статус" value={meal.status || "pending"} onChange={(event) => updateMeal(meal.id, { status: event.target.value as INutritionMeal["status"], skippedReason: event.target.value === "skipped" ? meal.skippedReason : "" })} sx={{ minWidth: 130 }}>
                    {mealStatusOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                  </TextField>
                  {meal.id.startsWith("manual-") && <IconButton aria-label="Видалити прийом" color="error" onClick={() => { setIsDirty(true); setDraft((current) => current ? { ...current, meals: current.meals.filter((item) => item.id !== meal.id) } : current); }}><DeleteOutline /></IconButton>}
                </Stack>
                {meal.portionDescription && (
                  <Box
                    sx={{
                      mt: 1.5,
                      p: 1.25,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "action.hover",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <RestaurantMenuOutlined color="primary" fontSize="small" sx={{ mt: 0.2 }} />
                      <Box>
                        <Typography variant="caption" color="primary" fontWeight={700}>
                          ПОРЦІЯ І ГРАМОВКА
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.25, lineHeight: 1.55 }}>
                          {meal.portionDescription}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}
                {meal.description && (!meal.portionDescription || !meal.description.startsWith(meal.portionDescription)) && (
                  <Typography color="text.secondary" mt={1}>{meal.description}</Typography>
                )}
                {meal.status === "skipped" && (
                  <TextField required error={!meal.skippedReason?.trim()} label="Чому не з'їв?" value={meal.skippedReason || ""} onChange={(event) => updateMeal(meal.id, { skippedReason: event.target.value })} fullWidth multiline minRows={2} sx={{ mt: 1.5 }} />
                )}
                <TextField label="Коментар до прийому" value={meal.comment || ""} onChange={(event) => updateMeal(meal.id, { comment: event.target.value })} fullWidth size="small" sx={{ mt: 1.5 }} />
              </CardContent>
            </Card>
          ))}

          <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
            <Button
              variant="contained"
              color="success"
              startIcon={<DoneAllOutlined />}
              disabled={!draft?.meals.some((meal) => !meal.status || meal.status === "pending")}
              onClick={markAllPendingAsEaten}
            >
              Позначити заплановане як з'їдене
            </Button>
            <Button variant="outlined" startIcon={<AddOutlined />} onClick={addMeal}>Додати прийом їжі</Button>
          </Stack>
          <Divider />
          <TextField label="Коментар дня" placeholder="Голод, самопочуття, алкоголь, їжа поза планом, що спрацювало або завадило" value={draft?.dailyComment || ""} onChange={(event) => { setIsDirty(true); setDraft((current) => current ? { ...current, dailyComment: event.target.value } : current); }} fullWidth multiline minRows={3} />
          <Box display="flex" justifyContent="flex-end">
            <Button variant="contained" size="large" startIcon={<SaveOutlined />} disabled={!draft || saveState.isLoading} onClick={save}>Зберегти день</Button>
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default Nutrition;
