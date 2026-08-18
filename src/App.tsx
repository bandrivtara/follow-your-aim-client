import AppRoutes from "./components/Routes";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { muiTheme } from "config/uiTheme";

const App = () => {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
        <AppRoutes />
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
