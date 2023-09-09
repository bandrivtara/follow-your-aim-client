import { useEffect, useState } from "react";
import { useGetActivityListQuery } from "../../store/services/activity";
import configs from "./tableConfigs";
import { Table } from "antd";
import { IActivityDetails } from "../../types/activity.types";

interface ActivityListItem extends IActivityDetails {
  key: React.Key;
}

const Activity = () => {
  const { data } = useGetActivityListQuery();
  const [dataSource, setDataSource] = useState<ActivityListItem[]>([]);

  useEffect(() => {
    const newData = data?.map((item, index) => ({
      key: index,
      ...item.details,
      id: item.id || "",
    }));

    if (newData) {
      setDataSource(newData);
    }
  }, [data]);

  return (
    <div>
      <Table columns={configs} dataSource={dataSource} />
    </div>
  );
};

export default Activity;
