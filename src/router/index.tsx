import { createBrowserRouter, RouteObject } from "react-router-dom";

import App from "@/layouts/index";
import Board from "@/pages/board";
import Name from "@/pages/name";
import Tween from "@/pages/tween";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Board />,
      },
      {
        path: "name",
        element: <Name />,
      },
    ],
  },
  {
    path: "animation",
    element: <Tween />,
  },
];

const router = createBrowserRouter(routes);

export default router;
