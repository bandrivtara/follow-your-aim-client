import { downloadFirebaseBackup } from "./firebaseBackup";

describe("Firebase backup download", () => {
  it("exports a versioned JSON file", () => {
    const click = jest.fn();
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, "createElement").mockImplementation((tagName) => {
      const element = originalCreateElement(tagName);
      if (tagName === "a") element.click = click;
      return element;
    });
    const createObjectURL = jest.fn(() => "blob:backup");
    const revokeObjectURL = jest.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });

    downloadFirebaseBackup({
      format: "follow-your-aim-backup-v1",
      exportedAt: "2026-08-18T10:00:00.000Z",
      projectId: "test",
      collections: {},
    });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:backup");
  });
});
