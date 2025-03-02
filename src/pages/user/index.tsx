import { DeleteOutlined,EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Popconfirm,Table } from 'antd';
import React, { useEffect,useState } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/user');
      const result = await response.json();
      if (result.code === 200) {
        setUsers(result.data);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('获取用户列表失败');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/user/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.code === 200) {
        message.success('删除成功');
        fetchUsers();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const url = editingUser
        ? `/api/user/${editingUser.id}`
        : '/api/user/register';
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();
      if (result.code === 200) {
        message.success(editingUser ? '更新成功' : '创建成功');
        setIsModalVisible(false);
        fetchUsers();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('提交失败');
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <div className="space-x-4">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建用户
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={isModalVisible}
        okText={editingUser? '更新' : '创建'}
        cancelText="取消"
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
