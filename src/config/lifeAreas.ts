export const LIFE_AREA_IDS = [
  "health",
  "mental",
  "learning",
  "workFinance",
  "relationships",
  "creativity",
  "recovery",
] as const;

export type LifeAreaId = (typeof LIFE_AREA_IDS)[number];

export interface LifeAreaDefinition {
  id: LifeAreaId;
  title: string;
  shortTitle: string;
  color: string;
}

export const LIFE_AREAS: LifeAreaDefinition[] = [
  {
    id: "health",
    title: "Здоров'я й енергія",
    shortTitle: "Здоров'я",
    color: "#52a447",
  },
  {
    id: "mental",
    title: "Ментальний стан",
    shortTitle: "Ментальне",
    color: "#7b61a8",
  },
  {
    id: "learning",
    title: "Навчання й розвиток",
    shortTitle: "Навчання",
    color: "#3f7cac",
  },
  {
    id: "workFinance",
    title: "Робота й фінанси",
    shortTitle: "Робота",
    color: "#c78334",
  },
  {
    id: "relationships",
    title: "Стосунки й турбота",
    shortTitle: "Стосунки",
    color: "#c85b7c",
  },
  {
    id: "creativity",
    title: "Творчість і самовираження",
    shortTitle: "Творчість",
    color: "#d2a72c",
  },
  {
    id: "recovery",
    title: "Відпочинок і відновлення",
    shortTitle: "Відпочинок",
    color: "#4f9da6",
  },
];

export const getLifeArea = (id?: string) =>
  LIFE_AREAS.find((area) => area.id === id);

export const getLifeAreaTitle = (id?: string) =>
  getLifeArea(id)?.title || "Без сфери життя";
