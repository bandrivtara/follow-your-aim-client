import { buildMorningCompassCompletion } from "./goalsGratitudeCompletion";

describe("morning compass completion", () => {
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
      buildMorningCompassCompletion(
        habit,
        "  ФОКУС ДНЯ: Завершити важливу задачу  ",
        {
          isPlanned: true,
          startTime: [7, 0],
          endTime: [7, 10],
        },
      ),
    ).toMatchObject({
      id: "goals-id",
      isPlanned: true,
      progress: 100,
      status: "done",
      startTime: [7, 0],
      endTime: [7, 10],
      note: "ФОКУС ДНЯ: Завершити важливу задачу",
    });
  });
});
