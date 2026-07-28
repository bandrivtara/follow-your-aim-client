import { isHabitData } from "./domainData";

describe("domain data guards", () => {
  it("accepts a trackable habit document", () => {
    expect(
      isHabitData({
        title: "Вода",
        type: "habit",
        valueType: "measures",
      }),
    ).toBe(true);
  });

  it.each([
    {},
    { title: "" },
    { title: "Вода", type: "tasksGroup", valueType: "measures" },
    { title: "Вода", type: "habit" },
  ])("rejects malformed habit data %#", (value) => {
    expect(isHabitData(value)).toBe(false);
  });
});
