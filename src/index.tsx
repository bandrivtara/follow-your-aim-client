import { handleError } from "share/functions/handleError";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "./globalStyles.css";
import { ConfigProvider } from "antd";
import locale from "antd/locale/uk_UA";
import dayjs from "dayjs";
import "dayjs/locale/uk";

dayjs.locale("uk");
handleError();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <Provider store={store}>
    <ConfigProvider locale={locale}>
      <App />
    </ConfigProvider>
  </Provider>,
);
