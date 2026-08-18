import { IAimData } from "types/aims.types";
import {
  CAREER_TRACKS,
  getAimProgress,
  getCareerAims,
  getCurrentCareerPhaseId,
  getTrackProgress,
} from "./careerRoadmap";

const createAim = (overrides: Partial<IAimData> = {}): IAimData => ({
  id: "aim-1",
  title: "Завершити курс",
  description: "",
  complexity: 5,
  dateFrom: "2026-08-01",
  dateTo: "2026-09-30",
  progress: 35,
  value: 0,
  aimType: "number",
  calculationType: "sum",
  isRelatedWithHabit: false,
  finalAim: 100,
  startedPoint: 0,
  relatedHabit: [],
  relatedList: {},
  ...overrides,
});

describe("career roadmap calculations", () => {
  it("finds active career aims by title, description or category", () => {
    const aims = [
      createAim({ id: "copilot", title: "Завершити GitHub Copilot" }),
      createAim({ id: "health", title: "Схуднути до 94 кг" }),
      createAim({
        id: "category",
        title: "Підготувати кейс",
        aimsCategoryId: "career",
      }),
      createAim({ id: "archived", title: "Python курс", isArchived: true }),
    ];

    expect(
      getCareerAims(aims, [
        { id: "career", title: "Кар'єра", description: "" },
      ]).map((aim) => aim.id),
    ).toEqual(["copilot", "category"]);
  });

  it("uses a linked aim instead of the initial course estimate", () => {
    expect(
      getTrackProgress(CAREER_TRACKS[0], [
        createAim({ title: "GitHub Copilot certification", progress: 72 }),
      ]),
    ).toBe(72);
  });

  it("clamps aim progress to a meaningful percentage", () => {
    expect(getAimProgress(createAim({ progress: 140 }))).toBe(100);
    expect(getAimProgress(createAim({ progress: -20 }))).toBe(0);
  });

  it("selects the current roadmap phase from the actual date", () => {
    expect(getCurrentCareerPhaseId(new Date(2026, 7, 18))).toBe("foundation");
    expect(getCurrentCareerPhaseId(new Date(2027, 3, 10))).toBe("team");
  });
});
