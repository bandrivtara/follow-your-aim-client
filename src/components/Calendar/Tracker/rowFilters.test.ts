import { IHistoryDayRow } from "types/history.types";
import { filterTrackerRows } from "./rowFilters";

const makeRow = (
  id: string,
  details: Record<string, unknown>,
  activity?: Record<string, unknown>,
) =>
  ({
    id,
    details: { id, title: id, ...details },
    ...(activity ? { "1": activity } : {}),
  }) as unknown as IHistoryDayRow;

describe("filterTrackerRows", () => {
  const daily = makeRow("daily", { type: "habit", category: "daily" });
  const sport = makeRow("sport", { type: "habit", category: "sport" });
  const groupedHabit = makeRow("grouped-habit", {
    type: "habit",
    category: ["morning", "health"],
  });
  const taskGroup = makeRow("task-group", { type: "tasksGroup" });

  it("keeps all rows for the all filter", () => {
    const rows = [daily, sport];

    expect(filterTrackerRows(rows, "all")).toBe(rows);
  });

  it("filters legacy activity categories", () => {
    const rows = [daily, sport, groupedHabit];

    expect(filterTrackerRows(rows, "daily")).toEqual([daily]);
    expect(filterTrackerRows(rows, "sport")).toEqual([sport]);
  });

  it("includes task groups and legacy grouped habits", () => {
    expect(
      filterTrackerRows([daily, groupedHabit, taskGroup], "grouped"),
    ).toEqual([groupedHabit, taskGroup]);
  });

  it("finds planned boolean, measured, and task activities", () => {
    const plannedBoolean = makeRow(
      "boolean",
      { type: "habit" },
      { isPlanned: true },
    );
    const plannedMeasure = makeRow(
      "measure",
      { type: "habit" },
      { measures: { duration: { plannedValue: 30, value: 0 } } },
    );
    const plannedTasks = makeRow(
      "tasks",
      { type: "tasksGroup" },
      { tasks: [{ title: "Task" }] },
    );
    const unplanned = makeRow(
      "unplanned",
      { type: "habit" },
      { isPlanned: false, measures: {} },
    );

    expect(
      filterTrackerRows(
        [plannedBoolean, plannedMeasure, plannedTasks, unplanned],
        "only-planned",
      ),
    ).toEqual([plannedBoolean, plannedMeasure, plannedTasks]);
  });
});
