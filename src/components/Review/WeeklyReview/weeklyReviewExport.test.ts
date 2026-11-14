import dayjs from "dayjs";
import {
  buildWeeklyReviewExport,
  getDailyReviewForDate,
} from "./weeklyReviewExport";

describe("weekly review export", () => {
  const review = {
    date: "2026-08-17",
    mood: 4,
    energy: 3,
    answers: { wins: "Завершив головне завдання" },
    updatedAt: 1,
  };

  it("finds a daily review by month and padded day", () => {
    expect(
      getDailyReviewForDate(
        [{ id: "2026-08", unix: dayjs("2026-08").unix(), "17": review }],
        dayjs("2026-08-17"),
      ),
    ).toEqual(review);
  });

  it("includes tracker data, reflection and the analysis prompt", () => {
    const report = buildWeeklyReviewExport({
      dateFrom: dayjs("2026-08-17"),
      dateTo: dayjs("2026-08-23"),
      history: [],
      habits: [],
      taskGroups: [],
      reviewMonths: [
        { id: "2026-08", unix: dayjs("2026-08").unix(), "17": review },
      ],
    });

    expect(report).toContain("# Дані трекера");
    expect(report).toContain("Завершив головне завдання");
    expect(report).toContain("# Інструкція для Codex / AI");
    expect(report).toContain("три пріоритети");
  });
});
