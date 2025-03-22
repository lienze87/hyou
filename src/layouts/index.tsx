import { Layout, Menu, Spin } from "antd";
import React, { memo, Suspense, useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";

import Uploader from "@/components/uploader";
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

  const navList = routers
    .filter((route) => !route.meta?.hidden)
    .map((route) => ({
      label: <Link to={route.path}>{route.meta?.title}</Link>,
      key: route.path,
    }));

  useEffect(() => {
    // 如果是博客详情页，激活博客菜单
    if (location.pathname.startsWith("/blog/")) {
      setActivePath("/blog");
    } else {
      setActivePath(location.pathname);
    }
  }, [location]);

  return (
    <Layout className="w-[100vw] min-h-[100vh]">
      <Header className="flex justify-between items-center">
        <div className="header-left flex items-center">
          <div className="logo-container flex items-center gap-3 flex-1">
            <i className="w-[28px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M2 26V2H26L2 26ZM2 26H26"
                  stroke="#e5e0ce"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </i>
            <h1 className="text-xl font-bold text-[#e5e0ce] m-0">Hyou</h1>
          </div>
          <Menu
            key={activePath}
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={[activePath]}
            items={navList}
            className="w-full"
          ></Menu>
        </div>
        <div className="header-right flex items-center">
          <Uploader />
        </div>
      </Header>
      <Content className="flex justify-center">
        <Suspense
          fallback={
            <div className="self-center w-full h-full flex justify-center items-center">
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
