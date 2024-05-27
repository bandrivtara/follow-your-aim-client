import { CellClickedEvent } from "ag-grid-community";
import { IHabitData } from "types/habits.types";
import { cellConfigs } from "../cellConfigs";
import { ReactNode, useEffect, useState } from "react";
import { Box, CardContent, Grid, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface IDayCellEditor {
  id: string;
  details: IHabitData;
  currentDate: {
    year: number;
    month: number;
  };
  store: any[];
  calendarMode: any;
  [day: number]: any;
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
      console.log(editableCell, 123123);
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

  return (
    <div tabIndex={1}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="div">
            {editableCell?.data.details.title}
          </Typography>
          <IconButton onClick={stopEditing} aria-label="close" size="large">
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
        {editableCell?.data && currentCellEditorData}
      </CardContent>
    </div>
  );
};

export default DayCellEditor;
