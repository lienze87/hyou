import { compare, hash } from "bcrypt";
import { Hono } from "hono";

import User from "../models/user";

const app = new Hono();

// 获取用户列表
app.get("/", async (c) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    return c.json({
      code: 200,
      message: "获取用户列表成功",
      data: users,
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: "获取用户列表失败",
      data: null,
    });
  }
});

// 用户注册
app.post("/register", async (c) => {
  try {
    const { username, email, password } = await c.req.json();

    // 验证必填字段
    if (!username || !email || !password) {
      return c.json({ error: "请填写所有必填字段" }, 400);
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return c.json({ error: "用户名已存在" }, 400);
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return c.json({ error: "邮箱已被注册" }, 400);
    }

    // 密码加密
    const hashedPassword = await hash(password, 10);

    // 创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return c.json({
      message: "注册成功",
      code: 200,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return c.json({ error: "注册失败" }, 500);
  }
});

// 用户登录
app.post("/login", async (c) => {
  try {
    const { username, password } = await c.req.json();

    // 验证必填字段
    if (!username || !password) {
      return c.json({ error: "请填写用户名和密码" }, 400);
    }

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return c.json({ error: "用户不存在" }, 404);
    }

    // 验证密码
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return c.json({ error: "密码错误" }, 401);
    }

    return c.json({
      message: "登录成功",
      code: 200,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return c.json({ error: "登录失败" }, 500);
  }
});

// 删除用户
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const user = await User.findByPk(id);

    if (!user) {
      return c.json({
        code: 404,
        message: "用户不存在",
        data: null,
      });
    }

    await user.destroy();

    return c.json({
      code: 200,
      message: "删除用户成功",
      data: null,
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: "删除用户失败",
      data: null,
    });
  }
});

// 修改用户信息
app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { username, email } = await c.req.json();

    // 查找要修改的用户
    const user = await User.findByPk(id);
    if (!user) {
      return c.json({
        code: 404,
        message: "用户不存在",
        data: null,
      });
    }

    // 检查用户名是否已被其他用户使用
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return c.json({
          code: 400,
          message: "用户名已存在",
          data: null,
        });
      }
    }

    // 检查邮箱是否已被其他用户使用
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return c.json({
          code: 400,
          message: "邮箱已被注册",
          data: null,
        });
      }
    }

    // 更新用户信息
    await user.update({ username, email });

    return c.json({
      code: 200,
      message: "更新用户信息成功",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return c.json({
      code: 500,
      message: "更新用户信息失败",
      data: null,
    });
  }
});

export default app;
