import { useEffect } from "react";
import AppRoutes from "./components/Routes";
import dayjs from "dayjs";
import uk from "dayjs/locale/uk";

const App = () => {
  useEffect(() => {
    dayjs.locale({
      ...uk,
    });
  }, []);

  return <AppRoutes />;
};

export default App;
