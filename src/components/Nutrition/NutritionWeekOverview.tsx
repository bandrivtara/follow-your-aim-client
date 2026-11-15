import { Box, ButtonBase, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { Dayjs } from "dayjs";
import { INutritionDayLog, INutritionWeekPlan } from "types/nutrition.types";
import { calculateNutritionTotals } from "./nutritionUtils";

interface IProps {
  weekStart: Dayjs;
  selectedDate: Dayjs;
  plan: INutritionWeekPlan | null;
  logs: INutritionDayLog[];
  calorieTarget: number;
  onSelectDate: (date: Dayjs) => void;
}

const NutritionWeekOverview = ({
  weekStart,
  selectedDate,
  plan,
  logs,
  calorieTarget,
  onSelectDate,
}: IProps) => {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = weekStart.add(index, "day");
    const log = logs.find((item) => item.date === date.format("YYYY-MM-DD"));
    const planDay = plan?.days.find((item) => item.date === date.format("YYYY-MM-DD"));
    const totals = calculateNutritionTotals(log?.meals || []);
    const target = Number(log?.targetCalories || calorieTarget);
    return {
      date,
      log,
      hasPlan: Boolean(planDay?.meals.length),
      calories: totals.calories,
      progress: target ? Math.min(115, Math.round((totals.calories / target) * 100)) : 0,
      completed: totals.pending === 0 && Boolean(log?.meals.length) && Boolean(log?.finalizedAt),
      partial: Boolean(log?.meals.length) && (totals.pending > 0 || !log?.finalizedAt),
    };
  });
  const loggedDays = days.filter((day) => day.log);
  const completeDays = days.filter((day) => day.completed);
  const average = completeDays.length
    ? Math.round(completeDays.reduce((sum, day) => sum + day.calories, 0) / completeDays.length)
    : 0;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Тиждень одним поглядом</Typography>
            <Typography variant="body2" color="text.secondary">
              Середнє за завершені дні: {average || "—"} ккал
            </Typography>
          </Box>
          <Stack direction="row" gap={0.75} flexWrap="wrap" justifyContent="flex-end">
            <Chip size="small" color="success" variant="outlined" label={`${completeDays.length}/7 завершено`} />
            <Chip size="small" label={`${loggedDays.filter((day) => day.partial).length} чернеток`} />
          </Stack>
        </Stack>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "repeat(7, minmax(48px, 1fr))", sm: "repeat(7, 1fr)" }}
          gap={{ xs: 0.5, sm: 1 }}
          overflow="auto"
          pb={0.5}
        >
          {days.map((day) => {
            const selected = day.date.isSame(selectedDate, "day");
            const color = day.progress > 110 ? "error.main" : day.completed ? "success.main" : day.partial ? "warning.main" : "primary.main";
            return (
              <ButtonBase
                key={day.date.format("YYYY-MM-DD")}
                onClick={() => onSelectDate(day.date)}
                aria-label={`Відкрити ${day.date.format("DD.MM")}`}
                sx={{
                  minWidth: 48,
                  border: 1,
                  borderColor: selected ? "primary.main" : "divider",
                  borderRadius: 2,
                  p: 0.75,
                  display: "block",
                  bgcolor: selected ? "action.selected" : "transparent",
                }}
              >
                <Typography variant="caption" display="block" fontWeight={700} textTransform="uppercase">
                  {day.date.locale("uk").format("dd")}
                </Typography>
                <Typography variant="body2">{day.date.format("DD")}</Typography>
                <Box height={42} display="flex" alignItems="flex-end" justifyContent="center" my={0.5}>
                  <Box
                    width={10}
                    height={`${Math.max(day.log ? 5 : 0, Math.min(100, day.progress))}%`}
                    minHeight={day.log ? 3 : 0}
                    borderRadius={1}
                    bgcolor={color}
                  />
                </Box>
                <Typography variant="caption" color={day.log ? "text.primary" : "text.disabled"} whiteSpace="nowrap">
                  {day.log ? day.calories : day.hasPlan ? "план" : "—"}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          Стовпчик показує частку від цілі. Зелений — день завершено, жовтий — чернетка, червоний — понад 110%.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default NutritionWeekOverview;
