import { Routes, Route, HashRouter, Navigate } from "react-router-dom";
import routes from "../config/routes";
import AppLayout from "./Layout/AppLayout";
import Main from "./Main/Main";
import AddEditAim from "./Aims/AddEditAim/AddEditAim";
import AddEditHabit from "./Habits/AddEditHabit/AddEditHabit";
import Habit from "./Habits/HabitsList/HabitsList";
import AimsList from "./Aims/AimsList/AimsList";
import TrackerCalendar from "./Calendar/Tracker/TrackerCalendar";
import AimCalendar from "./Aims/AimsCalendar/AimCalendar";
import HabitsCategoriesList from "./Habits/HabitsCategories/HabitsCategoriesList/HabitsCategoriesList";
import AddEditHabitsCategory from "./Habits/HabitsCategories/AddEditHabitsCategory/AddEditHabitsCategory";
import AddEditAimsCategory from "./Aims/AimsCategories/AddEditAimsCategory/AddEditAimsCategory";
import AimsCategoriesList from "./Aims/AimsCategories/AimsCategoriesList/AimsCategoriesList";
import TasksGroupsList from "./TasksGroups/TasksGroupsList/TasksGroupsList";
import AddEditTasksGroup from "./TasksGroups/AddEditTasksGroup/AddEditTasksGroup";
import TasksOverview from "./TasksGroups/TasksOverview/TasksOverview";
import AddEditGroup from "./English/Vocabulary/Groups/AddEditGroup/AddEditGroup";
import GroupsList from "./English/Vocabulary/Groups/GroupsList/GroupsList";
import AddEditWord from "./English/Vocabulary/Words/AddEditWord/AddEditWord";
import WordsList from "./English/Vocabulary/Words/WordsList/WordsList";
import WordsTest from "./English/Tests/WordsTest";
import DailyReview from "./Review/DailyReview/DailyReview";
import GoalsGratitude from "./Review/GoalsGratitude/GoalsGratitude";
import WeeklyReview from "./Review/WeeklyReview/WeeklyReview";
import CodexGuide from "./Review/CodexGuide/CodexGuide";
import CareerDashboard from "./Career/CareerDashboard";
import NutritionDashboard from "./Nutrition/NutritionDashboard";

const AppRoutes = () => {
  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          <Route path={routes.main} element={<Main />} />

          <Route
            path={routes.calendar.scheduler}
            element={<Navigate to={routes.main} replace />}
          />
          <Route path={routes.calendar.tracker} element={<TrackerCalendar />} />
          <Route path={routes.calendar.aims} element={<AimCalendar />} />
          <Route path={routes.review.daily} element={<DailyReview />} />
          <Route
            path={routes.review.goalsGratitude}
            element={<GoalsGratitude />}
          />
          <Route path={routes.review.weekly} element={<WeeklyReview />} />
          <Route path={routes.review.codex} element={<CodexGuide />} />
          <Route path={routes.career} element={<CareerDashboard />} />
          <Route path={routes.nutrition} element={<NutritionDashboard />} />

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

          <Route path={routes.taskGroups.tasks} element={<TasksOverview />} />
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

          <Route
            path={routes.english.vocabulary.group.add}
            element={<AddEditGroup />}
          />
          <Route
            path={`${routes.english.vocabulary.group.edit}/:groupId`}
            element={<AddEditGroup />}
          />
          <Route
            path={routes.english.vocabulary.group.list}
            element={<GroupsList />}
          />
          <Route
            path={routes.english.vocabulary.word.add}
            element={<AddEditWord />}
          />
          <Route
            path={`${routes.english.vocabulary.word.edit}/:wordId`}
            element={<AddEditWord />}
          />
          <Route
            path={routes.english.vocabulary.word.list}
            element={<WordsList />}
          />
          <Route path={routes.english.tests.words} element={<WordsTest />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  );
};

export default AppRoutes;
