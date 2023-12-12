import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import routes from "../config/routes";
import AppLayout from "./Layout/AppLayout";
import Main from "./Main/Main";
import AddEditAim from "./Aims/AddEditAim/AddEditAim";
import AddEditHabit from "./Habits/AddEditHabit/AddEditHabit";
import Habit from "./Habits/HabitsList/HabitsList";
import HabitsCalendar from "./Habits/HabitsCalendar/HabitsCalendar";
import AimCalendar from "./Aims/AimsCalendar/AimCalendar";
import AimsList from "./Aims/AimsList/AimsList";
import CategoriesList from "./Categories/CategoriesList/CategoriesList";
import AddEditCategory from "./Categories/AddEditCategory/AddEditCategory";

const AppRoutes = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path={routes.main} element={<Main />} />

          <Route path={routes.calendar} element={<HabitsCalendar />} />
          <Route path={routes.habit.list} element={<Habit />} />
          <Route path={routes.habit.add} element={<AddEditHabit />} />
          <Route
            path={`${routes.habit.edit}/:habitId`}
            element={<AddEditHabit />}
          />

          <Route path={routes.aims.calendar} element={<AimCalendar />} />
          <Route path={routes.aims.list} element={<AimsList />} />
          <Route path={routes.aims.add} element={<AddEditAim />} />
          <Route path={`${routes.aims.edit}/:aimId`} element={<AddEditAim />} />

          <Route
            path={routes.lifeCategories.list}
            element={<CategoriesList />}
          />
          <Route
            path={routes.lifeCategories.add}
            element={<AddEditCategory />}
          />
          <Route
            path={`${routes.lifeCategories.edit}/:sphereId`}
            element={<AddEditCategory />}
          />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default AppRoutes;
