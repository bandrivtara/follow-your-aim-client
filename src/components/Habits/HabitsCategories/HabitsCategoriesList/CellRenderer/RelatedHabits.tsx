import { useEffect, useState } from "react";
import { Tag } from "antd";
import { useGetHabitListQuery } from "store/services/habits";
import { ICellRendererParams } from "ag-grid-community";
import { IHabitData } from "types/habits.types";
import { IHabitsCategory } from "types/habitsCategories.types";

const RelatedHabits = ({
  value,
  data,
}: ICellRendererParams<IHabitsCategory>) => {
  const habitData = useGetHabitListQuery();
  const [relatedHabits, setRelatedHabits] = useState<IHabitData[]>([]);

  useEffect(() => {
    if (!habitData || !habitData.data || !value) return;
    const currentRelativeHabits = habitData.data.filter(
      (habit) => habit.habitsCategoryId === data?.id
    );
    setRelatedHabits(currentRelativeHabits);
  }, [habitData, value, data]);

  return relatedHabits.map((habit) => (
    <Tag key={habit.id} color="processing">
      {habit.title}
    </Tag>
  ));
};

export default RelatedHabits;
