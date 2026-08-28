import { Button, Card, CardContent, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { ChartsReferenceLine } from "@mui/x-charts/ChartsReferenceLine";
import { DailyHabitMinutes, getWeeklyRhythm } from "./dashboardInsightCalculations";

interface Props {
  week: ReturnType<typeof getWeeklyRhythm>;
  minutes: DailyHabitMinutes[];
  isLoading: boolean;
  hasError: boolean;
  onPlan: () => void;
}

const formatMinutes = (value: number) =>
  value.toLocaleString("uk-UA", { maximumFractionDigits: 1 });

const DashboardInsights = ({
  week,
  minutes,
  isLoading,
  hasError,
  onPlan,
}: Props) => {
  const elapsedPlannedDays = week.filter(
    (day) => !day.isFuture && day.planned > 0,
  );
  const completedDays = elapsedPlannedDays.filter(
    (day) => day.completedPlanned === day.planned,
  ).length;
  const maxPercent = Math.max(
    110,
    Math.ceil(Math.max(...week.map((day) => day.totalPercent ?? 0)) / 25) * 25 +
      10,
  );
  const plannedMinutes = minutes.reduce((sum, item) => sum + item.planned, 0);
  const actualMinutes = minutes.reduce((sum, item) => sum + item.actual, 0);
  const minuteScale = Math.max(
    1,
    ...minutes.flatMap((item) => [item.planned, item.actual]),
  );
  const status = hasError
    ? "Не вдалося завантажити дані. Онови сторінку, щоб повторити."
    : "Завантажуємо дані…";

  return (
    <>
      <Card className="dashboard-card week-card">
        <CardContent>
          <Typography variant="h5">Ритм поточного тижня</Typography>
          <Typography variant="body2" color="text.secondary">
            План дня — 100%. Додаткова активність — бонус.
          </Typography>
          {isLoading || hasError ? (
            <div className="chart-empty-state" role="status">
              {status}
            </div>
          ) : (
            <>
              <div className="insight-legend">
                <span>
                  <i className="insight-dot--plan-done" />У межах плану
                </span>
                <span>
                  <i className="insight-dot--actual" />
                  Поза планом
                </span>
              </div>
              <BarChart
                aria-label="Виконання плану за днями тижня. Числові значення наведені під графіком."
                xAxis={[
                  { scaleType: "band", data: week.map((day) => day.label) },
                ]}
                yAxis={[
                  {
                    min: 0,
                    max: maxPercent,
                    tickNumber: 3,
                    valueFormatter: (value) => `${value}%`,
                  },
                ]}
                series={[
                  {
                    data: week.map((day) => day.plannedPercent),
                    label: "У межах плану",
                    color: "#5b6cf9",
                    stack: "completion",
                    valueFormatter: (value) =>
                      value === null ? "Немає оцінки" : `${value}%`,
                  },
                  {
                    data: week.map((day) => day.bonusPercent),
                    label: "Поза планом",
                    color: "#18a874",
                    stack: "completion",
                    valueFormatter: (value) =>
                      value === null ? "Немає оцінки" : `+${value}%`,
                  },
                ]}
                borderRadius={5}
                grid={{ horizontal: true }}
                height={180}
                margin={{ left: 44, right: 12, top: 16, bottom: 24 }}
                slotProps={{ legend: { hidden: true } }}
                skipAnimation
              >
                <ChartsReferenceLine
                  y={100}
                  lineStyle={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
                />
              </BarChart>
              <ul className="rhythm-days" aria-label="Результати за днями">
                {week.map((day) => (
                  <li
                    key={day.date}
                    className={day.isToday ? "rhythm-day--today" : undefined}
                  >
                    <span>{day.label}</span>
                    <strong>
                      {day.isFuture
                        ? "—"
                        : day.totalPercent === null
                          ? "—"
                          : `${day.totalPercent}%`}
                    </strong>
                    <small>
                      {day.isFuture
                        ? "Попереду"
                        : day.planned
                          ? `${day.completedPlanned}/${day.planned}`
                          : "Без плану"}
                    </small>
                    {!day.isFuture && !day.planned && day.completed > 0 && (
                      <small>✓ {day.completed}</small>
                    )}
                  </li>
                ))}
              </ul>
              <Typography
                variant="caption"
                color="text.secondary"
                component="p"
                mt={1}
              >
                {elapsedPlannedDays.length
                  ? `План повністю виконано: ${completedDays} із ${elapsedPlannedDays.length} днів до сьогодні включно. Часткові результати теж враховано у відсотках.`
                  : "Без плану відсоток не обчислюємо. Майбутні дні не є пропусками."}
              </Typography>
              {!elapsedPlannedDays.length && (
                <Button size="small" onClick={onPlan}>
                  Сформувати план дня
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Card className="dashboard-card balance-card">
        <CardContent>
          <Typography variant="h5">Час у звичках сьогодні</Typography>
          <Typography variant="body2" color="text.secondary">
            Куди спрямовані заплановані й записані хвилини
          </Typography>
          {isLoading || hasError ? (
            <div className="chart-empty-state" role="status">
              {status}
            </div>
          ) : minutes.length ? (
            <>
              <div className="minutes-summary">
                <strong>
                  {formatMinutes(actualMinutes)} <small>хв зафіксовано</small>
                </strong>
                <span>План: {formatMinutes(plannedMinutes)} хв</span>
              </div>
              <div className="insight-legend">
                <span>
                  <i className="insight-dot--target" />
                  План
                </span>
                <span>
                  <i className="insight-dot--actual" />
                  Факт
                </span>
              </div>
              <ul
                className="minutes-chart"
                tabIndex={0}
                aria-label="Хвилини за звичками: план і факт. Список можна прокручувати."
              >
                {minutes.map((item) => (
                  <li key={item.id}>
                    <div className="minutes-row-heading">
                      <span>{item.title}</span>
                      <strong>
                        {formatMinutes(item.actual)}
                        {item.planned
                          ? ` / ${formatMinutes(item.planned)} хв`
                          : " хв · поза планом"}
                      </strong>
                    </div>
                    <div className="minutes-bars" aria-hidden="true">
                      <span
                        className="minutes-bar--planned"
                        style={{
                          width: `${(item.planned / minuteScale) * 100}%`,
                        }}
                      />
                      <span
                        className="minutes-bar--actual"
                        style={{
                          width: `${(item.actual / minuteScale) * 100}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <Typography
                variant="caption"
                color="text.secondary"
                component="p"
                mt={1}
              >
                Лише збережені виміри у хвилинах, не повний облік дня. Пропорції
                смуг спільні для всіх звичок.
              </Typography>
            </>
          ) : (
            <div className="chart-empty-state">
              <Typography fontWeight={650}>
                Сьогодні ще немає запланованих або записаних хвилин
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Додай у план англійську, медитацію чи іншу звичку з виміром у
                хвилинах.
              </Typography>
              <Button variant="outlined" onClick={onPlan}>
                Сформувати план
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default DashboardInsights;
