import {
  formatFocusTime,
  getRecordedMinutes,
  isMinuteUnit,
  parseFocusTimerSession,
} from "./focusTimer";

describe("focus timer", () => {
  it("recognizes Ukrainian and English minute units", () => {
    expect(isMinuteUnit("хв")).toBe(true);
    expect(isMinuteUnit("Хвилини")).toBe(true);
    expect(isMinuteUnit("min")).toBe(true);
    expect(isMinuteUnit("кроки")).toBe(false);
  });

  it("restores only a safe elapsed duration", () => {
    expect(parseFocusTimerSession('{"elapsedSeconds":615}')).toEqual({
      elapsedSeconds: 615,
    });
    expect(parseFocusTimerSession("broken")).toEqual({ elapsedSeconds: 0 });
  });

  it("formats and converts the actual focused time", () => {
    expect(formatFocusTime(615)).toBe("10:15");
    expect(formatFocusTime(3661)).toBe("01:01:01");
    expect(getRecordedMinutes(615)).toBe(10.3);
  });
});
