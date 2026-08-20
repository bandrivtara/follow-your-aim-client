import { getPlannerConsistencyValues } from "./plannerConsistencyCalculations";

describe("planner consistency calculations", () => {
  const historyMonths = [
    {
      id: "2026-08",
      data: {
        "19": {
          first: { isPlanned: true, progress: 100 },
          second: { isPlanned: true, progress: 0 },
        },
        "20": {
          first: { isPlanned: true, progress: 51 },
        },
        "21": {
          bonus: { isPlanned: false, progress: 100 },
        },
      },
    },
  ];

  it("counts only planned days completed strictly above 50 percent", () => {
    expect(
      getPlannerConsistencyValues(
        historyMonths,
        "2026/08/19",
        "2026/08/21",
        50,
      ),
    ).toEqual([
      { date: "2026-08-19", value: 0 },
      { date: "2026-08-20", value: 1 },
      { date: "2026-08-21", value: 0 },
    ]);
  });

  it("returns no values for an invalid date range", () => {
    expect(
      getPlannerConsistencyValues(
        historyMonths,
        "2026/08/21",
        "2026/08/19",
        50,
      ),
    ).toEqual([]);
  });
});
