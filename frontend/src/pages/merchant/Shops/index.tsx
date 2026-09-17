import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Button, Tag, Space, Typography, message, Popconfirm, Spin, Modal, Form, Input, Select,
} from 'antd';
import { PlusOutlined, EditOutlined, PauseCircleOutlined, PlayCircleOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { shopService, type Shop } from '../../../services/shop.service';
import { authService } from '../../../services/auth.service';
import { PLATFORMS, PLATFORM_LABELS } from '../../../constants';

const { Title } = Typography;

const PLATFORM_COLORS: Record<string, string> = {
  taobao: 'orange',
  pinduoduo: 'red',
  douyin: 'default',
};

const PLATFORM_OPTIONS = Object.values(PLATFORMS).map((p) => ({
  value: p,
  label: PLATFORM_LABELS[p as keyof typeof PLATFORM_LABELS],
}));

interface ShopFormValues {
  name: string;
  platform: string;
  shopUrl?: string;
}

const ShopsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Shop | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<ShopFormValues>();

  const isAdmin = authService.getCurrentUser()?.role === 'merchant_admin';

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      setShops(await shopService.list());
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEdit = (shop: Shop) => {
    setEditing(shop);
    form.setFieldsValue({
      name: shop.name,
      platform: shop.platform,
      shopUrl: shop.shopUrl ?? undefined,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        await shopService.update(editing.id, values);
        message.success('店铺已更新');
      } else {
        await shopService.create(values);
        message.success('店铺已新增');
      }
      setModalVisible(false);
      fetchShops();
    } catch (err: any) {
      // validateFields 抛出的对象无 message，跳过；其余为后端错误
      if (err?.message) message.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (shop: Shop) => {
    try {
      await shopService.update(shop.id, { isActive: !shop.isActive });
      message.success(shop.isActive ? '店铺已停用' : '店铺已启用');
      fetchShops();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleRemove = async (shop: Shop) => {
    try {
      await shopService.remove(shop.id);
      message.success('店铺已停用');
      fetchShops();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: '店铺名称', dataIndex: 'name', key: 'name' },
    {
      title: '平台', dataIndex: 'platform', key: 'platform',
      render: (p: string) => (
        <Tag color={PLATFORM_COLORS[p] || 'default'}>
          {PLATFORM_LABELS[p as keyof typeof PLATFORM_LABELS] || p}
        </Tag>
      ),
    },
    {
      title: '店铺链接', dataIndex: 'shopUrl', key: 'shopUrl',
      render: (url: string | null) =>
        url ? (
          <a href={url} target="_blank" rel="noreferrer">
            <LinkOutlined /> {url}
          </a>
        ) : (
          <span style={{ color: '#bbb' }}>未设置</span>
        ),
    },
    {
      title: '状态', dataIndex: 'isActive', key: 'isActive',
      render: (active: boolean) =>
        active ? <Tag color="success">启用</Tag> : <Tag color="default">已停用</Tag>,
    },
    {
      title: '最后同步', dataIndex: 'lastSyncAt', key: 'lastSyncAt',
      render: (t: string | null) => (t ? new Date(t).toLocaleString('zh-CN') : '从未同步'),
    },
    {
      title: '操作', key: 'action',
      render: (_: any, shop: Shop) =>
        isAdmin ? (
          <Space size="small">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(shop)}>
              编辑
            </Button>
            <Button
              size="small"
              icon={shop.isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => toggleActive(shop)}
            >
              {shop.isActive ? '停用' : '启用'}
            </Button>
            <Popconfirm
              title="停用该店铺？"
              description="停用后该店铺将不再参与数据统计。"
              okText="停用"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleRemove(shop)}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          <span style={{ color: '#bbb' }}>只读</span>
        ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>店铺管理</Title>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增店铺
          </Button>
        )}
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={shops}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>

      <Modal
        title={editing ? '编辑店铺' : '新增店铺'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText="保存"
        cancelText="取消"
        forceRender
      >
        <Form form={form} layout="vertical" initialValues={{ platform: 'taobao' }}>
          <Form.Item
            name="name"
            label="店铺名称"
            rules={[{ required: true, message: '请输入店铺名称' }]}
          >
            <Input placeholder="如：淘宝旗舰店" maxLength={100} />
          </Form.Item>
          <Form.Item
            name="platform"
            label="所属平台"
            rules={[{ required: true, message: '请选择平台' }]}
          >
            <Select options={PLATFORM_OPTIONS} />
          </Form.Item>
          <Form.Item name="shopUrl" label="店铺链接">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

export default ShopsPage;
