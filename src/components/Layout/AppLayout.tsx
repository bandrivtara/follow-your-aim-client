import { useMemo, useState, ReactElement } from "react";
import { Drawer, Layout, Menu } from "antd";
import {
  BottomNavigation,
  BottomNavigationAction,
  IconButton,
} from "@mui/material";
import {
  AssessmentOutlined,
  CalendarMonthOutlined,
  DashboardOutlined,
  EditNoteOutlined,
  MenuOutlined,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import useMenuItems from "./useMenuItems";
import useIsMobile from "../../share/hooks/useIsMobile";
import StyledLayout from "./AppLayout.styled";
import routes from "config/routes";

const { Content, Footer, Sider } = Layout;

interface IProps {
  children: ReactElement;
}

const AppLayout = ({ children }: IProps) => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(isMobile);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuItems = useMenuItems();
  const navigate = useNavigate();
  const location = useLocation();
  const mobileNavigationValue = useMemo(() => {
    if (location.pathname === routes.review.daily) return routes.review.daily;
    if (location.pathname === routes.review.weekly) return routes.review.weekly;
    if (location.pathname.startsWith(routes.calendar.tracker)) {
      return routes.calendar.tracker;
    }
    if (location.pathname === routes.main) return routes.main;
    return "more";
  }, [location.pathname]);
  const mobileTitle = useMemo(() => {
    if (location.pathname === routes.review.daily) return "Щоденний огляд";
    if (location.pathname === routes.review.weekly) return "Підсумок тижня";
    if (location.pathname === routes.review.codex) return "Codex-помічник";
    if (location.pathname.startsWith(routes.calendar.tracker)) return "Трекер";
    if (location.pathname === routes.main) return "Мій день";
    return "Розділи";
  }, [location.pathname]);

  const handleMobileNavigation = (_event: unknown, value: string) => {
    if (value === "more") {
      setIsMobileMenuOpen(true);
      return;
    }

    navigate(
      value === routes.calendar.tracker
        ? `${routes.calendar.tracker}?view=day`
        : value,
    );
  };

  return (
    <StyledLayout>
      {isMobile ? (
        <Layout className="mobile-layout">
          <header className="mobile-app-header">
            <div>
              <span className="mobile-app-kicker">Follow Your Aim</span>
              <strong>{mobileTitle}</strong>
            </div>
            <IconButton
              aria-label="Відкрити повне меню"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <MenuOutlined />
            </IconButton>
          </header>
          <Content className="mobile-content">{children}</Content>
          <BottomNavigation
            className="mobile-bottom-navigation"
            showLabels
            value={mobileNavigationValue}
            onChange={handleMobileNavigation}
          >
            <BottomNavigationAction
              label="Сьогодні"
              value={routes.main}
              icon={<DashboardOutlined />}
            />
            <BottomNavigationAction
              label="Трекер"
              value={routes.calendar.tracker}
              icon={<CalendarMonthOutlined />}
            />
            <BottomNavigationAction
              label="Огляд"
              value={routes.review.daily}
              icon={<EditNoteOutlined />}
            />
            <BottomNavigationAction
              label="Тиждень"
              value={routes.review.weekly}
              icon={<AssessmentOutlined />}
            />
            <BottomNavigationAction
              label="Ще"
              value="more"
              icon={<MenuOutlined />}
            />
          </BottomNavigation>
          <Drawer
            title="Усі розділи"
            placement="right"
            width="min(88vw, 360px)"
            open={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            <Menu
              mode="inline"
              items={menuItems}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </Drawer>
        </Layout>
      ) : (
        <Layout style={{ minHeight: "100vh" }}>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
          >
            <Menu
              theme="dark"
              defaultSelectedKeys={["1"]}
              mode="inline"
              items={menuItems}
            />
          </Sider>
          <Layout className="site-layout">
            <Content style={{ margin: "0 16px" }}>{children}</Content>
            <Footer style={{ textAlign: "center" }}>
              Follow Your Aim ©2023 Created by TB.JS.DEV
            </Footer>
          </Layout>
        </Layout>
      )}
    </StyledLayout>
  );
};

export default AppLayout;
