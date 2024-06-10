import { Layout, Menu } from "antd";
import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const { Header, Content } = Layout;

const navList = [
  {
    label: <Link to={"/"}>画板</Link>,
    key: "/",
  },
  {
    label: <Link to={"/name"}>姓名生成器</Link>,
    key: "/name",
  },
];

const App: React.FC = () => {
  const location = useLocation();
  const [activePath, setActivePath] = useState("/");
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);
  return (
    <Layout style={{ minHeight: "100vh", width: "100vw" }}>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={[activePath]}
          items={navList}
          style={{ flex: 1, minWidth: 0 }}
        ></Menu>
      </Header>
      <Content style={{ padding: "0 48px" }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default App;
