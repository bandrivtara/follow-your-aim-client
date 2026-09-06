import { DAILY_REVIEW_AI_PROMPT } from "components/Review/reflectionPrompts";
import { getDailyReviewFocus } from "./getDailyReviewFocus";

describe("daily review focus", () => {
  it("reads the final section produced by the current review prompt", () => {
    const questionsBlock = DAILY_REVIEW_AI_PROMPT.split(
      "Три запитання:",
    )[1]?.split("Після моєї відповіді")[0];

    expect(DAILY_REVIEW_AI_PROMPT).toContain(
      "покажи всі три запитання одразу",
    );
    expect(DAILY_REVIEW_AI_PROMPT).toContain("ЩО ВДАЛОСЯ:");
    expect(DAILY_REVIEW_AI_PROMPT).toContain("ЩО НЕ ВДАЛОСЯ:");
    expect(DAILY_REVIEW_AI_PROMPT).toContain("ФОКУС ЗАВТРА:");
    expect(questionsBlock?.match(/^\d+\. /gm)).toHaveLength(3);
    expect(
      getDailyReviewFocus({
        summary:
          "СТАН: Добре.\n\nПЕРЕМОГИ: Прогулянка.\n\nУРОК: Починати раніше.\n\nФОКУС ЗАВТРА: Спокійно завершити основну справу.",
        answers: { tomorrow: "" },
      }),
    ).toBe("Спокійно завершити основну справу.");
  });

  it.each([
    "Фокус:",
    "фокус:",
    "ФОКУС ЗАВТРА:",
    "Фокус на завтра :",
    "**Фокус:**",
    "**ФОКУС ЗАВТРА**:",
    "### Фокус:",
  ])("accepts the label %s", (label) => {
    expect(
      getDailyReviewFocus({
        summary: `УРОК: Один висновок.\n${label} Вчити англійську.`,
      }),
    ).toBe("Вчити англійську.");
  });

  it("keeps multiline content and colons inside the focus", () => {
    expect(
      getDailyReviewFocus({
        summary:
          "УРОК: Без поспіху. Фокус:\r\nО 06:30 — англійська.\r\nПісля цього — прогулянка.  ",
      }),
    ).toBe("О 06:30 — англійська.\r\nПісля цього — прогулянка.");
  });

  it("prefers the last focus section over earlier sections and legacy text", () => {
    expect(
      getDailyReviewFocus({
        summary: "Фокус: Попередній варіант.\nФОКУС ЗАВТРА: Оновлена дія.",
        answers: { tomorrow: "Стара дія." },
      }),
    ).toBe("Оновлена дія.");
  });

  it("preserves legacy reviews and ignores unrelated prose", () => {
    expect(
      getDailyReviewFocus({ answers: { tomorrow: "  Завершити модуль.  " } }),
    ).toBe("Завершити модуль.");
    expect(
      getDailyReviewFocus({
        summary: "Який один головний фокус на завтра? Завершити модуль.",
        answers: { tomorrow: "Завершити модуль." },
      }),
    ).toBe("Завершити модуль.");
    expect(
      getDailyReviewFocus({ summary: "УРОК: Покращити автофокус: камери." }),
    ).toBe("");
  });

  it("does not resurrect an old focus when the new section is empty", () => {
    expect(
      getDailyReviewFocus({
        summary: "ФОКУС ЗАВТРА:  ",
        answers: { tomorrow: "Старий фокус" },
      }),
    ).toBe("");
  });

  it.each([
    undefined,
    null,
    "text",
    123,
    {},
    { summary: 42, answers: { tomorrow: 7 } },
  ])("safely handles missing or malformed data: %p", (review) =>
    expect(getDailyReviewFocus(review)).toBe(""),
  );
});
