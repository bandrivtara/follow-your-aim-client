import { useEffect, useState } from "react";
import { useGetHabitListQuery } from "store/services/habits";
import { IHabitDetails } from "types/habits.types";
import configs from "./tableConfigs";
import { Table } from "antd";

interface HabitListItem extends IHabitDetails {
  key: React.Key;
}

const Habit = () => {
  const { data } = useGetHabitListQuery();
  const [dataSource, setDataSource] = useState<HabitListItem[]>([]);

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

export default Habit;
