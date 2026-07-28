import dayjs from "dayjs";
import {
  getTrackerDateRange,
  isDateInTrackerRange,
  shiftTrackerDateRange,
} from "./calendarRange";

describe("tracker calendar ranges", () => {
  const currentDate = dayjs("2026-07-28");

  it("builds a Monday-to-Sunday current week", () => {
    const [from, to] = getTrackerDateRange(currentDate, "week");

    expect(from.format("YYYY-MM-DD")).toBe("2026-07-27");
    expect(to.format("YYYY-MM-DD")).toBe("2026-08-02");
  });

  it("builds day and month ranges", () => {
    expect(
      getTrackerDateRange(currentDate, "day")[0].format("YYYY-MM-DD"),
    ).toBe("2026-07-28");
    expect(
      getTrackerDateRange(currentDate, "month").map((date) =>
        date.format("YYYY-MM-DD"),
      ),
    ).toEqual(["2026-07-01", "2026-07-31"]);
  });

  it("moves a custom range by its own duration", () => {
    const shifted = shiftTrackerDateRange(
      [dayjs("2026-07-10"), dayjs("2026-07-12")],
      "custom",
      1,
    );

    expect(shifted.map((date) => date.format("YYYY-MM-DD"))).toEqual([
      "2026-07-13",
      "2026-07-15",
    ]);
  });

  it("detects whether today belongs to the visible range", () => {
    const range = getTrackerDateRange(currentDate, "week");

    expect(isDateInTrackerRange(currentDate, range)).toBe(true);
    expect(isDateInTrackerRange(dayjs("2026-08-03"), range)).toBe(false);
  });
});
