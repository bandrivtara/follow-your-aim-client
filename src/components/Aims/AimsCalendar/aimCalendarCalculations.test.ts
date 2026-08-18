import dayjs from "dayjs";
import { IAimData } from "types/aims.types";
import { getAimsDateRange, isAimInRange } from "./aimCalendarCalculations";

const makeAim = (dateFrom: string, dateTo: string): IAimData => ({
  id: "aim-1",
  title: "Ціль",
  description: "",
  complexity: 1,
  dateFrom,
  dateTo,
  progress: 0,
  value: "",
  aimType: "number",
  calculationType: "sum",
  isRelatedWithHabit: false,
  finalAim: 10,
  startedPoint: 0,
  relatedHabit: [],
  relatedList: {},
});

describe("aim calendar calculations", () => {
  it("builds a range that includes every valid aim", () => {
    const range = getAimsDateRange([
      makeAim("2024/08/26", "2024/10/31"),
      makeAim("2023/12/10", "2024/01/05"),
    ]);

    expect(range?.[0].format("YYYY-MM-DD")).toBe("2023-12-01");
    expect(range?.[1].format("YYYY-MM-DD")).toBe("2024-10-31");
  });

  it("detects an aim that overlaps the selected months", () => {
    const aim = makeAim("2024/08/26", "2024/10/31");

    expect(isAimInRange(aim, [dayjs("2024-10-01"), dayjs("2024-12-31")])).toBe(
      true,
    );
    expect(isAimInRange(aim, [dayjs("2026-01-01"), dayjs("2026-12-31")])).toBe(
      false,
    );
  });
});
