import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import routes from "../config/routes";
import AppLayout from "./Layout/AppLayout";
import Main from "./Main/Main";
import AddEditAim from "./Aims/AddEditAim/AddEditAim";
import AddEditHabit from "./Habits/AddEditHabit/AddEditHabit";
import Habit from "./Habits/HabitsList/HabitsList";
import AimsList from "./Aims/AimsList/AimsList";
import SpheresList from "./Spheres/SpheresList/SpheresList";
import AddEditSphere from "./Spheres/AddEditSphere/AddEditSphere";
import TrackerCalendar from "./Calendar/Tracker/TrackerCalendar";
import AimCalendar from "./Aims/AimsCalendar/AimCalendar";
import HabitsCategoriesList from "./Habits/HabitsCategories/HabitsCategoriesList/HabitsCategoriesList";
import AddEditHabitsCategory from "./Habits/HabitsCategories/AddEditHabitsCategory/AddEditHabitsCategory";
import AddEditAimsCategory from "./Aims/AimsCategories/AddEditAimsCategory/AddEditAimsCategory";
import AimsCategoriesList from "./Aims/AimsCategories/AimsCategoriesList/AimsCategoriesList";
import Scheduler from "./Scheduler/Scheduler";
import TasksGroupsList from "./TasksGroups/TasksGroupsList/TasksGroupsList";
import AddEditTasksGroup from "./TasksGroups/AddEditTasksGroup/AddEditTasksGroup";

const AppRoutes = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path={routes.main} element={<Main />} />

          <Route path={routes.calendar.scheduler} element={<Scheduler />} />
          <Route path={routes.calendar.tracker} element={<TrackerCalendar />} />
          <Route path={routes.calendar.aims} element={<AimCalendar />} />

          <Route path={routes.habit.list} element={<Habit />} />
          <Route path={routes.habit.add} element={<AddEditHabit />} />
          <Route
            path={`${routes.habit.edit}/:habitId`}
            element={<AddEditHabit />}
          />
          <Route
            path={routes.habit.categories.list}
            element={<HabitsCategoriesList />}
          />
          <Route
            path={routes.habit.categories.add}
            element={<AddEditHabitsCategory />}
          />
          <Route
            path={`${routes.habit.categories.edit}/:habitsCategoryId`}
            element={<AddEditHabitsCategory />}
          />

          <Route path={routes.taskGroups.list} element={<TasksGroupsList />} />
          <Route path={routes.taskGroups.add} element={<AddEditTasksGroup />} />
          <Route
            path={`${routes.taskGroups.edit}/:taskGroupId`}
            element={<AddEditTasksGroup />}
          />

          <Route path={routes.aims.list} element={<AimsList />} />
          <Route path={routes.aims.add} element={<AddEditAim />} />
          <Route path={`${routes.aims.edit}/:aimId`} element={<AddEditAim />} />
          <Route
            path={routes.aims.categories.list}
            element={<AimsCategoriesList />}
          />
          <Route
            path={routes.aims.categories.add}
            element={<AddEditAimsCategory />}
          />
          <Route
            path={`${routes.aims.categories.edit}/:aimsCategoryId`}
            element={<AddEditAimsCategory />}
          />

          <Route path={routes.spheres.list} element={<SpheresList />} />
          <Route path={routes.spheres.add} element={<AddEditSphere />} />
          <Route
            path={`${routes.spheres.edit}/:sphereId`}
            element={<AddEditSphere />}
          />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default AppRoutes;
