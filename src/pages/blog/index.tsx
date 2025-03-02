import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Space, Table } from "antd";
import React, { useEffect, useState } from "react";

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

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [form] = Form.useForm();

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blog");
      const result = await response.json();
      if (result.code === 200) {
        setBlogs(result.data);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error("获取博客列表失败");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleCreate = () => {
    setEditingBlog(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    form.setFieldsValue(blog);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.code === 200) {
        message.success("删除成功");
        fetchBlogs();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const url = editingBlog ? `/api/blog/${editingBlog.id}` : "/api/blog";
      const method = editingBlog ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          authorId: 1, // 临时使用固定作者ID
        }),
      });

      const result = await response.json();
      if (result.code === 200) {
        message.success(editingBlog ? "更新成功" : "创建成功");
        setIsModalVisible(false);
        fetchBlogs();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error("提交失败");
    }
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">博客列表</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建博客
        </Button>
      </div>

      <Table
        dataSource={blogs}
        rowKey="id"
        columns={[
          {
            title: "标题",
            dataIndex: "title",
            key: "title",
            width: "20%",
          },
          {
            title: "内容",
            dataIndex: "content",
            key: "content",
            width: "40%",
            render: (text: string) => <div className="line-clamp-2">{text}</div>,
          },
          {
            title: "作者",
            dataIndex: ["author", "username"],
            key: "author",
            width: "10%",
            render: (text: string) => text || "未知",
          },
          {
            title: "发布时间",
            dataIndex: "createdAt",
            key: "createdAt",
            width: "15%",
            render: (text: string) => new Date(text).toLocaleDateString(),
          },
          {
            title: "操作",
            key: "action",
            width: "15%",
            render: (_: any, record: Blog) => (
              <Space>
                <Button type="link" onClick={() => (window.location.href = `/blog/${record.id}`)}>
                  查看
                </Button>
                <Button type="link" onClick={() => handleEdit(record)}>
                  编辑
                </Button>
                <Button type="link" danger onClick={() => handleDelete(record.id)}>
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      <Modal
        title={editingBlog ? "编辑博客" : "新建博客"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入标题" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: "请输入内容" }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlogList;
