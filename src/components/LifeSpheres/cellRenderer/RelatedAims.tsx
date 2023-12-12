import { useEffect, useState } from "react";
import { Tag } from "antd";
import { ICellRendererParams } from "ag-grid-community";
import { IAim } from "../../../types/aim.types";
import { useGetAimsListQuery } from "../../../store/services/aims";

const RelatedAims = ({ value }: ICellRendererParams) => {
  const aimData = useGetAimsListQuery();
  const [relatedAims, setRelatedAims] = useState<IAim[]>([]);

  useEffect(() => {
    if (!aimData || !aimData.data || !value) return;
    const currentRelativeActivities = aimData.data.filter((activity) =>
      value.includes(activity.id)
    );

    setRelatedAims(currentRelativeActivities);
  }, [aimData, value]);

  return relatedAims.map((aim) => (
    <Tag key={aim.id} color="processing">
      {aim.title}
    </Tag>
  ));
};

export default RelatedAims;
