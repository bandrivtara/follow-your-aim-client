import { useEffect, useState } from "react";
import { Tag } from "antd";
import { ICellRendererParams } from "ag-grid-community";
import { IAim } from "types/aims.types";
import { useGetAimsListQuery } from "store/services/aims";

const RelatedAims = ({ value }: ICellRendererParams) => {
  const aimData = useGetAimsListQuery();
  const [relatedAims, setRelatedAims] = useState<IAim[]>([]);

  useEffect(() => {
    if (!aimData || !aimData.data || !value) return;
    const currentRelativeHabits = aimData.data.filter((habit) =>
      value.includes(habit.id)
    );

    setRelatedAims(currentRelativeHabits);
  }, [aimData, value]);

  return relatedAims.map((aim) => (
    <Tag key={aim.id} color="processing">
      {aim.title}
    </Tag>
  ));
};

export default RelatedAims;
