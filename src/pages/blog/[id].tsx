import { LeftOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, List, message } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Blog {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    username: string;
  };
}

interface Comment {
  id: number;
  content: string;
  blogId: number;
  userId: number;
  createdAt: string;
  author?: {
    username: string;
  };
}

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [form] = Form.useForm();

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blog/${id}`);
      const result = await response.json();
      if (result.code === 200) {
        setBlog(result.data);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error("获取博客详情失败");
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comment/blog/${id}`);
      const result = await response.json();
      if (result.code === 200) {
        setComments(result.data);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error("获取评论列表失败");
    }
  };

  useEffect(() => {
    if (id) {
      fetchBlog();
      fetchComments();
    }
  }, [id]);

  const handleSubmitComment = async () => {
    try {
      const values = await form.validateFields();
      const response = await fetch(`/api/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          blogId: Number(id),
          authorId: 1, // 临时使用固定用户ID
        }),
      });

      const result = await response.json();
      if (result.code === 200) {
        message.success("评论发表成功");
        form.resetFields();
        fetchComments();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error("评论发表失败");
    }
  };

  if (!blog) {
    return <div>加载中...</div>;
  }

  return (
    <div className="container p-6">
      <Button type="link" icon={<LeftOutlined />} onClick={() => navigate("/blog")} className="mb-4 pl-0">
        返回博客列表
      </Button>
      <Card className="mb-6">
        <h1 className="text-2xl font-bold mb-4">{blog.title}</h1>
        <div className="text-sm text-gray-400 mb-4">
          <span>作者：{blog.author?.username || "未知"}</span>
          <span className="ml-4">发布时间：{new Date(blog.createdAt).toLocaleString()}</span>
        </div>
        <div className="whitespace-pre-wrap">{blog.content}</div>
      </Card>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">发表评论</h2>
        <Form form={form} onFinish={handleSubmitComment}>
          <Form.Item name="content" rules={[{ required: true, message: "请输入评论内容" }]}>
            <Input.TextArea rows={4} placeholder="请输入您的评论" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              发表评论
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">评论列表</h2>
        <List
          dataSource={comments}
          renderItem={(comment) => (
            <List.Item className="shadow ">
              <List.Item.Meta
                title={
                  <div className="flex justify-between p-2">
                    <span>{comment.author?.username || "未知用户"}</span>
                    <span className="text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                }
                description={<div className="p-2 bg-white whitespace-pre-wrap">{comment.content}</div>}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default BlogDetail;
