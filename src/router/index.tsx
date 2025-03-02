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
    redirect: "/user",
  },
  {
    path: "/user",
    Component: lazy(() => import("@/pages/user")),
    meta: {
      title: "用户",
    },
  },
  {
    path: "/blog",
    Component: lazy(() => import("@/pages/blog")),
    meta: {
      title: "博客",
    },
  },
  {
    path: "/blog/:id",
    Component: lazy(() => import("@/pages/blog/[id]")),
    meta: {
      title: "博客详情",
      hidden: true,
    },
  },
  {
    path: "/board",
    Component: lazy(() => import("@/pages/board")),
    meta: {
      title: "画板",
    },
  },
  {
    path: "/shape",
    Component: lazy(() => import("@/pages/shape")),
    meta: {
      title: "SVG",
    },
  },
];

export default routes;
