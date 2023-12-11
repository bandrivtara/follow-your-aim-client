import { useEffect, useState } from "react";
import { Tag } from "antd";
import { useGetActivityListQuery } from "../../../store/services/activity";
import { ICellRendererParams } from "ag-grid-community";
import { IActivityData } from "../../../types/activity.types";

const RelatedActivities = ({ value }: ICellRendererParams) => {
  const activityData = useGetActivityListQuery();
  const [relatedActivities, setRelatedActivities] = useState<IActivityData[]>(
    []
  );

  useEffect(() => {
    if (!activityData || !activityData.data || !value) return;
    const currentRelativeActivities = activityData.data.filter((activity) =>
      value.includes(activity.id)
    );

    setRelatedActivities(currentRelativeActivities);
  }, [activityData, value]);

  return relatedActivities.map((activity) => (
    <Tag key={activity.id} color="processing">
      {activity.details.title}
    </Tag>
  ));
};

export default RelatedActivities;
