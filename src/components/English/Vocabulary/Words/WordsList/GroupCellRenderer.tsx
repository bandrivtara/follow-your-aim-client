import { ICellRendererParams } from "ag-grid-community";
import { useEffect, useState } from "react";
import { useGetGroupsListQuery } from "store/services/english";
import { IWord } from "types/english.types";

const GroupCellRenderer = ({ data }: ICellRendererParams<IWord>) => {
  const [groupTitle, setGroupTitle] = useState("");
  const groups = useGetGroupsListQuery();

  useEffect(() => {
    if (!groups.data || !data) return;

    for (const [groupId, groupData] of Object.entries(groups.data)) {
      if (data.group === groupId) {
        setGroupTitle(groupData?.title || "");
      }
    }
  }, [data, groups]);

  return <>{groupTitle}</>;
};

export default GroupCellRenderer;
