import { IAimData } from "types/aims.types";
import { IAimsCategoryData } from "types/aimsCategories.types";

export type CareerEvidenceLevel = 0 | 1 | 2 | 3 | 4;

export interface CareerTrack {
  id: "copilot" | "agentic";
  title: string;
  description: string;
  initialProgress: number;
  aimKeywords: string[];
  nextAction: string;
  accent: string;
}

export const CAREER_TRACKS: CareerTrack[] = [
  {
    id: "copilot",
    title: "GitHub Copilot: Beginner to Pro",
    description:
      "Щоденний AI-assisted workflow, custom instructions, agents, MCP, testing і code review.",
    initialProgress: 50,
    aimKeywords: ["copilot", "github copilot"],
    nextAction:
      "Завершити курс і зафіксувати 3 повторювані workflow для своєї команди.",
    accent: "#5b6cf9",
  },
  {
    id: "agentic",
    title: "AI Engineer Agentic Track",
    description:
      "Agent architecture, OpenAI Agents SDK, LangGraph, MCP та керовані multi-agent workflows.",
    initialProgress: 17,
    aimKeywords: [
      "agentic",
      "agent",
      "агент",
      "llm",
      "mcp",
      "6-тижнев",
      "6 тижнев",
    ],
    nextAction:
      "Пройти Week 2 і вести короткі нотатки: pattern, ризик, де застосувати в enterprise.",
    accent: "#14b8a6",
  },
];

export const CAREER_PHASES = [
  {
    id: "foundation",
    dateFrom: "2026-08-01",
    dateTo: "2026-09-30",
    period: "Серпень – вересень 2026",
    title: "AI-assisted фундамент",
    description:
      "Завершити Copilot-курс і перенести знання у реальний React Tech Lead workflow.",
    outputs: [
      "3 командні AI-workflow",
      "Правила безпечного використання",
      "GH-300 readiness",
    ],
  },
  {
    id: "agents",
    dateFrom: "2026-10-01",
    dateTo: "2026-11-30",
    period: "Вересень – листопад 2026",
    title: "Agent architecture",
    description:
      "Завершити Agentic Track, сфокусувавшись на tools, state, MCP, evals і human approval.",
    outputs: [
      "8 навчальних проєктів",
      "Python foundations",
      "Agent patterns notes",
    ],
  },
  {
    id: "poc",
    dateFrom: "2026-12-01",
    dateTo: "2027-02-28",
    period: "Грудень 2026 – лютий 2027",
    title: "Production-like PoC",
    description:
      "Побудувати AI Weekly Review & Planning Agent для Follow Your Aim без банківських даних.",
    outputs: [
      "Read-only context",
      "Preview перед записом",
      "Tracing, evals, guardrails",
    ],
  },
  {
    id: "team",
    dateFrom: "2027-03-01",
    dateTo: "2027-05-31",
    period: "Березень – травень 2027",
    title: "Командний вплив",
    description:
      "Провести невеликий AI-assisted SDLC pilot і виміряти якість, швидкість та ризики.",
    outputs: ["Pilot у команді", "Case study", "GH-600 readiness"],
  },
  {
    id: "decision",
    dateFrom: "2027-06-01",
    dateTo: "2027-08-31",
    period: "Червень – серпень 2027",
    title: "Кар'єрне рішення",
    description:
      "Обрати наступний важіль: внутрішня AI Lead роль, зовнішній перехід або перший paid pilot.",
    outputs: ["GH-600", "Оновлений LinkedIn/CV", "Перевірений ринковий попит"],
  },
] as const;

export const CAREER_SKILLS: Array<{
  title: string;
  currentLevel: CareerEvidenceLevel;
  targetLevel: CareerEvidenceLevel;
  evidence: string;
}> = [
  {
    title: "React / TypeScript architecture",
    currentLevel: 4,
    targetLevel: 4,
    evidence: "Tech Lead на великому enterprise-проєкті",
  },
  {
    title: "AI-assisted SDLC",
    currentLevel: 2,
    targetLevel: 4,
    evidence: "Copilot-курс і практичне використання coding agents",
  },
  {
    title: "Agent architecture та MCP",
    currentLevel: 1,
    targetLevel: 3,
    evidence: "Завершено Week 1 Agentic Track",
  },
  {
    title: "Python для AI backend",
    currentLevel: 1,
    targetLevel: 3,
    evidence: "Налаштовано Python, pip та uv",
  },
  {
    title: "Evals, tracing і reliability",
    currentLevel: 0,
    targetLevel: 3,
    evidence: "Заплановано у production-like PoC",
  },
  {
    title: "AI security та governance",
    currentLevel: 1,
    targetLevel: 4,
    evidence: "Банківський домен; потрібен доказ через pilot",
  },
];

export const EVIDENCE_LEVEL_LABELS = [
  "Заплановано",
  "Вивчаю",
  "Застосував у PoC",
  "Застосував у production",
  "Стандартизував для команди",
] as const;

export const CAREER_KEYWORDS = [
  "кар'єр",
  "career",
  "програм",
  "курс",
  "навчан",
  "сертиф",
  "copilot",
  "github",
  "agent",
  "агент",
  "llm",
  "mcp",
  "react",
  "typescript",
  "python",
  "англі",
];

const normalizeText = (value: unknown) =>
  String(value || "").toLocaleLowerCase("uk-UA");

const clampProgress = (value: number) =>
  Math.min(100, Math.max(0, Math.round(value)));

export const getAimProgress = (aim: IAimData) => {
  if (Number.isFinite(Number(aim.progress))) {
    return clampProgress(Number(aim.progress));
  }

  if (
    Number.isFinite(Number(aim.currentValue)) &&
    Number.isFinite(Number(aim.startedPoint)) &&
    Number.isFinite(Number(aim.finalAim)) &&
    Number(aim.finalAim) !== Number(aim.startedPoint)
  ) {
    const progress =
      ((Number(aim.currentValue) - Number(aim.startedPoint)) /
        (Number(aim.finalAim) - Number(aim.startedPoint))) *
      100;
    return clampProgress(progress);
  }

  return 0;
};

export const getCareerAims = (
  aims: IAimData[],
  categories: IAimsCategoryData[],
) => {
  const categoriesById = new Map(
    categories.map((category) => [category.id, category]),
  );

  return aims.filter((aim) => {
    if (aim.isArchived) return false;
    const category = aim.aimsCategoryId
      ? categoriesById.get(aim.aimsCategoryId)
      : undefined;
    const searchableText = normalizeText(
      `${aim.title} ${aim.description} ${category?.title || ""}`,
    );

    return CAREER_KEYWORDS.some((keyword) => searchableText.includes(keyword));
  });
};

export const getTrackProgress = (track: CareerTrack, aims: IAimData[]) => {
  const matchingAims = aims.filter((aim) => {
    const searchableText = normalizeText(`${aim.title} ${aim.description}`);
    return track.aimKeywords.some((keyword) =>
      searchableText.includes(keyword),
    );
  });

  if (!matchingAims.length) return track.initialProgress;
  return Math.max(...matchingAims.map(getAimProgress));
};

export const getCurrentCareerPhaseId = (date = new Date()) => {
  const dateKey = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  return CAREER_PHASES.find(
    (phase) => dateKey >= phase.dateFrom && dateKey <= phase.dateTo,
  )?.id;
};
