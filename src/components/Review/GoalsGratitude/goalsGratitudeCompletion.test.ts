import { MORNING_COMPASS_AI_PROMPT } from "../reflectionPrompts";
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

  it("asks all morning questions at once and returns an analysis plus pasteable text", () => {
    const questionsBlock = MORNING_COMPASS_AI_PROMPT.split(
      "Три запитання:",
    )[1]?.split("Після моєї відповіді")[0];

    expect(MORNING_COMPASS_AI_PROMPT).toContain(
      "покажи всі три запитання одразу",
    );
    expect(MORNING_COMPASS_AI_PROMPT).toContain("КЛЮЧОВІ ДІЇ:");
    expect(MORNING_COMPASS_AI_PROMPT).toContain("ЗАХИСТ ПЛАНУ:");
    expect(MORNING_COMPASS_AI_PROMPT).not.toContain("рівень енергії");
    expect(questionsBlock?.match(/^\d+\. /gm)).toHaveLength(3);
    expect(MORNING_COMPASS_AI_PROMPT).toContain("КОРОТКИЙ АНАЛІЗ");
    expect(MORNING_COMPASS_AI_PROMPT).toContain(
      "ТЕКСТ ДЛЯ FOLLOW YOUR AIM",
    );
    expect(MORNING_COMPASS_AI_PROMPT).not.toContain(
      "Став лише одне питання за раз",
    );
  });
});
