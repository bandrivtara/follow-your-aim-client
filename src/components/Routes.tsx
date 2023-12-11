import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import routes from "../config/routes";
import AppLayout from "./Layout/AppLayout";
import Main from "./Main/Main";
import Calendar from "./Calendar/Calendar";
import Activity from "./Activities/Activity";
import AddEditActivity from "./Activities/AddEditActivity/AddEditActivity";
import AimCalendar from "./AimCalendar/AimCalendar";
import SpheresList from "./LifeSpheres/SpheresList";
import AddEditSphere from "./LifeSpheres/AddEditSpheres/AddEditSpheres";

const AppRoutes = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path={routes.main} element={<Main />} />

          <Route path={routes.activity.list} element={<Activity />} />
          <Route path={routes.activity.add} element={<AddEditActivity />} />
          <Route
            path={`${routes.activity.edit}/:activityId`}
            element={<AddEditActivity />}
          />

          <Route path={routes.calendar} element={<Calendar />} />

          <Route path={routes.goals.calendar} element={<AimCalendar />} />

          <Route path={routes.lifeSpheres.list} element={<SpheresList />} />
          <Route path={routes.lifeSpheres.add} element={<AddEditSphere />} />
          <Route
            path={`${routes.lifeSpheres.edit}/:sphereId`}
            element={<AddEditSphere />}
          />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default AppRoutes;
