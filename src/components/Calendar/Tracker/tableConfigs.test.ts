import { getTrackerDayColumnLayout } from "./tableConfigs";

describe("tracker column layout", () => {
  it("keeps every month column at the same fixed width", () => {
    expect(getTrackerDayColumnLayout(31)).toEqual({
      width: 64,
      minWidth: 64,
      maxWidth: 64,
      flex: 0,
    });
  });

  it("lets day and week columns share the available space", () => {
    expect(getTrackerDayColumnLayout(1)).toMatchObject({
      minWidth: 180,
      flex: 1,
    });
    expect(getTrackerDayColumnLayout(7)).toMatchObject({
      minWidth: 90,
      flex: 1,
    });
  });
});
