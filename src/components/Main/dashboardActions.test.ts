import {
  completeBooleanHabit,
  completeMeasuredHabit,
  completeTaskAtIndex,
  appendQuickTask,
  resetActivityForPlanning,
} from "./dashboardActions";

const habit = {
  id: "habit-1",
  title: "Вода",
  type: "habit" as const,
  valueType: "measures" as const,
  isAllDay: true,
  startTime: [0, 0],
  endTime: [0, 0],
  fields: [
    {
      id: "ml",
      name: "Мілілітри",
      minToComplete: 2000,
      unit: "ml",
      orderIndex: 0,
    },
  ],
};

describe("dashboard actions", () => {
  it("resets copied plan values without changing targets", () => {
    expect(
      resetActivityForPlanning({
        progress: 100,
        status: "done",
        measures: { ml: { value: 2000, plannedValue: 2000 } },
      }),
    ).toMatchObject({
      progress: 0,
      status: "pending",
      isPlanned: true,
      measures: { ml: { value: 0, plannedValue: 2000 } },
    });
  });

  it("completes a boolean habit", () => {
    expect(
      completeBooleanHabit({ ...habit, valueType: "boolean" }, {}),
    ).toMatchObject({
      id: "habit-1",
      progress: 100,
      status: "done",
      isPlanned: true,
    });
  });

  it("calculates measured completion against the planned target", () => {
    expect(completeMeasuredHabit(habit, {}, { ml: 1000 })).toMatchObject({
      progress: 50,
      status: "pending",
      measures: { ml: { value: 1000, plannedValue: 2000 } },
    });
  });

  it("completes one task and recalculates group progress", () => {
    expect(
      completeTaskAtIndex(
        { tasks: [{ status: "pending" }, { status: "pending" }] },
        1,
      ),
    ).toMatchObject({
      progress: 50,
      tasks: [{ status: "pending" }, { status: "done" }],
    });
  });

  it("appends a quick task using the existing task-list history shape", () => {
    expect(
      appendQuickTask(
        {
          id: "inbox",
          title: "Список справ",
          type: "tasksGroup",
          valueType: "todoList",
          description: "",
        },
        {
          tasks: [{ id: "done", title: "Готове", status: "done", time: [0, 0] }],
          progress: 100,
        },
        "  Подзвонити лікарю  ",
        "new-task",
      ),
    ).toMatchObject({
      id: "inbox",
      type: "tasksGroup",
      valueType: "todoList",
      isPlanned: true,
      progress: 50,
      status: "pending",
      tasks: [
        { id: "done", status: "done" },
        { id: "new-task", title: "Подзвонити лікарю", status: "pending" },
      ],
    });
  });
});
