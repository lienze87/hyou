import React, { lazy } from "react";
import { BrowserRouterProps } from "react-router-dom";

export interface IRouter {
  path: string;
  redirect?: string;
  Component?: React.FC<BrowserRouterProps> | (() => any);
  /**
   * 当前路由是否全屏显示
   */
  isFullPage?: boolean;
  /**
   * meta未赋值 路由不显示到菜单中
   */
  meta?: {
    title?: string;
    Icon?: React.FC;
    /**
     * 侧边栏隐藏该路由
     */
    hidden?: boolean;
    /**
     * 单层路由
     */
    single?: boolean;
  };
  children?: IRouter[];
}

const routes: IRouter[] = [
  {
    path: "/",
    redirect: "/board",
  },
  {
    path: "/board",
    Component: lazy(() => import("@/pages/board")),
    meta: {
      title: "画板",
    },
  },
  {
    path: "/user",
    Component: lazy(() => import("@/pages/user")),
    meta: {
      title: "用户",
    },
  },
  {
    path: "*",
    Component: lazy(() => import("@/pages/404")),
    meta: {
      title: "404",
      hidden: true,
    },
  },
];

export default routes;
