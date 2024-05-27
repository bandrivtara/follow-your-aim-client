import { useEffect, useState } from "react";
import { Tag } from "antd";
import { useGetAimsListQuery } from "store/services/aims";
import { ICellRendererParams } from "ag-grid-community";
import { IAimData } from "types/aims.types";
import { IAimsCategory } from "types/aimsCategories.types";

const RelatedAims = ({ value, data }: ICellRendererParams<IAimsCategory>) => {
  const aimData = useGetAimsListQuery();
  const [relatedAims, setRelatedAims] = useState<IAimData[]>([]);

  useEffect(() => {
    if (!aimData?.data) return;
    const currentRelativeAims = aimData.data.filter(
      (aim) => aim.sphereId === data?.id
    );
    setRelatedAims(currentRelativeAims);
  }, [aimData, value, data]);

  return relatedAims.map((aim) => (
    <Tag key={aim.id} color="processing">
      {aim.title}
    </Tag>
  ));
};

export default RelatedAims;
