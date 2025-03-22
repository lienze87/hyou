import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { Hono } from "hono";

import { __dirname } from "../index.js";

const app = new Hono();

// 文件上传
app.post("/upload/:uuid", async (c) => {
  try {
    const uuid = c.req.param("uuid");
    const body = await c.req.parseBody();
    const file = body["file"];

    if (!file || !(file instanceof File)) {
      return c.json({
        code: 400,
        message: "请选择要上传的文件",
        data: null,
      });
    }

    // 创建用户文件夹
    const uploadDir = path.join(__dirname, "upload", uuid);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 将文件流转换为 Buffer
    const buffer = await file.arrayBuffer();

    // 保存文件
    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, Buffer.from(buffer));

    return c.json({
      code: 200,
      message: "文件上传成功",
      data: {
        filename: file.name,
        path: `/upload/${uuid}/${file.name}`,
      },
    });
  } catch (error) {
    console.error("文件上传错误:", error);
    return c.json({
      code: 500,
      message: "文件上传失败",
      data: null,
    });
  }
});

export default app;
