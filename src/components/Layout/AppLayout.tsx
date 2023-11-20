import { useState, ReactElement } from "react";
import { Layout, Menu, theme } from "antd";
import useMenuItems from "./useMenuItems";
import useIsMobile from "../../share/hooks/useIsMobile";
import StyledLayout from "./AppLayout.styled";

const { Header, Content, Footer, Sider } = Layout;

interface IProps {
  children: ReactElement;
}

const AppLayout = ({ children }: IProps) => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(isMobile);
  const menuItems = useMenuItems();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <StyledLayout>
      {isMobile ? (
        <Layout className="layout">
          <Menu
            theme="dark"
            defaultSelectedKeys={["1"]}
            mode="horizontal"
            items={menuItems}
          />
          <Content style={{ margin: "14px 16px" }}>{children}</Content>
          <Footer style={{ textAlign: "center" }}>
            Follow Your Aim ©2023 Created by TB.JS.DEV
          </Footer>
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
