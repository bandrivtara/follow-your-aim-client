import { useEffect, useState } from "react";
import { Tag } from "antd";
import { useGetHabitListQuery } from "store/services/habits";
import { ICellRendererParams } from "ag-grid-community";
import { IHabitData } from "types/habits.types";

const RelatedHabits = ({ value }: ICellRendererParams) => {
  const habitData = useGetHabitListQuery();
  const [relatedHabits, setRelatedHabits] = useState<IHabitData[]>([]);

  useEffect(() => {
    if (!habitData || !habitData.data || !value) return;
    const currentRelativeHabits = habitData.data.filter((habit) =>
      value.includes(habit.id)
    );

    setRelatedHabits(currentRelativeHabits);
  }, [habitData, value]);

  return relatedHabits.map((habit) => (
    <Tag key={habit.id} color="processing">
      {habit.details.title}
    </Tag>
  ));
};

export default RelatedHabits;
