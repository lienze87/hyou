import "./index.css";

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./layouts/index";

const env = import.meta.env.MODE || "development";
const baseRouterName = env === "development" ? "/" : "/hyou";

const root = document.getElementById("root")!;

const renderApp = () => {
  console.log(baseRouterName);
  ReactDOM.createRoot(root).render(
    <BrowserRouter basename={baseRouterName}>
      <App />
    </BrowserRouter>,
  );
};

renderApp();
