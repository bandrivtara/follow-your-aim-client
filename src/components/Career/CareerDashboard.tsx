import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowForwardRounded,
  AutoAwesomeRounded,
  CheckCircleRounded,
  CodeRounded,
  FlagRounded,
  HubRounded,
  RocketLaunchRounded,
  SchoolRounded,
  SecurityRounded,
  TrendingUpRounded,
} from "@mui/icons-material";
import routes from "config/routes";
import { useGetAimsListQuery } from "store/services/aims";
import { useGetAimsCategoriesListQuery } from "store/services/aimsCategories";
import CareerDashboardLayout from "./CareerDashboard.styled";
import {
  CAREER_PHASES,
  CAREER_SKILLS,
  CAREER_TRACKS,
  EVIDENCE_LEVEL_LABELS,
  getAimProgress,
  getCareerAims,
  getCurrentCareerPhaseId,
  getTrackProgress,
} from "./careerRoadmap";

const CareerDashboard = () => {
  const navigate = useNavigate();
  const aims = useGetAimsListQuery();
  const categories = useGetAimsCategoriesListQuery();

  const activeAims = useMemo(
    () => (aims.data || []).filter((aim) => !aim.isArchived),
    [aims.data],
  );
  const careerAims = useMemo(
    () => getCareerAims(activeAims, categories.data || []),
    [activeAims, categories.data],
  );
  const learningTracks = useMemo(
    () =>
      CAREER_TRACKS.map((track) => ({
        ...track,
        progress: getTrackProgress(track, activeAims),
      })),
    [activeAims],
  );

  const isLoading = aims.isLoading || categories.isLoading;
  const hasError = aims.isError || categories.isError;
  const currentPhaseId = getCurrentCareerPhaseId();

  return (
    <CareerDashboardLayout>
      <header className="career-hero">
        <div className="career-hero-copy">
          <Chip
            className="career-kicker"
            icon={<AutoAwesomeRounded />}
            label="Кар'єрний компас · 2026–2027"
          />
          <Typography variant="h3" component="h1">
            Від React Tech Lead до AI-native Engineering Lead
          </Typography>
          <Typography className="career-hero-description">
            Розвивай AI-assisted SDLC, agent architecture та enterprise
            leadership, не втрачаючи свою сильну базу React і TypeScript.
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} mt={2}>
            <Chip label="React / TypeScript" variant="outlined" />
            <Chip label="AI-assisted SDLC" variant="outlined" />
            <Chip label="Agentic AI та MCP" variant="outlined" />
            <Chip label="Regulated enterprise" variant="outlined" />
          </Stack>
          <Stack
            className="career-hero-actions"
            direction="row"
            gap={1}
            mt={2.5}
          >
            <Button
              variant="contained"
              startIcon={<FlagRounded />}
              onClick={() => navigate(routes.aims.add)}
            >
              Додати кар'єрну ціль
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(routes.aims.list)}
            >
              Усі цілі
            </Button>
          </Stack>
        </div>

        <Card className="career-focus-card">
          <CardContent>
            <span className="career-card-eyebrow">Фокус зараз</span>
            <Typography variant="h5" component="h2" mt={0.5}>
              Завершити Copilot і перейти до практики agents
            </Typography>
            <Typography color="text.secondary" mt={1}>
              Не починай третій великий курс. Закрий поточні два напрями й
              перетвори знання на повторювані робочі сценарії.
            </Typography>
            <ol className="career-focus-list">
              <li>Завершити GitHub Copilot Beginner to Pro.</li>
              <li>Пройти Week 2 Agentic Track.</li>
              <li>Описати перший PoC: AI Weekly Review Agent.</li>
            </ol>
          </CardContent>
        </Card>
      </header>

      {hasError && (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                aims.refetch();
                categories.refetch();
              }}
            >
              Повторити
            </Button>
          }
        >
          Не вдалося завантажити пов'язані цілі. Roadmap залишається доступним.
        </Alert>
      )}

      <section className="career-summary-grid" aria-label="Кар'єрний огляд">
        <Card className="career-summary-card career-summary-card--primary">
          <CardContent>
            <SchoolRounded />
            <strong>2</strong>
            <span>активні навчальні треки</span>
          </CardContent>
        </Card>
        <Card className="career-summary-card career-summary-card--green">
          <CardContent>
            <FlagRounded />
            <strong>{isLoading ? "…" : careerAims.length}</strong>
            <span>пов'язані активні цілі</span>
          </CardContent>
        </Card>
        <Card className="career-summary-card career-summary-card--orange">
          <CardContent>
            <CheckCircleRounded />
            <strong>2</strong>
            <span>офіційні сертифікації</span>
          </CardContent>
        </Card>
        <Card className="career-summary-card career-summary-card--purple">
          <CardContent>
            <RocketLaunchRounded />
            <strong>1</strong>
            <span>production-like PoC</span>
          </CardContent>
        </Card>
      </section>

      <section className="career-section" aria-labelledby="learning-title">
        <div className="career-section-header">
          <div>
            <Typography id="learning-title" variant="h5" component="h2">
              Активне навчання
            </Typography>
            <Typography color="text.secondary">
              Якщо у цілях є Copilot або Agentic/MCP курс, прогрес береться з
              відповідної цілі; інакше показується поточна стартова оцінка.
            </Typography>
          </div>
          <Chip
            label="5–7 годин на тиждень"
            color="primary"
            variant="outlined"
          />
        </div>
        <div className="career-track-grid">
          {learningTracks.map((track) => (
            <Card
              className="career-track-card"
              key={track.id}
              style={{ "--track-accent": track.accent } as React.CSSProperties}
            >
              <CardContent>
                <div className="career-track-heading">
                  <div>
                    <span className="career-card-eyebrow">Поточний курс</span>
                    <Typography variant="h6" component="h3">
                      {track.title}
                    </Typography>
                  </div>
                  <Box className="career-progress-ring">
                    <CircularProgress
                      variant="determinate"
                      value={track.progress}
                      size={58}
                      thickness={5}
                    />
                    <strong>{track.progress}%</strong>
                  </Box>
                </div>
                <Typography color="text.secondary" mt={1.5}>
                  {track.description}
                </Typography>
                <div className="career-next-action">
                  <ArrowForwardRounded />
                  <span>{track.nextAction}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="career-section" aria-labelledby="roadmap-title">
        <div className="career-section-header">
          <div>
            <Typography id="roadmap-title" variant="h5" component="h2">
              Roadmap на 12 місяців
            </Typography>
            <Typography color="text.secondary">
              Кожен етап завершується доказом, а не лише переглянутими лекціями.
            </Typography>
          </div>
        </div>
        <div className="career-roadmap">
          {CAREER_PHASES.map((phase, index) => (
            <article
              className={`career-phase${phase.id === currentPhaseId ? " career-phase--current" : ""}`}
              key={phase.id}
            >
              <div className="career-phase-marker">
                <span>{index + 1}</span>
              </div>
              <div className="career-phase-content">
                <span className="career-card-eyebrow">{phase.period}</span>
                <Typography variant="h6" component="h3">
                  {phase.title}
                </Typography>
                <Typography color="text.secondary" mt={0.5}>
                  {phase.description}
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.75} mt={1.5}>
                  {phase.outputs.map((output) => (
                    <Chip key={output} label={output} size="small" />
                  ))}
                </Stack>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="career-two-column career-section">
        <Card
          className="career-panel"
          component="section"
          aria-labelledby="skills-title"
        >
          <CardContent>
            <div className="career-panel-title">
              <TrendingUpRounded />
              <div>
                <Typography id="skills-title" variant="h5" component="h2">
                  Карта компетенцій
                </Typography>
                <Typography color="text.secondary">
                  Рівень визначається доказом застосування, а не відчуттям.
                </Typography>
              </div>
            </div>
            <div className="career-skill-list">
              {CAREER_SKILLS.map((skill) => (
                <div className="career-skill" key={skill.title}>
                  <div className="career-skill-heading">
                    <strong>{skill.title}</strong>
                    <span>
                      {skill.currentLevel}/{skill.targetLevel}
                    </span>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={(skill.currentLevel / 4) * 100}
                  />
                  <small>
                    {EVIDENCE_LEVEL_LABELS[skill.currentLevel]} ·{" "}
                    {skill.evidence}
                  </small>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="career-side-stack">
          <Card className="career-panel">
            <CardContent>
              <div className="career-panel-title">
                <HubRounded />
                <div>
                  <Typography variant="h5" component="h2">
                    Головний PoC
                  </Typography>
                  <Typography color="text.secondary">
                    AI Weekly Review & Planning Agent
                  </Typography>
                </div>
              </div>
              <ul className="career-check-list">
                <li>Read-only контекст із Follow Your Aim.</li>
                <li>Fact → Observation → Hypothesis → Recommendation.</li>
                <li>Preview/diff і підтвердження перед будь-яким записом.</li>
                <li>Evals, tracing, cost, latency та guardrails.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="career-panel">
            <CardContent>
              <div className="career-panel-title">
                <SecurityRounded />
                <div>
                  <Typography variant="h5" component="h2">
                    Enterprise правило
                  </Typography>
                  <Typography color="text.secondary">
                    Дані та контроль важливіші за швидкість генерації.
                  </Typography>
                </div>
              </div>
              <Typography mt={1.5}>
                Не передавати банківський код, secrets або клієнтські дані у
                непогоджені інструменти. Для agents — least privilege, sandbox,
                audit trail і human approval.
              </Typography>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="career-section" aria-labelledby="goals-title">
        <div className="career-section-header">
          <div>
            <Typography id="goals-title" variant="h5" component="h2">
              Пов'язані цілі Follow Your Aim
            </Typography>
            <Typography color="text.secondary">
              Цілі визначаються за кар'єрною категорією або ключовими словами:
              курс, програмування, Copilot, AI, agent, MCP, Python чи
              англійська.
            </Typography>
          </div>
          <Button
            endIcon={<ArrowForwardRounded />}
            onClick={() => navigate(routes.aims.list)}
          >
            Керувати цілями
          </Button>
        </div>

        {isLoading ? (
          <Card className="career-empty-card">
            <CardContent>
              <CircularProgress size={26} />
              <Typography>Завантажую цілі…</Typography>
            </CardContent>
          </Card>
        ) : careerAims.length ? (
          <div className="career-goal-grid">
            {careerAims.map((aim) => {
              const progress = getAimProgress(aim);
              return (
                <Card className="career-goal-card" key={aim.id}>
                  <CardContent>
                    <CodeRounded color="primary" />
                    <Typography variant="h6" component="h3">
                      {aim.title}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      className="career-goal-description"
                    >
                      {aim.description ||
                        "Кар'єрна ціль без додаткового опису."}
                    </Typography>
                    <div className="career-goal-progress">
                      <LinearProgress variant="determinate" value={progress} />
                      <strong>{progress}%</strong>
                    </div>
                    <Button
                      size="small"
                      onClick={() => navigate(`${routes.aims.edit}/${aim.id}`)}
                    >
                      Відкрити ціль
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="career-empty-card">
            <CardContent>
              <FlagRounded color="primary" />
              <div>
                <Typography variant="h6">Додай першу кар'єрну ціль</Typography>
                <Typography color="text.secondary">
                  Наприклад: «Завершити GitHub Copilot course і створити 3
                  командні workflow до 30 вересня».
                </Typography>
              </div>
              <Button
                variant="contained"
                onClick={() => navigate(routes.aims.add)}
              >
                Додати ціль
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <Card className="career-weekly-protocol">
        <CardContent>
          <div className="career-panel-title">
            <SchoolRounded />
            <div>
              <Typography variant="h5" component="h2">
                Мінімальний тижневий ритм
              </Typography>
              <Typography color="text.secondary">
                Достатньо для стабільного руху без перевантаження.
              </Typography>
            </div>
          </div>
          <div className="career-protocol-grid">
            <div>
              <strong>2 × 60 хв</strong>
              <span>Курс і нотатки</span>
            </div>
            <div>
              <strong>1 × 90 хв</strong>
              <span>Практичний PoC</span>
            </div>
            <div>
              <strong>20 хв</strong>
              <span>Кар'єрний огляд тижня</span>
            </div>
            <div>
              <strong>1 артефакт</strong>
              <span>Код, ADR, eval або case note</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </CareerDashboardLayout>
  );
};

export default CareerDashboard;
