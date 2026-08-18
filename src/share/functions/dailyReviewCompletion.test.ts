import {
  buildDailyReviewHabitCompletion,
  isDailyReviewComplete,
} from "./dailyReviewCompletion";

const completeAnswers = {
  feeling: "Спокійно",
  wins: "Завершив важливу справу",
  blockers: "Втома після обіду",
  learning: "Краще планувати складне зранку",
  tomorrow: "Завершити перший модуль",
};

describe("daily review completion", () => {
  it("requires a non-empty answer to every review question", () => {
    expect(isDailyReviewComplete(completeAnswers)).toBe(true);
    expect(isDailyReviewComplete({ ...completeAnswers, blockers: "   " })).toBe(
      false,
    );
    expect(
      isDailyReviewComplete({
        feeling: "Добре",
        wins: "Одна перемога",
        blockers: "Без перешкод",
        learning: "Новий висновок",
      }),
    ).toBe(false);
  });

  it("builds a completed, planned boolean habit entry", () => {
    expect(buildDailyReviewHabitCompletion("daily-review-id")).toEqual({
      id: "daily-review-id",
      type: "habit",
      valueType: "boolean",
      isAllDay: false,
      isPlanned: true,
      progress: 100,
      status: "done",
      startTime: [21, 40],
      endTime: [21, 55],
      measures: {},
    });
  });
});
