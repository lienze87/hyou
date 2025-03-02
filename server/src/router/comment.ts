import { Hono } from "hono";

import Blog from "../models/blog";
import Comment from "../models/comment";
import User from "../models/user";

const comment = new Hono();

// 创建评论
comment.post("/", async (c) => {
  try {
    const { content, authorId = 1, blogId, mentionedUserIds = [], quotedCommentId } = await c.req.json();
    if (!content || !blogId) {
      return c.json({ code: 400, message: "内容和博客ID都是必需的", data: null });
    }

    const blog = await Blog.findByPk(blogId);
    if (!blog) {
      return c.json({ code: 404, message: "博客不存在", data: null });
    }

    let quotedContent = null;
    if (quotedCommentId) {
      const quotedComment = await Comment.findByPk(quotedCommentId);
      if (!quotedComment) {
        return c.json({ code: 404, message: "引用的评论不存在", data: null });
      }
      quotedContent = quotedComment.content;
    }

    const newComment = await Comment.create({
      content,
      authorId,
      blogId,
      mentionedUserIds,
      quotedCommentId,
      quotedContent,
    });

    return c.json({
      code: 200,
      message: "评论创建成功",
      data: newComment,
    });
  } catch (error: any) {
    return c.json({ code: 500, message: `服务器错误: ${error.message}`, data: null }, 500);
  }
});

// 获取博客的所有评论
comment.get("/blog/:blogId", async (c) => {
  try {
    const blogId = c.req.param("blogId");
    const comments = await Comment.findAll({
      where: { blogId },
      include: [
        { model: User, as: 'author', attributes: ["username"] },
        { model: Comment, as: 'quotedComment', include: [{ model: User, as: 'author', attributes: ["username"] }] }
      ],
      order: [["createdAt", "DESC"]],
    });

    return c.json({
      code: 200,
      message: "获取评论列表成功",
      data: comments,
    });
  } catch (error: any) {
    return c.json({ code: 500, message: `服务器错误: ${error.message}`, data: null }, 500);
  }
});

// 删除评论
comment.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const comment = await Comment.findByPk(id);

    if (!comment) {
      return c.json({ code: 404, message: "评论不存在", data: null });
    }

    await comment.destroy();

    return c.json({
      code: 200,
      message: "评论删除成功",
      data: null,
    });
  } catch (error: any) {
    return c.json({ code: 500, message: `服务器错误: ${error.message}`, data: null }, 500);
  }
});

export default comment;
