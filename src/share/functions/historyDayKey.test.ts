import dayjs from "dayjs";
import { getDaysBetweenDates } from "./getDaysBetweenDates";
import { normalizeHistoryDayKey } from "./historyDayKey";

describe("history day keys", () => {
  it.each([
    [1, "01"],
    ["1", "01"],
    ["01", "01"],
    [10, "10"],
    [31, "31"],
  ])("normalizes %p to the canonical DD key", (day, expected) => {
    expect(normalizeHistoryDayKey(day)).toBe(expected);
  });

  it("uses padded keys across the first ten days of a month", () => {
    const days = getDaysBetweenDates(
      dayjs("2026-09-01"),
      dayjs("2026-09-10"),
    );

    expect(days.map((day) => day.day)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
    ]);
  });
});
