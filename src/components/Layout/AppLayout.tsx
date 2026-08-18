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
  TrackChangesRounded,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import useMenuItems from "./useMenuItems";
import useIsMobile from "../../share/hooks/useIsMobile";
import StyledLayout from "./AppLayout.styled";
import routes from "config/routes";
import NetworkStatus from "share/components/NetworkStatus/NetworkStatus";

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
  const selectedMenuKeys = useMemo(() => {
    const path = location.pathname;
    if (path === routes.main) return ["1"];
    if (path.startsWith(routes.calendar.tracker)) return ["22"];
    if (path.startsWith(routes.calendar.aims)) return ["23"];
    if (path.startsWith(routes.taskGroups.add)) return ["32"];
    if (path.startsWith(routes.taskGroups.path)) return ["31"];
    if (path.startsWith(routes.habit.categories.path)) return ["42"];
    if (path.startsWith(routes.habit.path)) return ["41"];
    if (path.startsWith(routes.aims.categories.path)) return ["52"];
    if (path.startsWith(routes.aims.path)) return ["51"];
    if (path === routes.review.daily) return ["61"];
    if (path === routes.review.weekly) return ["62"];
    if (path === routes.review.codex) return ["63"];
    if (path.startsWith(routes.english.vocabulary.group.path)) return ["71"];
    if (path.startsWith(routes.english.vocabulary.word.path)) return ["72"];
    if (path.startsWith(routes.english.tests.words)) return ["73"];
    return [];
  }, [location.pathname]);
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
    if (location.pathname.startsWith(routes.calendar.aims))
      return "Календар цілей";
    if (location.pathname.startsWith(routes.habit.path)) return "Звички";
    if (location.pathname.startsWith(routes.taskGroups.path)) return "Завдання";
    if (location.pathname.startsWith(routes.aims.path)) return "Цілі";
    if (location.pathname.startsWith("/english")) return "Англійська";
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
      <NetworkStatus />
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
            className="mobile-menu-drawer"
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
            className="desktop-sidebar"
            width={232}
            collapsedWidth={76}
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
          >
            <button
              type="button"
              className="desktop-brand"
              aria-label="Перейти на головну"
              onClick={() => navigate(routes.main)}
            >
              <span className="desktop-brand-mark">
                <TrackChangesRounded />
              </span>
              {!collapsed && (
                <span className="desktop-brand-copy">
                  <strong>Follow Your Aim</strong>
                  <small>Personal workspace</small>
                </span>
              )}
            </button>
            <Menu
              theme="dark"
              selectedKeys={selectedMenuKeys}
              mode="inline"
              items={menuItems}
            />
          </Sider>
          <Layout className="site-layout">
            <Content className="desktop-content">{children}</Content>
            <Footer className="app-footer">
              Follow Your Aim · твоя особиста система прогресу
            </Footer>
          </Layout>
        </Layout>
      )}
    </StyledLayout>
  );
};

export default AppLayout;
