// @ts-nocheck

import { CellClickedEvent } from "ag-grid-community";
import { IHabitData } from "types/habits.types";
import { cellConfigs } from "../cellConfigs";
import { ReactNode, useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StyledDayCellEditor from "./DayCellEditor.styled";

export interface IDayCellEditor {
  id: string;
  details: IHabitData;
  currentDate: {
    year: number;
    month: number;
  };
  store: any[];
  calendarMode: any;
  [day: string]: any;
}

interface IProps {
  editableCell: CellClickedEvent | null;
  stopEditing: () => void;
}

const DayCellEditor = ({ editableCell, stopEditing }: IProps) => {
  const [currentCellEditorData, setCurrentCellEditorData] =
    useState<ReactNode | null>(null);

  useEffect(() => {
    if (editableCell) {
      const { colDef, data } = editableCell;
      const activityType = data?.details?.type;
      const activityValueType = data?.details?.valueType;

      setCurrentCellEditorData(
        data &&
          data?.details.type &&
          cellConfigs[activityType][activityValueType].cellEditor({
            data,
            colDef,
            stopEditing,
          })
      );
    }
  }, [editableCell, stopEditing]);

  const calendarMode = editableCell?.colDef.cellRendererParams?.calendarMode;
  const modeLabel =
    calendarMode === "planning" ? "Планування дня" : "Внесення результату";

  return (
    <StyledDayCellEditor tabIndex={-1}>
      <header className="editor-header">
        <Box minWidth={0}>
          <span className="editor-kicker">{modeLabel}</span>
          <Typography className="editor-title" variant="h5" component="h2">
            {editableCell?.data.details.title}
          </Typography>
          {editableCell?.colDef.headerName && (
            <Typography
              className="editor-subtitle"
              variant="body2"
              color="text.secondary"
            >
              {editableCell.colDef.headerName}
            </Typography>
          )}
        </Box>
        <IconButton onClick={stopEditing} aria-label="Закрити форму" size="small">
          <CloseIcon />
        </IconButton>
      </header>
      <main className="editor-body">
        <Box>
          {editableCell?.data && currentCellEditorData}
        </Box>
      </main>
    </StyledDayCellEditor>
  );
};

export default DayCellEditor;
