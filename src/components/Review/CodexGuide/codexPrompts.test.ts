import { CODEX_PROMPTS } from "./codexPrompts";

describe("Codex guide prompt guardrails", () => {
  it("keeps write permission limited to one explicit prompt", () => {
    const writePrompts = CODEX_PROMPTS.filter(
      (prompt) => prompt.requiresConfirmation,
    );

    expect(writePrompts).toHaveLength(1);
    expect(writePrompts[0].id).toBe("apply-plan");
    expect(writePrompts[0].prompt).toContain("--apply");
    expect(writePrompts[0].prompt).toContain("підтверджую");
  });

  it("forbids Firebase writes in every read-only prompt", () => {
    const readOnlyPrompts = CODEX_PROMPTS.filter(
      (prompt) => !prompt.requiresConfirmation,
    );

    readOnlyPrompts.forEach((prompt) => {
      expect(prompt.prompt).toMatch(/не (змінюй|застосовуй)|Нічого не застосовуй/);
    });
  });

  it("keeps evidence levels in analytical prompts", () => {
    const analysisPrompts = CODEX_PROMPTS.filter((prompt) =>
      ["quick-analysis", "weekly-review"].includes(prompt.id),
    );

    analysisPrompts.forEach((prompt) => {
      expect(prompt.prompt).toContain(
        "Fact → Observation → Hypothesis → Recommendation",
      );
    });
  });
});
