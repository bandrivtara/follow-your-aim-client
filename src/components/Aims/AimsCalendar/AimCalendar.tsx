import {
  CalendarOutlined,
  EditOutlined,
  ExpandOutlined,
  LineChartOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Alert, Button, DatePicker, Segmented, Spin } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import routes from "config/routes";
import entityIds from "config/habitsIds.json";
import englishProgress from "config/englishProgress.generated.json";
import { getHistoryBetweenDates } from "share/fireBase/getHistoryBetweenDates";
import { getRelationTitle } from "share/functions/getRelationshipUpdates";
import { useGetAimsListQuery } from "store/services/aims";
import { useGetAimsCategoriesListQuery } from "store/services/aimsCategories";
import { useGetHabitListQuery } from "store/services/habits";
import { useGetTaskGroupListQuery } from "store/services/taskGroups";
import { IAimData } from "types/aims.types";
import { getAimsDateRange, isAimInRange } from "./aimCalendarCalculations";
import {
  AimPaceStatus,
  calculateAimProgressSnapshot,
  clampProgress,
  getAimTimelinePosition,
  getTodayTimelinePosition,
  IAimProgressSnapshot,
} from "./aimRoadmapCalculations";
import { IHistoryMonthSnapshot } from "./AimCellRenderer/aimHistoryCalculations";
import AimTrendChart from "./AimTrendChart";
import StyledAimCalendar from "./AimCalendar.styled";

type RoadmapFilter = "active" | "onTrack" | "attention";

const statusMeta: Record<AimPaceStatus, { label: string; className: string }> =
  {
    completed: { label: "Виконано", className: "is-completed" },
    upcoming: { label: "Заплановано", className: "is-upcoming" },
    overdue: { label: "Прострочено", className: "is-overdue" },
    attention: { label: "Потребує уваги", className: "is-attention" },
    onTrack: { label: "За планом", className: "is-on-track" },
  };

const numberFormatter = new Intl.NumberFormat("uk-UA", {
  maximumFractionDigits: 1,
});

const formatNumber = (value: number) => numberFormatter.format(value || 0);

const getMonthsInRange = (rangeFrom: Dayjs, rangeTo: Dayjs) => {
  const months: Dayjs[] = [];
  let currentMonth = rangeFrom.startOf("month");
  const lastMonth = rangeTo.startOf("month");

  while (
    currentMonth.isBefore(lastMonth, "month") ||
    currentMonth.isSame(lastMonth, "month")
  ) {
    months.push(currentMonth);
    currentMonth = currentMonth.add(1, "month");
  }

  return months;
};

const AimCalendar = () => {
  const navigate = useNavigate();
  const allAims = useGetAimsListQuery();
  const taskGroups = useGetTaskGroupListQuery();
  const aimCategories = useGetAimsCategoriesListQuery();
  const habits = useGetHabitListQuery();
  const [historyMonths, setHistoryMonths] = useState<IHistoryMonthSnapshot[]>(
    [],
  );
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [historyReloadKey, setHistoryReloadKey] = useState(0);
  const [filter, setFilter] = useState<RoadmapFilter>("active");
  const [selectedAimId, setSelectedAimId] = useState<string | null>(null);
  const [monthsDates, setMonthsDates] = useState<[Dayjs, Dayjs]>(() => [
    dayjs().startOf("month"),
    dayjs().add(2, "month").endOf("month"),
  ]);

  useEffect(() => {
    let isCurrent = true;
    const relatedAims = (allAims.data || []).filter(
      (aim) =>
        !aim.isArchived &&
        aim.isRelatedWithHabit &&
        dayjs(aim.dateFrom).isValid() &&
        dayjs(aim.dateTo).isValid() &&
        !dayjs(aim.dateFrom).isAfter(dayjs(), "day"),
    );

    if (!relatedAims.length) {
      setHistoryMonths([]);
      setHistoryError(false);
      return () => {
        isCurrent = false;
      };
    }

    const earliestDate = relatedAims.reduce(
      (earliest, aim) =>
        dayjs(aim.dateFrom).isBefore(earliest) ? dayjs(aim.dateFrom) : earliest,
      dayjs(relatedAims[0].dateFrom),
    );
    const latestDate = relatedAims.reduce((latest, aim) => {
      const aimProgressTo = dayjs(aim.dateTo).isAfter(dayjs(), "day")
        ? dayjs()
        : dayjs(aim.dateTo);
      return aimProgressTo.isAfter(latest) ? aimProgressTo : latest;
    }, earliestDate);

    const loadHistory = async () => {
      setIsHistoryLoading(true);
      setHistoryError(false);
      try {
        const snapshot = await getHistoryBetweenDates(
          earliestDate.format("YYYY/MM/DD"),
          latestDate.format("YYYY/MM/DD"),
        );
        if (!isCurrent) return;
        setHistoryMonths(
          snapshot.docs.map((historyDocument) => ({
            id: historyDocument.id,
            data: historyDocument.data(),
          })),
        );
      } catch {
        if (isCurrent) {
          setHistoryMonths([]);
          setHistoryError(true);
        }
      } finally {
        if (isCurrent) setIsHistoryLoading(false);
      }
    };

    loadHistory();
    return () => {
      isCurrent = false;
    };
  }, [allAims.data, historyReloadKey]);

  const activeAims = useMemo(
    () =>
      (allAims.data || []).filter(
        (aim) => !aim.isArchived && isAimInRange(aim, monthsDates),
      ),
    [allAims.data, monthsDates],
  );

  const progressByAim = useMemo(() => {
    const progressMap = new Map<string, IAimProgressSnapshot>();
    activeAims.forEach((aim) => {
      progressMap.set(
        aim.id,
        calculateAimProgressSnapshot(
          aim,
          taskGroups.data || [],
          historyMonths,
          dayjs(),
          aim.id === entityIds.aims.englishVocabulary.details
            ? englishProgress.learnedCount
            : undefined,
        ),
      );
    });
    return progressMap;
  }, [activeAims, historyMonths, taskGroups.data]);

  const visibleAims = useMemo(
    () =>
      activeAims.filter((aim) => {
        const status = progressByAim.get(aim.id)?.status;
        if (filter === "onTrack") {
          return status === "onTrack" || status === "completed";
        }
        if (filter === "attention") {
          return status === "attention" || status === "overdue";
        }
        return true;
      }),
    [activeAims, filter, progressByAim],
  );

  useEffect(() => {
    if (!visibleAims.length) {
      setSelectedAimId(null);
      return;
    }
    if (!visibleAims.some((aim) => aim.id === selectedAimId)) {
      setSelectedAimId(visibleAims[0].id);
    }
  }, [selectedAimId, visibleAims]);

  const [rangeFrom, rangeTo] = monthsDates;
  const months = useMemo(
    () => getMonthsInRange(rangeFrom, rangeTo),
    [rangeFrom, rangeTo],
  );
  const todayPosition = getTodayTimelinePosition(rangeFrom, rangeTo);
  const selectedAim = visibleAims.find(({ id }) => id === selectedAimId);
  const selectedProgress = selectedAim
    ? progressByAim.get(selectedAim.id)
    : undefined;
  const timelineWidth = Math.max(430, months.length * 138);
  const roadmapStyle = {
    "--fya-timeline-width": `${timelineWidth}px`,
    "--fya-month-count": months.length,
  } as CSSProperties;

  const onChange = (dates: null | (Dayjs | null)[]) => {
    if (dates?.[0] && dates[1]) {
      setMonthsDates([dates[0].startOf("month"), dates[1].endOf("month")]);
    }
  };

  const showAllAims = () => {
    const aimsRange = getAimsDateRange(
      allAims.data?.filter((aim) => !aim.isArchived),
    );
    if (aimsRange) setMonthsDates(aimsRange);
  };

  const showCurrentYear = () => {
    setMonthsDates([dayjs().startOf("year"), dayjs().endOf("year")]);
  };

  const getAimUnit = (aim: IAimData) => {
    if (aim.id === entityIds.aims.englishVocabulary.details) return "слів";
    if (!aim.isRelatedWithHabit) return "";
    const [habitId, measureId] = aim.relatedHabit || [];
    return (
      habits.data
        ?.find((habit) => habit.id === habitId)
        ?.fields?.find((field) => field.id === measureId)?.unit || ""
    );
  };

  const getAimContext = (aim: IAimData) => {
    if (aim.id === entityIds.aims.englishVocabulary.details) {
      return `Дані з English repository · ${englishProgress.totalTracked} відстежується`;
    }
    if (aim.isRelatedWithHabit) {
      const habit = habits.data?.find(
        (item) => item.id === aim.relatedHabit?.[0],
      );
      return habit ? `Дані зі звички «${habit.title}»` : "Пов’язана звичка";
    }
    if (aim.aimType === "list") return "Прогрес за етапами списку справ";
    return "Поточне значення цілі";
  };

  const getAimValueText = (aim: IAimData, progress: IAimProgressSnapshot) => {
    if (aim.aimType === "boolean") {
      return progress.progress >= 100 ? "Виконано" : "Ще не виконано";
    }
    if (aim.aimType === "list") {
      return `${Math.round(progress.progress)}% виконано`;
    }

    const unit = getAimUnit(aim);
    const suffix = unit ? ` ${unit}` : "";
    return `${formatNumber(progress.currentValue)}${suffix} → ${formatNumber(
      aim.finalAim,
    )}${suffix}`;
  };

  const isLoading =
    allAims.isLoading ||
    taskGroups.isLoading ||
    aimCategories.isLoading ||
    habits.isLoading ||
    isHistoryLoading;
  const isError =
    allAims.isError ||
    taskGroups.isError ||
    aimCategories.isError ||
    habits.isError;

  const retryLoading = () => {
    allAims.refetch();
    taskGroups.refetch();
    aimCategories.refetch();
    habits.refetch();
    setHistoryReloadKey((key) => key + 1);
  };

  return (
    <StyledAimCalendar>
      <header className="calendar-header">
        <div>
          <span className="calendar-kicker">Планування в часі</span>
          <h1>Цілі та прогрес</h1>
          <p>
            Бачиш тривалість, фактичний рух і темп відносно дедлайну в одному
            місці.
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate(routes.aims.add)}
        >
          Додати ціль
        </Button>
      </header>

      <section className="calendar-toolbar" aria-label="Фільтри цілей">
        <Segmented
          className="goal-filter"
          value={filter}
          options={[
            { label: `Активні · ${activeAims.length}`, value: "active" },
            { label: "За планом", value: "onTrack" },
            { label: "Потребують уваги", value: "attention" },
          ]}
          onChange={(value) => setFilter(value as RoadmapFilter)}
        />
        <div className="range-field">
          <label>Період</label>
          <DatePicker.RangePicker
            picker="month"
            // @ts-ignore Ant Design використовує сумісний кортеж Dayjs
            value={monthsDates}
            onChange={onChange}
            format="MMM YYYY"
            allowClear={false}
          />
        </div>
        <div className="toolbar-actions">
          <Button
            icon={<ExpandOutlined />}
            onClick={showAllAims}
            disabled={!allAims.data?.length}
          >
            Усі цілі
          </Button>
          <Button icon={<CalendarOutlined />} onClick={showCurrentYear}>
            Поточний рік
          </Button>
        </div>
      </section>

      {(isError || historyError) && (
        <Alert
          className="calendar-alert"
          type={isError ? "error" : "warning"}
          showIcon
          message={
            isError
              ? "Не вдалося завантажити цілі"
              : "Динаміка пов’язаних звичок тимчасово недоступна"
          }
          action={
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={retryLoading}
            >
              Повторити
            </Button>
          }
        />
      )}

      <Spin spinning={isLoading}>
        <section className="roadmap-surface">
          {visibleAims.length ? (
            <div className="roadmap-scroll">
              <div className="roadmap-grid" style={roadmapStyle}>
                <div className="roadmap-header">
                  <span>Ціль</span>
                  <div
                    className="roadmap-months"
                    style={{
                      gridTemplateColumns: `repeat(${months.length}, minmax(138px, 1fr))`,
                    }}
                  >
                    {months.map((month) => (
                      <span key={month.format("YYYY-MM")}>
                        {month.format("MMMM")}
                        {months[0].year() !== months[months.length - 1].year()
                          ? ` ${month.year()}`
                          : ""}
                      </span>
                    ))}
                  </div>
                </div>

                {visibleAims.map((aim) => {
                  const progress = progressByAim.get(aim.id);
                  if (!progress) return null;
                  const position = getAimTimelinePosition(
                    aim,
                    rangeFrom,
                    rangeTo,
                  );
                  const status = statusMeta[progress.status];
                  const progressWidth = clampProgress(progress.progress);
                  const category = getRelationTitle(
                    aim.aimsCategoryId,
                    aimCategories.data || [],
                    "Без категорії",
                  );

                  return (
                    <button
                      key={aim.id}
                      type="button"
                      className={`roadmap-row ${
                        selectedAimId === aim.id ? "is-selected" : ""
                      }`}
                      aria-pressed={selectedAimId === aim.id}
                      onClick={() => setSelectedAimId(aim.id)}
                    >
                      <span className="goal-info">
                        <span className="goal-title">{aim.title}</span>
                        <span className="goal-meta">
                          <span>{category}</span>
                          <span>·</span>
                          <span>{getAimValueText(aim, progress)}</span>
                        </span>
                        <span className={`goal-status ${status.className}`}>
                          {status.label}
                        </span>
                        <span className="mobile-progress-track">
                          <span style={{ width: `${progressWidth}%` }} />
                        </span>
                      </span>

                      <span className="goal-track">
                        {todayPosition !== null && (
                          <>
                            <span
                              className="today-line"
                              style={{ left: `${todayPosition}%` }}
                            />
                            <span
                              className="today-label"
                              style={{ left: `calc(${todayPosition}% + 5px)` }}
                            >
                              сьогодні
                            </span>
                          </>
                        )}
                        {position && (
                          <span
                            className="goal-bar"
                            style={{
                              left: `${position.left}%`,
                              width: `${position.width}%`,
                            }}
                          >
                            <span
                              className="goal-bar-progress"
                              style={{ width: `${progressWidth}%` }}
                            />
                            <span className="goal-bar-label">
                              {Math.round(progress.progress)}% · до{" "}
                              {dayjs(aim.dateTo).format("D MMM")}
                            </span>
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="roadmap-empty">
              <LineChartOutlined />
              <strong>У цьому перегляді цілей немає</strong>
              <span>Зміни період або обери інший фільтр.</span>
            </div>
          )}
        </section>

        {selectedAim && selectedProgress && (
          <section className="goal-detail" aria-live="polite">
            <header className="goal-detail-header">
              <div>
                <span className="detail-kicker">
                  {getAimContext(selectedAim)}
                </span>
                <h2>{selectedAim.title}</h2>
                <p>
                  {statusMeta[selectedProgress.status].label} · очікуваний
                  прогрес на сьогодні{" "}
                  {Math.round(selectedProgress.expectedProgress)}%
                </p>
              </div>
              <div className="detail-actions">
                <strong>{Math.round(selectedProgress.progress)}%</strong>
                <Button
                  icon={<EditOutlined />}
                  onClick={() =>
                    navigate(`${routes.aims.edit}/${selectedAim.id}`)
                  }
                >
                  Редагувати
                </Button>
              </div>
            </header>

            <div className="goal-detail-grid">
              <div className="trend-panel">
                {selectedProgress.trend.length ? (
                  <AimTrendChart
                    points={selectedProgress.trend}
                    targetValue={selectedAim.finalAim}
                    title={selectedAim.title}
                    unit={getAimUnit(selectedAim)}
                  />
                ) : (
                  <div className="trend-empty">
                    <LineChartOutlined />
                    <strong>Історія змін поки недоступна</strong>
                    <span>
                      {selectedAim.aimType === "list"
                        ? "Прогрес цієї цілі визначається поточним станом етапів і справ."
                        : "Для ручної цілі показується поточне значення без вигаданого тренду."}
                    </span>
                  </div>
                )}
              </div>

              <div className="goal-milestones">
                <div className="milestone is-done">
                  <span />
                  <div>
                    <small>Старт</small>
                    <strong>
                      {dayjs(selectedAim.dateFrom).format("D MMM YYYY")}
                    </strong>
                  </div>
                </div>
                <div className="milestone is-done">
                  <span />
                  <div>
                    <small>Поточний стан</small>
                    <strong>
                      {getAimValueText(selectedAim, selectedProgress)}
                    </strong>
                  </div>
                </div>
                <div className="milestone">
                  <span />
                  <div>
                    <small>Прогрес за часом</small>
                    <strong>
                      {Math.round(selectedProgress.progress)}% фактично ·{" "}
                      {Math.round(selectedProgress.expectedProgress)}% за планом
                    </strong>
                  </div>
                </div>
                <div className="milestone">
                  <span />
                  <div>
                    <small>Дедлайн</small>
                    <strong>
                      {dayjs(selectedAim.dateTo).format("D MMM YYYY")}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </Spin>
    </StyledAimCalendar>
  );
};

export default AimCalendar;
