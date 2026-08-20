import { buildGoalsGratitudeCompletion } from "./goalsGratitudeCompletion";

describe("goals and gratitude completion", () => {
  const habit = {
    id: "goals-id",
    title: "10 Цілей",
    type: "habit",
    valueType: "boolean",
    isAllDay: false,
    startTime: [6, 45],
    endTime: [6, 55],
  } as any;

  it("preserves planning data and completes only with the stored note", () => {
    expect(
      buildGoalsGratitudeCompletion(habit, "  5 ЦІЛЕЙ\n1. Результат  ", {
        isPlanned: true,
        startTime: [7, 0],
        endTime: [7, 10],
      }),
    ).toMatchObject({
      id: "goals-id",
      isPlanned: true,
      progress: 100,
      status: "done",
      startTime: [7, 0],
      endTime: [7, 10],
      note: "5 ЦІЛЕЙ\n1. Результат",
    });
  });
});
