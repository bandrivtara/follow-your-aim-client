import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  AutoAwesomeRounded,
  CheckCircleRounded,
  CloudDownloadRounded,
  ContentCopyRounded,
  FavoriteRounded,
  LinkRounded,
  RestaurantMenuRounded,
  SendRounded,
  SettingsRounded,
} from "@mui/icons-material";
import {
  buildNutritionPrompt,
  createWeek,
  parseNutritionPlan,
  splitList,
  sumMeals,
} from "./nutritionLogic";
import { nutritionApi } from "./nutritionApi";
import {
  DEFAULT_PREFERENCES,
  NutritionConnectionStatus,
  NutritionDiarySummary,
  NutritionPlanDay,
  NutritionPreferences,
} from "./nutritionTypes";
import NutritionLayout from "./NutritionDashboard.styled";

const PREFERENCES_KEY = "fya:nutrition:preferences:v1";
const PLAN_KEY = "fya:nutrition:plan:v1";

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

const formatMacro = (value: number, suffix = "г") =>
  value ? `${Math.round(value)} ${suffix}` : "—";

const NutritionDashboard = () => {
  const [tab, setTab] = useState(0);
  const [preferences, setPreferences] = useState<NutritionPreferences>(() =>
    readStorage(PREFERENCES_KEY, DEFAULT_PREFERENCES),
  );
  const [week, setWeek] = useState<NutritionPlanDay[]>(() =>
    readStorage(PLAN_KEY, createWeek()),
  );
  const [planJson, setPlanJson] = useState("");
  const [connection, setConnection] = useState<NutritionConnectionStatus>({
    configured: nutritionApi.isConfigured,
    connected: false,
  });
  const [diary, setDiary] = useState<NutritionDiarySummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!nutritionApi.isConfigured) return;
    nutritionApi
      .status()
      .then(setConnection)
      .catch((caught) => setError(caught.message));
  }, []);

  useEffect(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem(PLAN_KEY, JSON.stringify(week));
  }, [week]);

  const todayPlan = useMemo(
    () => week.find((day) => day.date === dayjs().format("YYYY-MM-DD")),
    [week],
  );
  const todayPlanned = useMemo(
    () => sumMeals(todayPlan?.meals || []),
    [todayPlan],
  );
  const prompt = useMemo(
    () => buildNutritionPrompt(preferences, week),
    [preferences, week],
  );

  const updateTarget = (key: keyof NutritionPreferences["targets"], value: string) =>
    setPreferences((current) => ({
      ...current,
      targets: { ...current.targets, [key]: Math.max(0, Number(value) || 0) },
    }));

  const updateList = (
    key: "likedFoods" | "dislikedFoods" | "likedMeals" | "dislikedMeals",
    value: string,
  ) => setPreferences((current) => ({ ...current, [key]: splitList(value) }));

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setNotice("AI-промпт скопійовано.");
  };

  const importPlan = () => {
    try {
      const parsed = parseNutritionPlan(planJson, week.map((day) => day.date));
      setWeek(parsed);
      setPlanJson("");
      setNotice("План перевірено та імпортовано.");
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не вдалося імпортувати план.");
    }
  };

  const syncToday = async () => {
    setBusy(true);
    setError("");
    try {
      setDiary(await nutritionApi.syncDay(dayjs().format("YYYY-MM-DD")));
      setNotice("Щоденник FatSecret оновлено.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Помилка синхронізації.");
    } finally {
      setBusy(false);
    }
  };

  const publishPlan = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await nutritionApi.publishPlan(week);
      setNotice(`Створено ${result.created}, пропущено ${result.skipped} позицій.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Помилка публікації.");
    } finally {
      setBusy(false);
    }
  };

  const actual = diary || {
    ...todayPlanned,
    date: dayjs().format("YYYY-MM-DD"),
    entriesCount: todayPlan?.meals.length || 0,
    syncedAt: "",
  };

  return (
    <NutritionLayout>
      <header className="nutrition-hero">
        <div>
          <Chip icon={<FavoriteRounded />} label="Nutrition workspace" />
          <Typography variant="h3" component="h1">Харчування без ручного дублювання</Typography>
          <Typography color="text.secondary">
            Плануй тиждень у Follow Your Aim, звіряй КБЖВ і синхронізуй факт із FatSecret.
          </Typography>
        </div>
        <Card className="connection-card">
          <CardContent>
            <div className="connection-heading">
              {connection.connected ? <CheckCircleRounded color="success" /> : <LinkRounded color="primary" />}
              <div>
                <strong>{connection.connected ? "FatSecret підключено" : "FatSecret не підключено"}</strong>
                <span>{connection.accountLabel || "OAuth 1.0 · пароль не передається"}</span>
              </div>
            </div>
            {!nutritionApi.isConfigured && (
              <Alert severity="info">Спочатку треба розгорнути захищений backend і додати його URL.</Alert>
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="contained"
                startIcon={<LinkRounded />}
                disabled={!nutritionApi.isConfigured || connection.connected}
                onClick={() => window.location.assign(nutritionApi.connectUrl)}
              >
                Підключити акаунт
              </Button>
              <Button
                startIcon={busy ? <CircularProgress size={16} /> : <CloudDownloadRounded />}
                disabled={!connection.connected || busy}
                onClick={syncToday}
              >
                Оновити сьогодні
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </header>

      {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

      <Tabs value={tab} onChange={(_event, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
        <Tab icon={<RestaurantMenuRounded />} iconPosition="start" label="Дашборд" />
        <Tab icon={<AutoAwesomeRounded />} iconPosition="start" label="План на тиждень" />
        <Tab icon={<SettingsRounded />} iconPosition="start" label="Мої налаштування" />
      </Tabs>

      {tab === 0 && (
        <section className="dashboard-grid">
          <Card className="macro-card macro-card--calories"><CardContent><span>Калорії</span><strong>{formatMacro(actual.calories, "ккал")}</strong><small>ціль {formatMacro(preferences.targets.calories, "ккал")}</small><LinearProgress variant="determinate" value={preferences.targets.calories ? Math.min(100, actual.calories / preferences.targets.calories * 100) : 0} /></CardContent></Card>
          <Card className="macro-card macro-card--protein"><CardContent><span>Білки</span><strong>{formatMacro(actual.protein)}</strong><small>ціль {formatMacro(preferences.targets.protein)}</small><LinearProgress variant="determinate" value={preferences.targets.protein ? Math.min(100, actual.protein / preferences.targets.protein * 100) : 0} /></CardContent></Card>
          <Card className="macro-card macro-card--fat"><CardContent><span>Жири</span><strong>{formatMacro(actual.fat)}</strong><small>ціль {formatMacro(preferences.targets.fat)}</small><LinearProgress variant="determinate" value={preferences.targets.fat ? Math.min(100, actual.fat / preferences.targets.fat * 100) : 0} /></CardContent></Card>
          <Card className="macro-card macro-card--carbs"><CardContent><span>Вуглеводи</span><strong>{formatMacro(actual.carbs)}</strong><small>ціль {formatMacro(preferences.targets.carbs)}</small><LinearProgress variant="determinate" value={preferences.targets.carbs ? Math.min(100, actual.carbs / preferences.targets.carbs * 100) : 0} /></CardContent></Card>
          <Card className="today-meals"><CardContent>
            <Typography variant="h5">Сьогоднішній план</Typography>
            <Typography color="text.secondary">{actual.entriesCount} позицій · {diary ? "факт FatSecret" : "локальний план"}</Typography>
            <Divider />
            {todayPlan?.meals.length ? todayPlan.meals.map((meal, index) => (
              <div className="meal-row" key={`${meal.name}-${index}`}><div><strong>{meal.name}</strong><span>{meal.meal}</span></div><b>{formatMacro(meal.calories || 0, "ккал")}</b></div>
            )) : <Alert severity="info">На сьогодні ще немає плану. Створи його у вкладці «План на тиждень».</Alert>}
          </CardContent></Card>
          <Card className="goal-card"><CardContent>
            <Typography variant="h5">Поточна ціль</Typography>
            <Typography>{preferences.goalNote || "Опиши мету, темп дефіциту й важливі обмеження в налаштуваннях."}</Typography>
            <Button onClick={() => setTab(2)}>Налаштувати цілі</Button>
          </CardContent></Card>
        </section>
      )}

      {tab === 1 && (
        <section className="planner-section">
          <div className="section-heading"><div><Typography variant="h5">План на 7 днів</Typography><Typography color="text.secondary">AI готує структурований JSON; ти перевіряєш його перед збереженням і публікацією.</Typography></div><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><Button startIcon={<ContentCopyRounded />} onClick={copyPrompt}>Скопіювати AI-промпт</Button><Button variant="contained" startIcon={<SendRounded />} disabled={!connection.connected || busy} onClick={publishPlan}>Надіслати у FatSecret</Button></Stack></div>
          <div className="week-grid">
            {week.map((day) => { const totals = sumMeals(day.meals); return (
              <Card className="day-card" key={day.date}><CardContent><span className="day-date">{dayjs(day.date).format("ddd, DD.MM")}</span><strong>{formatMacro(totals.calories, "ккал")}</strong><small>Б {Math.round(totals.protein)} · Ж {Math.round(totals.fat)} · В {Math.round(totals.carbs)}</small><Divider />{day.meals.length ? day.meals.map((meal, index) => <div className="compact-meal" key={`${meal.name}-${index}`}><span>{meal.name}</span><small>{meal.calories || 0} ккал</small></div>) : <Typography color="text.secondary">Поки порожньо</Typography>}</CardContent></Card>
            ); })}
          </div>
          <Card className="import-card"><CardContent><Typography variant="h6">Імпорт відповіді AI</Typography><Typography color="text.secondary">Встав JSON із відповіді. Дані перевіряються локально; некоректні дати й макроси не імпортуються.</Typography><TextField multiline minRows={6} fullWidth value={planJson} onChange={(event) => setPlanJson(event.target.value)} placeholder='[{"date":"2026-09-07","meals":[...]}]' /><Button variant="contained" onClick={importPlan} disabled={!planJson.trim()}>Перевірити й імпортувати</Button></CardContent></Card>
        </section>
      )}

      {tab === 2 && (
        <section className="settings-grid">
          <Card><CardContent><Typography variant="h5">Денні цілі КБЖВ</Typography><Alert severity="warning">Дефіцит і макроси введи зі свого перевіреного розрахунку або рекомендації фахівця. Застосунок їх не діагностує.</Alert><div className="targets-grid">{([['calories','Ккал'],['protein','Білки, г'],['fat','Жири, г'],['carbs','Вуглеводи, г']] as const).map(([key, label]) => <TextField key={key} label={label} type="number" value={preferences.targets[key] || ""} onChange={(event) => updateTarget(key, event.target.value)} inputProps={{ min: 0 }} />)}</div><TextField label="Моя актуальна ціль і важливі обмеження" multiline minRows={3} fullWidth value={preferences.goalNote} onChange={(event) => setPreferences((current) => ({ ...current, goalNote: event.target.value }))} /></CardContent></Card>
          <Card><CardContent><Typography variant="h5">Моя база продуктів і страв</Typography><Typography color="text.secondary">Розділяй комами або новими рядками. Зберігається лише в цьому браузері.</Typography><div className="lists-grid"><TextField label="Продукти, які люблю" multiline minRows={4} value={preferences.likedFoods.join(", ")} onChange={(event) => updateList("likedFoods", event.target.value)} /><TextField label="Продукти, які не люблю" multiline minRows={4} value={preferences.dislikedFoods.join(", ")} onChange={(event) => updateList("dislikedFoods", event.target.value)} /><TextField label="Страви, які люблю" multiline minRows={4} value={preferences.likedMeals.join(", ")} onChange={(event) => updateList("likedMeals", event.target.value)} /><TextField label="Страви, які не люблю" multiline minRows={4} value={preferences.dislikedMeals.join(", ")} onChange={(event) => updateList("dislikedMeals", event.target.value)} /></div></CardContent></Card>
        </section>
      )}

      <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice("")} message={notice} />
    </NutritionLayout>
  );
};

export default NutritionDashboard;
