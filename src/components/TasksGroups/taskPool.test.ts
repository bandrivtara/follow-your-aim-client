import { ITasksGroup } from "types/taskGroups";
import { reconcileTaskPool } from "./taskPool";

const group: ITasksGroup = {
  id: "work",
  type: "tasksGroup",
  valueType: "todoList",
  title: "Робота",
  description: "",
  tasksStore: [
    { id: "plan", title: "AI-план", status: "pending", time: [9, 0] },
  ],
  tasksStages: [
    {
      id: "course",
      title: "Курс",
      description: "",
      stagePercentage: 50,
      subTasks: [
        { id: "lesson", title: "Урок", status: "pending", time: [8, 0] },
      ],
    },
  ],
};

describe("task pool reconciliation", () => {
  it("marks the matching stored task done without adding a duplicate", () => {
    const update = reconcileTaskPool(group, [
      { id: "plan", title: "AI-план", status: "done", time: [10, 0] },
    ]);

    expect(update.tasksStore).toHaveLength(1);
    expect(update.tasksStore[0]).toMatchObject({ status: "done", time: [10, 0] });
  });

  it("updates a staged task and keeps it in its stage", () => {
    const update = reconcileTaskPool(group, [
      { id: "lesson", title: "Урок", status: "failed", time: [8, 0] },
    ]);

    expect(update.tasksStore).toHaveLength(1);
    expect(update.tasksStages?.[0].subTasks[0].status).toBe("failed");
  });

  it("adds an ad-hoc tracker task to the canonical store", () => {
    const update = reconcileTaskPool(group, [
      { id: "new", title: "Нова справа", status: "pending", time: ["", ""] },
    ]);

    expect(update.tasksStore).toHaveLength(2);
    expect(update.tasksStore[1]).toMatchObject({
      id: "new",
      title: "Нова справа",
      status: "pending",
    });
  });
});
