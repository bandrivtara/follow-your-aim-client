import { ICellRendererParams } from "ag-grid-community";
import { useEffect, useState } from "react";
import { useGetAimsCategoriesListQuery } from "store/services/aimsCategories";
import { IAim } from "types/aims.types";

const AimCategoryCellRenderer = ({ data }: ICellRendererParams<IAim>) => {
  const [habitCategory, setHabitCategory] = useState("");
  const aimsCategories = useGetAimsCategoriesListQuery();

  useEffect(() => {
    if (!aimsCategories.data || !data) return;
    const category = aimsCategories.data.find(
      (category) => category.id === data.aimsCategoryId
    );
    category && setHabitCategory(category?.title || "");
  }, [data, aimsCategories]);

  return <>{habitCategory}</>;
};

export default AimCategoryCellRenderer;
