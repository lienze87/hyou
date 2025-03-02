import "../models/associations";

import { Hono } from "hono";

import Blog from "../models/blog";
import User from "../models/user";

const blog = new Hono();

// 创建博客
blog.post("/", async (c) => {
  try {
    const { title, content, authorId = 1 } = await c.req.json();
    if (!title || !content) {
      return c.json({ code: 400, message: "标题和内容都是必需的", data: null });
    }

    const newBlog = await Blog.create({
      title,
      content,
      authorId, // 使用默认作者ID
    });

    return c.json({
      code: 200,
      message: "博客创建成功",
      data: newBlog,
    });
  } catch (error: any) {
    return c.json({ code: 500, message: `服务器错误: ${error.message}`, data: null }, 500);
  }
});

// 获取所有博客
blog.get("/", async (c) => {
  try {
    const blogs = await Blog.findAll({
      include: [{ model: User, as: 'author', attributes: ["username"] }],
      order: [["createdAt", "DESC"]],
    });

    return c.json({
      code: 200,
      message: "获取博客列表成功",
      data: blogs,
    });
  } catch (error: any) {
    return c.json({ code: 500, message: `服务器错误: ${error.message}`, data: null }, 500);
  }
});

// 获取单个博客
blog.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const blog = await Blog.findByPk(id, {
      include: [{ model: User, as: 'author', attributes: ["username"] }],
    });

    if (!blog) {
      return c.json({ code: 404, message: "博客不存在", data: null });
    }

    return c.json({
      code: 200,
      message: "获取博客详情成功",
      data: blog,
    });
  } catch (error: any) {
    return c.json({ code: 500, message: `服务器错误: ${error.message}`, data: null }, 500);
  }
});

// 更新博客
blog.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { title, content } = await c.req.json();

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return c.json({ code: 404, message: "博客不存在", data: null });
    }

    await blog.update({ title, content });

    return c.json({
      code: 200,
      message: "博客更新成功",
      data: blog,
    });
  } catch (error: any) {
    return c.json({ code: 500, message: `服务器错误: ${error.message}`, data: null }, 500);
  }
});

// 删除博客
blog.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return c.json({ code: 404, message: "博客不存在", data: null });
    }

    await blog.destroy();

    return c.json({
      code: 200,
      message: "博客删除成功",
      data: null,
    });
  } catch (error: any) {
    return c.json({ code: 500, message: `服务器错误: ${error.message}`, data: null }, 500);
  }
});

export default blog;
