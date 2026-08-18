import dayjs from "dayjs";
import { IAimData } from "types/aims.types";
import {
  calculateAimProgressSnapshot,
  getAimTimelinePosition,
  getExpectedAimProgress,
  getTodayTimelinePosition,
} from "./aimRoadmapCalculations";

const makeAim = (overrides: Partial<IAimData> = {}): IAimData => ({
  id: "aim-1",
  title: "Ціль",
  description: "",
  complexity: 1,
  dateFrom: "2026/08/01",
  dateTo: "2026/08/31",
  progress: 0,
  value: "",
  aimType: "number",
  calculationType: "sum",
  isRelatedWithHabit: false,
  finalAim: 100,
  startedPoint: 0,
  currentValue: 30,
  relatedHabit: [],
  relatedList: {},
  ...overrides,
});

describe("aim roadmap calculations", () => {
  it("calculates expected progress and pace independently from actual progress", () => {
    const aim = makeAim();
    const today = dayjs("2026-08-16");

    expect(getExpectedAimProgress(aim, today)).toBe(50);
    expect(calculateAimProgressSnapshot(aim, [], [], today)).toMatchObject({
      currentValue: 30,
      progress: 30,
      expectedProgress: 50,
      status: "attention",
    });
  });

  it("builds a cumulative trend for sum-based habit goals", () => {
    const aim = makeAim({
      isRelatedWithHabit: true,
      relatedHabit: ["habit-1", "measure-1"],
      finalAim: 20,
    });
    const historyMonths = [
      {
        id: "2026-08",
        data: {
          "01": {
            "habit-1": { measures: { "measure-1": { value: 5 } } },
          },
          "02": {
            "habit-1": { measures: { "measure-1": { value: 7 } } },
          },
        },
      },
    ];

    expect(
      calculateAimProgressSnapshot(aim, [], historyMonths, dayjs("2026-08-02")),
    ).toMatchObject({
      currentValue: 12,
      progress: 60,
      trend: [
        { date: "2026-08-01", value: 5 },
        { date: "2026-08-02", value: 12 },
      ],
    });
  });

  it("clips goal and today positions to the visible range", () => {
    const aim = makeAim({
      dateFrom: "2026/07/15",
      dateTo: "2026/09/15",
    });
    const rangeFrom = dayjs("2026-08-01");
    const rangeTo = dayjs("2026-08-31");

    expect(getAimTimelinePosition(aim, rangeFrom, rangeTo)).toEqual({
      left: 0,
      width: 100,
    });
    expect(
      getTodayTimelinePosition(rangeFrom, rangeTo, dayjs("2026-08-16")),
    ).toBeCloseTo(48.39, 1);
  });
});
