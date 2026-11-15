import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreOutlined from "@mui/icons-material/ExpandMoreOutlined";
import KitchenOutlined from "@mui/icons-material/KitchenOutlined";
import LocalGroceryStoreOutlined from "@mui/icons-material/LocalGroceryStoreOutlined";
import AcUnitOutlined from "@mui/icons-material/AcUnitOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import dayjs, { Dayjs } from "dayjs";
import { INutritionSettings, INutritionWeekPlan } from "types/nutrition.types";

interface IProps {
  plan: INutritionWeekPlan | null;
  settings?: INutritionSettings | null;
  selectedDate: Dayjs;
}

const dateLabel = (value?: string) =>
  value && dayjs(value).isValid() ? dayjs(value).format("DD.MM") : "дату не вказано";

const NutritionOperations = ({ plan, settings, selectedDate }: IProps) => {
  if (!plan) return null;

  const date = selectedDate.format("YYYY-MM-DD");
  const shoppingTrips = plan.shoppingTrips || [];
  const prepSessions = plan.prepSessions || [];
  const freezerBatches = plan.freezerBatches || [];
  const cheatMeal = plan.weeklyEvents?.cheatMeal;
  const selectedDay = plan.days.find((day) => day.date === date);
  const katyaOverrides = (selectedDay?.meals || []).flatMap((meal) =>
    (meal.householdOverrides || []).map((override) => ({ meal, override })),
  );
  const todayActions = [
    ...shoppingTrips
      .filter((trip) => trip.plannedDate === date)
      .map((trip) => `Закупи: ${trip.title}`),
    ...prepSessions
      .filter((session) => session.plannedDate === date)
      .map((session) => `Готування ${session.plannedTime || ""}: ${session.title}`),
    ...freezerBatches.flatMap((batch) =>
      (batch.defrostPlan || [])
        .filter((entry) => entry.moveToFridgeDate === date)
        .map((entry) =>
          `Перенести в холодильник: ${batch.title}, ${entry.portions || "—"} порц. на ${dateLabel(entry.useDate)}`,
        ),
    ),
  ];

  const hasOperations =
    shoppingTrips.length > 0 ||
    prepSessions.length > 0 ||
    freezerBatches.length > 0 ||
    Boolean(cheatMeal) ||
    katyaOverrides.length > 0 ||
    Boolean(plan.household);
  if (!hasOperations) return null;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          gap={1}
          mb={1.5}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>Організація харчування</Typography>
            <Typography variant="body2" color="text.secondary">
              Закупи, заготовки, розморожування і заміни Каті — без пошуку в JSON.
            </Typography>
          </Box>
          <Stack direction="row" gap={0.75} flexWrap="wrap">
            <Chip size="small" label={`${shoppingTrips.length} закуп.`} />
            <Chip size="small" label={`${prepSessions.length} prep`} />
            <Chip size="small" label={`${freezerBatches.length} партій`} />
          </Stack>
        </Stack>

        {todayActions.length > 0 ? (
          <Alert severity="info" sx={{ mb: 1.5 }}>
            <strong>На {selectedDate.format("DD.MM")}:</strong>{" "}
            {todayActions.join(" · ")}
          </Alert>
        ) : (
          <Alert severity="success" sx={{ mb: 1.5 }}>
            На {selectedDate.format("DD.MM")} окремих закупів, великого prep або розморожування не заплановано.
          </Alert>
        )}

        <Accordion disableGutters elevation={0} sx={{ borderTop: 1, borderColor: "divider" }}>
          <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
            <LocalGroceryStoreOutlined color="primary" sx={{ mr: 1 }} />
            <Typography fontWeight={700}>Закупи</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {shoppingTrips.length ? shoppingTrips.map((trip, index) => (
              <Box key={trip.id} mb={index === shoppingTrips.length - 1 ? 0 : 2}>
                <Typography fontWeight={700}>
                  {dateLabel(trip.plannedDate)} · {trip.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={0.75}>
                  {trip.store || "Магазин не вказано"}
                  {trip.estimatedTotal ? ` · ≈ ${trip.estimatedTotal} ${trip.currency || "PLN"}` : ""}
                  {trip.priceAccuracy ? ` · ${trip.priceAccuracy}` : ""}
                </Typography>
                {(trip.items || []).map((item) => (
                  <Typography key={item.id} variant="body2" sx={{ mb: 0.4 }}>
                    • {item.name}
                    {item.quantity ? ` — ${item.quantity} ${item.unit || ""}` : ""}
                    {item.estimatedPrice ? ` · ≈ ${item.estimatedPrice} ${trip.currency || "PLN"}` : ""}
                  </Typography>
                ))}
              </Box>
            )) : <Typography color="text.secondary">Закупи не додані.</Typography>}
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters elevation={0}>
          <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
            <KitchenOutlined color="primary" sx={{ mr: 1 }} />
            <Typography fontWeight={700}>Готування і заготовки</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {prepSessions.length ? prepSessions.map((session, index) => (
              <Box key={session.id} mb={index === prepSessions.length - 1 ? 0 : 2}>
                <Typography fontWeight={700}>
                  {dateLabel(session.plannedDate)} {session.plannedTime || ""} · {session.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={0.75}>
                  {session.estimatedActiveMinutes ? `≈ ${session.estimatedActiveMinutes} хв активного часу` : "Час не вказано"}
                  {session.equipment?.length ? ` · ${session.equipment.join(", ")}` : ""}
                </Typography>
                {session.tasks.map((task) => (
                  <Typography key={task.id} variant="body2" sx={{ mb: 0.4 }}>
                    • {task.title}
                    {task.quantity ? ` — ${task.quantity} ${task.unit || ""}` : ""}
                    {task.useDates?.length ? ` · використати ${task.useDates.map(dateLabel).join(", ")}` : ""}
                  </Typography>
                ))}
              </Box>
            )) : <Typography color="text.secondary">Prep-сесії не додані.</Typography>}
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters elevation={0}>
          <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
            <AcUnitOutlined color="primary" sx={{ mr: 1 }} />
            <Typography fontWeight={700}>Морозилка і розморожування</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {freezerBatches.length ? freezerBatches.map((batch, index) => (
              <Box key={batch.id} mb={index === freezerBatches.length - 1 ? 0 : 2}>
                <Typography fontWeight={700}>{batch.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {batch.totalPortions ? `${batch.totalPortions} порц. загалом` : "Кількість не вказана"}
                  {batch.reservePortions ? ` · резерв ${batch.reservePortions}` : ""}
                  {batch.packSizePortions ? ` · пакети по ${batch.packSizePortions}` : ""}
                </Typography>
                {(batch.defrostPlan || []).map((entry) => (
                  <Typography key={`${batch.id}-${entry.moveToFridgeDate}-${entry.useDate}`} variant="body2" sx={{ mt: 0.5 }}>
                    • {dateLabel(entry.moveToFridgeDate)} у холодильник → {dateLabel(entry.useDate)} використати
                    {entry.portions ? ` (${entry.portions} порц.)` : ""}
                  </Typography>
                ))}
                {batch.finishAfterDefrost && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Після розморожування: {batch.finishAfterDefrost}
                  </Typography>
                )}
              </Box>
            )) : <Typography color="text.secondary">Морозильні партії не додані.</Typography>}
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters elevation={0}>
          <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
            <PeopleAltOutlined color="primary" sx={{ mr: 1 }} />
            <Typography fontWeight={700}>Катя і події</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {plan.household?.notes && (
              <Typography variant="body2" mb={1}>{plan.household.notes}</Typography>
            )}
            {katyaOverrides.length > 0 && (
              <Box mb={1.5}>
                <Typography fontWeight={700} mb={0.5}>Заміни на {selectedDate.format("DD.MM")}</Typography>
                {katyaOverrides.map(({ meal, override }) => (
                  <Typography key={`${meal.id}-${override.participantId}`} variant="body2" sx={{ mb: 0.5 }}>
                    • {meal.time}, {meal.title} → <strong>{override.title}</strong>
                    {override.portionDescription ? ` · ${override.portionDescription}` : ""}
                  </Typography>
                ))}
              </Box>
            )}
            {cheatMeal && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography fontWeight={700}>Гнучкий прийом їжі</Typography>
                <Typography variant="body2">
                  {dateLabel(cheatMeal.plannedDate)} {cheatMeal.plannedTime || ""} · {cheatMeal.mealTitle || "Страва ще не вибрана"}
                  {cheatMeal.maxCalories ? ` · до ${cheatMeal.maxCalories} ккал` : ""}
                </Typography>
                {cheatMeal.notes && <Typography variant="body2" color="text.secondary">{cheatMeal.notes}</Typography>}
              </>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters elevation={0}>
          <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
            <TuneOutlined color="primary" sx={{ mr: 1 }} />
            <Typography fontWeight={700}>База продуктів і правила ваги</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography fontWeight={700} mb={0.5}>Підходять</Typography>
            <Stack direction="row" gap={0.5} flexWrap="wrap" mb={1.5}>
              {(settings?.approvedProducts || []).length
                ? settings?.approvedProducts?.map((item) => <Chip key={item} size="small" label={item} />)
                : <Typography variant="body2" color="text.secondary">Ще не імпортовано з Health.</Typography>}
            </Stack>
            <Typography fontWeight={700} mb={0.5}>Не пропонувати</Typography>
            <Stack direction="row" gap={0.5} flexWrap="wrap" mb={1.5}>
              {(settings?.excludedProducts || []).length
                ? settings?.excludedProducts?.map((item) => <Chip key={item} size="small" color="error" variant="outlined" label={item} />)
                : <Typography variant="body2" color="text.secondary">Список порожній.</Typography>}
            </Stack>
            {(settings?.candidateProducts || []).length > 0 && (
              <>
                <Typography fontWeight={700} mb={0.5}>Спробувати й оцінити</Typography>
                <Stack direction="row" gap={0.5} flexWrap="wrap" mb={1.5}>
                  {settings?.candidateProducts?.map((item) => <Chip key={item} size="small" color="warning" variant="outlined" label={item} />)}
                </Stack>
              </>
            )}
            {(settings?.weighingRules || []).map((rule) => (
              <Typography key={rule} variant="body2" sx={{ mb: 0.4 }}>• {rule}</Typography>
            ))}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default NutritionOperations;
