import { isTrackerActivityArchived } from "./archiveVisibility";

describe("tracker archive visibility", () => {
  it("treats only an explicit archive flag as archived", () => {
    expect(
      isTrackerActivityArchived({
        id: "active",
        title: "Активна",
        type: "habit",
        valueType: "boolean",
        isAllDay: true,
        startTime: [],
        endTime: [],
      }),
    ).toBe(false);
    expect(
      isTrackerActivityArchived({
        id: "archived",
        title: "Архівна",
        type: "habit",
        valueType: "boolean",
        isAllDay: true,
        startTime: [],
        endTime: [],
        isArchived: true,
      }),
    ).toBe(true);
  });
});
