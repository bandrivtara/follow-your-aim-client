import {
  getRelationshipUpdates,
  getRelationTitle,
} from "./getRelationshipUpdates";

describe("relationship helpers", () => {
  it("assigns selected records and clears records removed from a relation", () => {
    expect(
      getRelationshipUpdates(
        ["kept", "removed"],
        ["kept", "added"],
        "relation-1",
      ),
    ).toEqual([
      { id: "kept", relationId: "relation-1" },
      { id: "removed", relationId: "" },
      { id: "added", relationId: "relation-1" },
    ]);
  });

  it("resolves titles and gives readable fallbacks", () => {
    const items = [{ id: "known", title: "Здоров’я" }];

    expect(getRelationTitle("known", items, "Без сфери")).toBe("Здоров’я");
    expect(getRelationTitle("missing", items, "Без сфери")).toBe(
      "Не знайдено (missing)",
    );
    expect(getRelationTitle("", items, "Без сфери")).toBe("Без сфери");
  });
});
