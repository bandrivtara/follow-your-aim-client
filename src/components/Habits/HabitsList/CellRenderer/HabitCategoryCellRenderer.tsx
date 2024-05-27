import { ICellRendererParams } from "ag-grid-community";
import { useEffect, useState } from "react";
import { IAim } from "types/aims.types";
import { IHabitData } from "types/habits.types";
import { IHabitsCategory } from "types/habitsCategories.types";

interface IHabitCategoryCellRenderer extends ICellRendererParams<IHabitData> {
  habitsCategories: IHabitsCategory[];
}

const HabitCategoryCellRenderer = ({
  data,
  habitsCategories,
}: IHabitCategoryCellRenderer) => {
  const [habitCategory, setHabitCategory] = useState("");

  useEffect(() => {
    if (!data) return;
    const category = habitsCategories.find(
      (category) => category.id === data.habitsCategoryId
    );
    category && setHabitCategory(category?.title || "");
  }, [data, habitsCategories]);

  return <>{habitCategory}</>;
};

export default HabitCategoryCellRenderer;
