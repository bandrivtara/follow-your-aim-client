import dayjs from "dayjs";
import { ITasksGroup } from "types/taskGroups";
import {
  buildTaskOverviewRows,
  buildTasksActivity,
  getTaskOverviewBucket,
  sortTaskOverviewRows,
} from "./taskOverview";

const groups: ITasksGroup[] = [
  {
    id: "work",
    type: "tasksGroup",
    valueType: "todoList",
    title: "Програмування",
    description: "",
    tasksStore: [
      { id: "plan", title: "AI-план", status: "pending", time: [9, 0] },
      {
        id: "read",
        title: "Матеріал",
        status: "pending",
        time: ["", ""],
      },
    ],
    tasksStages: [
      {
        id: "research",
        title: "Дослідження",
        description: "",
        stagePercentage: 30,
        subTasks: [
          {
            id: "respondent",
            title: "Респондент",
            status: "pending",
            time: ["", ""],
          },
        ],
      },
    ],
  },
];

describe("task overview", () => {
  it("combines scheduled history with unscheduled store and stage tasks", () => {
    const rows = buildTaskOverviewRows(groups, [
      {
        id: "2026-09",
        unix: 1,
        "07": {
          work: {
            tasks: [
              {
                id: "plan",
                title: "AI-план",
                status: "pending",
                time: [9, 0],
              },
            ],
          },
        },
      },
    ]);

    expect(rows.map(({ source, task }) => `${source}:${task.title}`)).toEqual([
      "scheduled:AI-план",
      "store:Матеріал",
      "stage:Респондент",
    ]);
    expect(rows[0]).toMatchObject({
      date: "2026-09-07",
      groupTitle: "Програмування",
    });
  });

  it("classifies and sorts overdue work before today and backlog", () => {
    const today = dayjs("2026-09-07");
    const rows = buildTaskOverviewRows(groups, [
      {
        id: "2026-09",
        "06": {
          work: {
            tasks: [{ title: "Старе", status: "pending", time: [12, 0] }],
          },
        },
        "07": {
          work: {
            tasks: [{ title: "Сьогодні", status: "pending", time: [8, 0] }],
          },
        },
      },
    ]);
    const scheduled = rows.filter(({ source }) => source === "scheduled");

    expect(getTaskOverviewBucket(scheduled[0], today)).toBe("overdue");
    expect(sortTaskOverviewRows(rows, today)[0].task.title).toBe("Старе");
  });

  it("recalculates task-group progress and status", () => {
    expect(
      buildTasksActivity(groups[0], {}, [
        { title: "1", status: "done", time: ["", ""] },
        { title: "2", status: "pending", time: ["", ""] },
      ]),
    ).toMatchObject({ progress: 50, status: "pending", isPlanned: true });
  });
});
