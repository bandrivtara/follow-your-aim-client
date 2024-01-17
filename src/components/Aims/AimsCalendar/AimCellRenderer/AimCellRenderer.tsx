import { useCallback, useEffect, useState } from "react";
import { ICellRendererParams } from "ag-grid-community";
import StyledAimCellRenderer from "./AimCellRenderer.styled";
import dayjs from "dayjs";
import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "store/api";

interface IProgressBarStyles {
  width: number;
  marginLeft: number;
}

const AimCellRenderer = ({ value, data, colDef }: ICellRendererParams) => {
  const [progressBarStyles, setProgressBarStyles] =
    useState<IProgressBarStyles | null>(null);
  const [progressData, setProgressData] = useState({
    totalValue: 0,
    progress: 0,
  });
  const [currentText, setCurrentText] = useState(value);

  const generateMonthYearArray = (dateFrom: string, dateTo: string) => {
    const result = [];
    let currentDate = dayjs(dateFrom, { format: "YYYY/MM/DD" });

    while (
      currentDate.isBefore(dayjs(dateTo, { format: "YYYY/MM/DD" })) ||
      currentDate.isSame(dayjs(dateTo, { format: "YYYY/MM/DD" }))
    ) {
      result.push(currentDate.format("MM-YYYY"));
      currentDate = currentDate.add(1, "month");
    }

    return result;
  };

  const getTotalForRelatedHobby = useCallback(async () => {
    let totalValue = 0;

    const historyCollection = collection(db, "history");
    const dates = generateMonthYearArray(data.dateFrom, data.dateTo);
    const q = query(historyCollection, where(documentId(), "in", dates));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (monthHistoryDoc) => {
      for (const [day, habit] of Object.entries(monthHistoryDoc.data())) {
        if (monthHistoryDoc.id === dayjs(data.dateFrom).format("MM-YYYY")) {
          if (+day >= +dayjs(data.dateFrom).format("D")) {
            totalValue +=
              habit?.[data.relatedHabit[0]]?.values?.[data.relatedHabit[1]] ||
              0;
          }
        } else if (
          monthHistoryDoc.id === dayjs(data.dateTo).format("MM-YYYY")
        ) {
          if (+day <= +dayjs(data.dateFrom).format("D")) {
            totalValue +=
              habit[data.relatedHabit[0]]?.values[data.relatedHabit[1]] || 0;
          }
        } else {
          totalValue +=
            habit[data.relatedHabit[0]]?.values[data.relatedHabit[1]] || 0;
        }
      }
    });

    return +totalValue.toFixed(2);
  }, [data.dateFrom, data.dateTo, data.relatedHabit]);

  const getProgressDataForRelatedTaskGroup = useCallback(async () => {
    const stagesProgress = [];

    for (const [_, list] of Object.entries(data.relatedList)) {
      const taskGroupRef = doc(db, "taskGroup", list[0]);
      const taskGroupSnapshot = await getDoc(taskGroupRef);
      if (taskGroupSnapshot.exists()) {
        const taskGroup = taskGroupSnapshot.data();

        if (list[1]) {
          const taskStage = taskGroup.tasksStages.find(
            (taskStage) => taskStage.id === list[1]
          );
          const doneSubTasks = taskStage.subTasks.filter(
            (subTask) => subTask.status === "done"
          );
          stagesProgress.push({
            donePercentage: doneSubTasks.length / taskStage.subTasks.length,
            stageMaxPercentage: taskStage.stagePercentage,
          });
        } else {
          taskGroup.tasksStages.forEach((taskStage) => {
            const doneSubTasks = taskStage.subTasks.filter(
              (subTask) => subTask.status === "done"
            );
            stagesProgress.push({
              donePercentage: doneSubTasks.length / taskStage.subTasks.length,
              stageMaxPercentage: taskStage.stagePercentage,
            });
          });
        }
      }
    }

    const totalStageMaxPercentage = stagesProgress.reduce(
      (sum, stage) => sum + stage.stageMaxPercentage,
      0
    );

    const resultSum = stagesProgress.reduce((sum, stage) => {
      const individualResult =
        (stage.stageMaxPercentage / totalStageMaxPercentage) *
        stage.donePercentage;
      return sum + individualResult;
    }, 0);

    return {
      totalValue: 100,
      progress: resultSum * 100,
    };
  }, [data.relatedList]);

  const getRelatedHobbyLastValue = useCallback(async () => {
    let lastValue: number | null = null;
    const historyCollection = collection(db, "history");
    const dates = generateMonthYearArray(data.dateFrom, data.dateTo);
    const q = query(historyCollection, where(documentId(), "in", dates));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (monthHistoryDoc) => {
      for (const [day, habit] of Object.entries(
        monthHistoryDoc.data()
      ).reverse()) {
        if (!lastValue) {
          console.log(
            day,
            habit,
            monthHistoryDoc.id,
            habit?.[data.relatedHabit[0]]?.values?.[data.relatedHabit[1]]
          );
          if (monthHistoryDoc.id === dayjs(data.dateFrom).format("MM-YYYY")) {
            if (+day >= +dayjs(data.dateFrom).format("D")) {
              lastValue =
                habit?.[data.relatedHabit[0]]?.values?.[data.relatedHabit[1]];
            }
          } else if (
            monthHistoryDoc.id === dayjs(data.dateTo).format("MM-YYYY")
          ) {
            if (+day <= +dayjs(data.dateFrom).format("D")) {
              lastValue =
                habit?.[data.relatedHabit[0]]?.values?.[data.relatedHabit[1]];
            }
          } else {
            lastValue =
              habit?.[data.relatedHabit[0]]?.values?.[data.relatedHabit[1]];
          }
        }
      }
    });

    return lastValue || 0;
  }, [data.dateFrom, data.dateTo, data.relatedHabit]);

  useEffect(() => {
    const getAimProgress = async () => {
      if (progressBarStyles || !colDef?.width) return;
      const differenceInDays = dayjs(data.dateFrom).diff(
        dayjs(data.dateTo),
        "day"
      );
      const maxDifferenceDays = dayjs(
        dayjs(data.dateFrom).format("YYYY/MM")
      ).diff(dayjs(data.dateTo).add(1, "month").format("YYYY/MM"), "day");

      setProgressBarStyles({
        width: (+differenceInDays / maxDifferenceDays) * 100,
        marginLeft:
          (+dayjs(data.dateFrom).format("D") / 30) * colDef?.width - 5,
      });

      if (data.isRelatedWithHabit) {
        if (data.calculationType === "sum") {
          const totalValue = await getTotalForRelatedHobby();
          setProgressData({
            totalValue,
            progress: (totalValue / data.finalAim) * 100,
          });
        } else if (data.calculationType === "lastMeasureAsc") {
          const lastValue = await getRelatedHobbyLastValue();
          setProgressData({
            totalValue: lastValue,
            progress: (lastValue / data.finalAim) * 100,
          });
        } else if (data.calculationType === "lastMeasureDesc") {
          const lastValue = await getRelatedHobbyLastValue();
          setProgressData({
            totalValue: lastValue,
            progress: (data.finalAim / lastValue) * 100,
          });
        }
      } else if (data.relatedList) {
        const relatedTaskGroupProgressData =
          await getProgressDataForRelatedTaskGroup();
        setProgressData(relatedTaskGroupProgressData);
      } else {
        setProgressData({
          totalValue: data?.currentValue || 0,
          progress: ((data.currentValue || 0) / data.finalAim) * 100,
        });
      }
    };

    getAimProgress();
  }, [
    colDef?.width,
    data,
    getProgressDataForRelatedTaskGroup,
    getRelatedHobbyLastValue,
    getTotalForRelatedHobby,
    progressBarStyles,
  ]);

  const handleTextOnMouseEnter = () => {
    if (data.relatedList) {
      setCurrentText(
        `${progressData.progress.toFixed(2)}/${progressData.totalValue}%`
      );
    } else {
      setCurrentText(
        `${progressData.totalValue}/${
          data.finalAim
        } (${progressData.progress.toFixed(2)}%)`
      );
    }
  };
  const handleTextOnMouseLeave = () => {
    setCurrentText(value);
  };

  return (
    <StyledAimCellRenderer
      progressBarStyles={progressBarStyles}
      progressData={progressData}
    >
      <div
        className={value ? "aim-progress-bar" : ""}
        onMouseEnter={handleTextOnMouseEnter}
        onMouseLeave={handleTextOnMouseLeave}
      >
        <span className="progress-value" />
        <p>{currentText}</p>
      </div>
    </StyledAimCellRenderer>
  );
};

export default AimCellRenderer;
