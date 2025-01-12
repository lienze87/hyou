import { Layout, Menu, Spin } from "antd";
import React, { memo, Suspense, useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";

import routers, { IRouter } from "@/router";
import { resolve } from "@/utils/path";

const { Header, Content } = Layout;
type RenderRoutes = (routes: IRouter[], parentPath?: string, breadcrumbs?: string[]) => React.ReactNode[];

/**
 * 渲染应用路由
 * @param routes
 * @param parentPath
 * @param breadcrumb
 */
const renderRoutes: RenderRoutes = (routes, parentPath = "", breadcrumb = []) =>
  routes.map((route, index: number) => {
    const { Component, children, redirect, meta } = route;
    const currentPath = resolve(parentPath, route.path);
    let currentBreadcrumb = breadcrumb;

    if (meta?.title) {
      currentBreadcrumb = currentBreadcrumb.concat([meta?.title]);
    }

    if (redirect) {
      // 重定向
      return <Route key={index} path={currentPath} element={<Navigate to={redirect} replace />} />;
    }

    if (Component) {
      // 有路由菜单
      return <Route key={index} path={currentPath} element={<Component />} />;
    }
    // 无路由菜单
    return children ? renderRoutes(children, currentPath, currentBreadcrumb) : null;
  });

const AppRouter = () => {
  const location = useLocation();
  const [activePath, setActivePath] = useState("/");

  const navList = [
    {
      label: <Link to={"/board"}>画板</Link>,
      key: "/board",
    },
    {
      label: <Link to={"/name"}>姓名生成器</Link>,
      key: "/name",
    },
    {
      label: <Link to={"/shape"}>SVG</Link>,
      key: "/shape",
    },
    {
      label: <Link to={"/animation"}>动画</Link>,
      key: "/animation",
    },
  ];

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  return (
    <Layout className="w-[100vw] min-h-[100vh]">
      <Header className="flex items-center">
        <Menu
          key={activePath}
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={[activePath]}
          items={navList}
          className="w-full"
        ></Menu>
      </Header>
      <Content className="container">
        <Suspense
          fallback={
            <div className="w-full h-full">
              <Spin />
            </div>
          }
        >
          <Routes>{renderRoutes(routers)}</Routes>
        </Suspense>
      </Content>
    </Layout>
  );
};

export default memo(AppRouter);
