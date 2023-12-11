import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import routes from "../config/routes";
import AppLayout from "./Layout/AppLayout";
import Main from "./Main/Main";
import Calendar from "./Calendar/Calendar";
import Activity from "./Activities/Activity";
import AddEditActivity from "./Activities/AddEditActivity/AddEditActivity";
import AimCalendar from "./Aims/Calendar/AimCalendar";
import SpheresList from "./LifeSpheres/SpheresList";
import AddEditSphere from "./LifeSpheres/AddEditSpheres/AddEditSpheres";
import AddEditAim from "./Aims/AddEditAim/AddEditAim";
import AimsList from "./Aims/List/AimsList";

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

          <Route path={routes.aims.calendar} element={<AimCalendar />} />
          <Route path={routes.aims.list} element={<AimsList />} />
          <Route path={routes.aims.add} element={<AddEditAim />} />
          <Route path={`${routes.aims.edit}/:aimId`} element={<AddEditAim />} />

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
