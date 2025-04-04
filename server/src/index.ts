import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { dirname } from "path";
import { fileURLToPath } from "url";

import sequelize from "./config/database";
import chat from "./router/chat";
import common from "./router/common";
import user from "./router/user";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const app = new Hono();

// 基础路由
app.get("/", (c) => c.text("Hello Hono!"));

// 数据库连接测试
app.get("/health", async (c) => {
  try {
    await sequelize.authenticate();
    return c.json({ status: "ok", message: "数据库连接正常" });
  } catch (error) {
    return c.json({ status: "error", message: `数据库连接失败:${error}` }, 500);
  }
});

// 注册路由
app.route("/chat", chat);
app.route("/user", user);
app.route("/", common);

// 启动服务器
const port = 3008;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port: port,
});
