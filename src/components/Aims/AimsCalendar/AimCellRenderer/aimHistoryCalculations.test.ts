import {
  getLastRelatedHabitValueBetweenDates,
  getRelatedHabitValuesBetweenDates,
  IHistoryMonthSnapshot,
  sumRelatedHabitValuesBetweenDates,
} from "./aimHistoryCalculations";

const relatedHabit = ["habit-1", "measure-1"];

const createDay = (value: number | string) => ({
  "habit-1": {
    measures: {
      "measure-1": { value },
    },
  },
});

describe("aim history calculations", () => {
  const months: IHistoryMonthSnapshot[] = [
    {
      id: "2026-02",
      data: {
        unix: 1770000000,
        "03": createDay(103),
        "02": createDay(102),
        "01": createDay(101),
      },
    },
    {
      id: "2026-01",
      data: {
        "31": createDay(31),
        "30": createDay(30),
        "29": createDay(29),
      },
    },
  ];

  it("uses YYYY-MM documents and inclusive cross-month boundaries", () => {
    expect(
      getRelatedHabitValuesBetweenDates(
        months,
        "2026/01/30",
        "2026/02/02",
        relatedHabit,
      ),
    ).toEqual([
      { date: "2026-01-30", value: 30 },
      { date: "2026-01-31", value: 31 },
      { date: "2026-02-01", value: 101 },
      { date: "2026-02-02", value: 102 },
    ]);
  });

  it("sums only values inside the requested date range", () => {
    expect(
      sumRelatedHabitValuesBetweenDates(
        months,
        "2026/01/30",
        "2026/02/02",
        relatedHabit,
      ),
    ).toBe(264);
  });

  it("finds the latest value regardless of document or field order", () => {
    expect(
      getLastRelatedHabitValueBetweenDates(
        months,
        "2026/01/30",
        "2026/02/02",
        relatedHabit,
      ),
    ).toBe(102);
  });

  it("keeps zero and numeric string measurements as valid values", () => {
    const values = getRelatedHabitValuesBetweenDates(
      [
        {
          id: "2026-02",
          data: {
            "01": createDay("12.5"),
            "02": createDay(0),
          },
        },
      ],
      "2026/02/01",
      "2026/02/02",
      relatedHabit,
    );

    expect(values).toEqual([
      { date: "2026-02-01", value: 12.5 },
      { date: "2026-02-02", value: 0 },
    ]);
    expect(
      getLastRelatedHabitValueBetweenDates(
        [{ id: "2026-02", data: { "02": createDay(0) } }],
        "2026/02/02",
        "2026/02/02",
        relatedHabit,
      ),
    ).toBe(0);
  });

  it("returns no values for invalid ranges or incomplete relationships", () => {
    expect(
      getRelatedHabitValuesBetweenDates(
        months,
        "2026/02/02",
        "2026/01/30",
        relatedHabit,
      ),
    ).toEqual([]);
    expect(
      getRelatedHabitValuesBetweenDates(months, "2026/01/30", "2026/02/02", [
        "habit-1",
      ]),
    ).toEqual([]);
  });
});
