import { createTheme } from "@mui/material/styles";
import { ThemeConfig } from "antd";

export const UI_COLORS = {
  primary: "#5b6cf9",
  primaryDark: "#4051d6",
  secondary: "#14b8a6",
  success: "#18a874",
  warning: "#f59e0b",
  error: "#e5484d",
  ink: "#172033",
  muted: "#667085",
  canvas: "#f5f7fb",
  surface: "#ffffff",
  border: "#e4e8f0",
  sidebar: "#101828",
} as const;

export const antTheme: ThemeConfig = {
  token: {
    colorPrimary: UI_COLORS.primary,
    colorInfo: UI_COLORS.primary,
    colorSuccess: UI_COLORS.success,
    colorWarning: UI_COLORS.warning,
    colorError: UI_COLORS.error,
    colorText: UI_COLORS.ink,
    colorTextSecondary: UI_COLORS.muted,
    colorBgLayout: UI_COLORS.canvas,
    colorBgContainer: UI_COLORS.surface,
    colorBorder: UI_COLORS.border,
    borderRadius: 12,
    borderRadiusLG: 18,
    controlHeight: 40,
    fontSize: 14,
    fontFamily:
      'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxShadowSecondary: "0 16px 40px rgba(16, 24, 40, 0.1)",
  },
  components: {
    Button: {
      borderRadius: 10,
      controlHeight: 40,
      fontWeight: 600,
      primaryShadow: "0 8px 18px rgba(91, 108, 249, 0.24)",
    },
    Card: {
      borderRadiusLG: 18,
    },
    Drawer: {
      colorBgElevated: UI_COLORS.surface,
    },
    Input: {
      activeShadow: "0 0 0 3px rgba(91, 108, 249, 0.12)",
    },
    Menu: {
      darkItemBg: UI_COLORS.sidebar,
      darkSubMenuItemBg: "#0c1424",
      darkItemColor: "#c8d1e0",
      darkItemHoverBg: "rgba(255, 255, 255, 0.07)",
      darkItemSelectedBg: UI_COLORS.primary,
      darkItemSelectedColor: "#ffffff",
      itemBorderRadius: 10,
      itemHeight: 42,
      itemMarginInline: 10,
    },
    Segmented: {
      itemSelectedBg: UI_COLORS.surface,
    },
    Table: {
      headerBg: "#f8f9fc",
      headerColor: "#475467",
      rowHoverBg: "#f6f7ff",
    },
  },
};

export const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: UI_COLORS.primary, dark: UI_COLORS.primaryDark },
    secondary: { main: UI_COLORS.secondary },
    success: { main: UI_COLORS.success },
    warning: { main: UI_COLORS.warning },
    error: { main: UI_COLORS.error },
    background: { default: UI_COLORS.canvas, paper: UI_COLORS.surface },
    text: { primary: UI_COLORS.ink, secondary: UI_COLORS.muted },
    divider: UI_COLORS.border,
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h3: { fontWeight: 750, letterSpacing: "-0.035em" },
    h4: { fontWeight: 750, letterSpacing: "-0.025em" },
    h5: { fontWeight: 700, letterSpacing: "-0.015em" },
    button: { fontWeight: 650, textTransform: "none" },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 40, borderRadius: 10, paddingInline: 16 },
        containedPrimary: { boxShadow: "0 8px 18px rgba(91, 108, 249, 0.24)" },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${UI_COLORS.border}`,
          boxShadow: "0 12px 32px rgba(16, 24, 40, 0.07)",
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 650, borderRadius: 9 } },
    },
    MuiDrawer: {
      styleOverrides: { paper: { backgroundImage: "none" } },
    },
  },
});
