import dayjs from "dayjs";
import { IAim } from "types/aims.types";
import { ITasksGroup } from "types/taskGroups";
import {
  calculateTargetProgress,
  calculateTaskGroupProgress,
  getAimProgressDateTo,
} from "./aimProgressCalculations";

const aim: IAim = {
  title: "Проєкт",
  description: "",
  complexity: 1,
  dateFrom: "2024/01/01",
  dateTo: "2024/12/31",
  progress: 0,
  value: "",
  aimType: "list",
  calculationType: "sum",
  isRelatedWithHabit: false,
  finalAim: 100,
  startedPoint: 0,
  relatedHabit: [],
  relatedList: { 0: ["group-1"] },
};

const taskGroups: ITasksGroup[] = [
  {
    id: "group-1",
    title: "Група",
    description: "",
    type: "tasksGroup",
    valueType: "todoList",
    tasksStages: [
      {
        id: "stage-1",
        title: "Етап 1",
        description: "",
        stagePercentage: 30,
        subTasks: [
          { title: "1", status: "done", time: [0, 0] },
          { title: "2", status: "pending", time: [0, 0] },
        ],
      },
      {
        id: "stage-2",
        title: "Етап 2",
        description: "",
        stagePercentage: 70,
        subTasks: [{ title: "3", status: "done", time: [0, 0] }],
      },
    ],
  },
];

describe("aim progress calculations", () => {
  it("calculates ascending and descending progress from the starting point", () => {
    expect(calculateTargetProgress(0, 100, 25)).toBe(25);
    expect(calculateTargetProgress(87.5, 82, 85)).toBeCloseTo(45.45, 1);
  });

  it("clamps progress before the start and beyond the target", () => {
    expect(calculateTargetProgress(10, 20, 5)).toBe(0);
    expect(calculateTargetProgress(10, 20, 25)).toBe(100);
  });

  it("weights task stages by their configured percentages", () => {
    expect(calculateTaskGroupProgress(aim, taskGroups)).toBe(85);
  });

  it("returns zero for missing or empty task groups", () => {
    expect(calculateTaskGroupProgress(aim, [])).toBe(0);
  });

  it("does not use measurements from future days of an active aim", () => {
    expect(getAimProgressDateTo("2026/08/31", dayjs("2026-07-28"))).toBe(
      "2026/07/28",
    );
    expect(getAimProgressDateTo("2026/06/30", dayjs("2026-07-28"))).toBe(
      "2026/06/30",
    );
  });
});
