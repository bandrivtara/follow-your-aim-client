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
    color: "#18a874",
  },
  {
    id: "mental",
    title: "Ментальний стан",
    shortTitle: "Ментальне",
    color: "#8b5cf6",
  },
  {
    id: "learning",
    title: "Навчання й розвиток",
    shortTitle: "Навчання",
    color: "#3b82f6",
  },
  {
    id: "workFinance",
    title: "Робота й фінанси",
    shortTitle: "Робота",
    color: "#f59e0b",
  },
  {
    id: "relationships",
    title: "Стосунки й турбота",
    shortTitle: "Стосунки",
    color: "#f43f5e",
  },
  {
    id: "creativity",
    title: "Творчість і самовираження",
    shortTitle: "Творчість",
    color: "#d97706",
  },
  {
    id: "recovery",
    title: "Відпочинок і відновлення",
    shortTitle: "Відпочинок",
    color: "#06b6d4",
  },
];

export const getLifeArea = (id?: string) =>
  LIFE_AREAS.find((area) => area.id === id);

export const getLifeAreaTitle = (id?: string) =>
  getLifeArea(id)?.title || "Без сфери життя";
