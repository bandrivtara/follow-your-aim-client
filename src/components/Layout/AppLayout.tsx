import { useState, ReactElement } from "react";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import useMenuItems from "./useMenuItems";

const { Header, Content, Footer, Sider } = Layout;

interface IProps {
  children: ReactElement;
}

const AppLayout = ({ children }: IProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const menuItems = useMenuItems();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)",
          }}
        />
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout className="site-layout">
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "0 16px" }}>{children}</Content>
        <Footer style={{ textAlign: "center" }}>
          Follow Your Aim ©2023 Created by TB.JS.DEV
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
