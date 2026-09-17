import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Button, Tag, Space, Typography, message, Popconfirm, Spin, Modal, Form, Input, Switch, Alert, Divider,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, RobotOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { tenantService, type Tenant, type CreateTenantInput } from '../../../services/tenant.service';
import { aiConfigService, type SafeAiConfig } from '../../../services/ai-config.service';

const { Title, Text } = Typography;

interface TenantFormValues {
  name: string;
  displayName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  planType?: string;
  isActive?: boolean;
}

interface AiConfigFormValues {
  baseUrl: string;
  apiKey: string;
  model: string;
}

const MerchantsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<TenantFormValues>();

  // 租户 AI 覆盖配置弹窗
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiTenant, setAiTenant] = useState<Tenant | null>(null);
  const [aiConfig, setAiConfig] = useState<SafeAiConfig | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSubmitting, setAiSubmitting] = useState(false);
  const [aiForm] = Form.useForm<AiConfigFormValues>();

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      setTenants(await tenantService.list(true));
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setModalVisible(true);
  };

  const openEdit = (tenant: Tenant) => {
    setEditing(tenant);
    form.setFieldsValue({
      name: tenant.name,
      displayName: tenant.displayName,
      contactPerson: tenant.contactPerson ?? undefined,
      email: tenant.email ?? undefined,
      phone: tenant.phone ?? undefined,
      planType: tenant.planType ?? undefined,
      isActive: tenant.isActive,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editing) {
        await tenantService.update(editing.id, values);
        message.success('商户已更新');
      } else {
        await tenantService.create(values as CreateTenantInput);
        message.success('商户已新增');
      }
      setModalVisible(false);
      fetchTenants();
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (tenant: Tenant) => {
    try {
      await tenantService.update(tenant.id, { isActive: !tenant.isActive });
      message.success(tenant.isActive ? '商户已停用' : '商户已启用');
      fetchTenants();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  // ==== 租户 AI 覆盖配置 ====
  const openAiConfig = async (tenant: Tenant) => {
    setAiTenant(tenant);
    setAiModalVisible(true);
    setAiLoading(true);
    setAiConfig(null);
    aiForm.resetFields();
    try {
      const cfg = await aiConfigService.getTenant(tenant.id);
      setAiConfig(cfg);
      if (cfg) {
        aiForm.setFieldsValue({
          baseUrl: cfg.baseUrl,
          apiKey: '',
          model: cfg.model,
        });
      }
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiSave = async () => {
    if (!aiTenant) return;
    try {
      const values = await aiForm.validateFields();
      setAiSubmitting(true);
      const saved = await aiConfigService.saveTenant(aiTenant.id, {
        baseUrl: values.baseUrl,
        apiKey: values.apiKey,
        model: values.model,
        isActive: true,
      });
      setAiConfig(saved);
      aiForm.setFieldsValue({ apiKey: '' });
      message.success('商户 AI 配置已保存');
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    } finally {
      setAiSubmitting(false);
    }
  };

  const handleAiRemove = async () => {
    if (!aiTenant) return;
    try {
      setAiSubmitting(true);
      await aiConfigService.removeTenant(aiTenant.id);
      setAiConfig(null);
      aiForm.resetFields();
      message.success('已移除商户 AI 覆盖，将使用全局默认');
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setAiSubmitting(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '商户名称', dataIndex: 'displayName', key: 'displayName',
      render: (v: string, r: Tenant) => (
        <Space direction="vertical" size={0}>
          <Text strong>{v}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>账号: {r.name}</Text>
        </Space>
      ),
    },
    { title: '联系人', dataIndex: 'contactPerson', key: 'contactPerson', render: (v: string | null) => v || '—' },
    { title: '邮箱', dataIndex: 'email', key: 'email', render: (v: string | null) => v || '—' },
    { title: '套餐', dataIndex: 'planType', key: 'planType', render: (v: string | null) => v || '—' },
    {
      title: '状态', dataIndex: 'isActive', key: 'isActive',
      render: (active: boolean) => (active ? <Tag color="success">启用</Tag> : <Tag color="default">已停用</Tag>),
    },
    {
      title: '创建时间', dataIndex: 'createdAt', key: 'createdAt',
      render: (t: string) => new Date(t).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作', key: 'action',
      render: (_: any, tenant: Tenant) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(tenant)}>
            编辑
          </Button>
          <Button size="small" icon={<RobotOutlined />} onClick={() => openAiConfig(tenant)}>
            AI 配置
          </Button>
          <Popconfirm
            title={tenant.isActive ? '停用该商户？' : '启用该商户？'}
            okText="确定"
            cancelText="取消"
            onConfirm={() => toggleActive(tenant)}
          >
            <Button size="small" danger={tenant.isActive} icon={<DeleteOutlined />}>
              {tenant.isActive ? '停用' : '启用'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>商户管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增商户
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={tenants}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>

      {/* 新增/编辑商户 */}
      <Modal
        title={editing ? '编辑商户' : '新增商户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText="保存"
        cancelText="取消"
        forceRender
      >
        <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
          <Form.Item name="name" label="登录账号（唯一）" rules={[{ required: true, message: '请输入登录账号' }]}>
            <Input placeholder="如 merchant2" maxLength={100} />
          </Form.Item>
          <Form.Item name="displayName" label="商户名称" rules={[{ required: true, message: '请输入商户名称' }]}>
            <Input placeholder="如：某某旗舰店" maxLength={100} />
          </Form.Item>
          <Form.Item name="contactPerson" label="联系人">
            <Input placeholder="联系人姓名" maxLength={50} />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="contact@example.com" maxLength={100} />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input placeholder="手机号" maxLength={20} />
          </Form.Item>
          <Form.Item name="planType" label="套餐类型">
            <Input placeholder="如 free / pro" maxLength={20} />
          </Form.Item>
          <Form.Item name="isActive" label="启用状态" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 租户 AI 覆盖配置 */}
      <Modal
        title={aiTenant ? `AI 配置覆盖 — ${aiTenant.displayName}` : 'AI 配置覆盖'}
        open={aiModalVisible}
        onCancel={() => setAiModalVisible(false)}
        onOk={handleAiSave}
        confirmLoading={aiSubmitting}
        okText="保存"
        cancelText="取消"
        forceRender
      >
        <Spin spinning={aiLoading}>
          {aiConfig ? (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message="当前已覆盖"
              description={
                <div>
                  <div>Base URL: {aiConfig.baseUrl}</div>
                  <div>模型: {aiConfig.model}</div>
                  <div>Key: {aiConfig.apiKeyMasked}</div>
                </div>
              }
            />
          ) : (
            !aiLoading && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                message="未设置覆盖，当前使用全局默认配置"
              />
            )
          )}

          <Form form={aiForm} layout="vertical">
            <Form.Item name="baseUrl" label="中转代理 Base URL" rules={[{ required: true, message: '请输入 Base URL' }]}>
              <Input placeholder="https://your-proxy.com/v1" />
            </Form.Item>
            <Form.Item
              name="apiKey"
              label="API Key"
              rules={aiConfig ? [] : [{ required: true, message: '请输入 API Key' }]}
              extra={aiConfig ? '留空并保存将沿用现有 Key（已脱敏显示）' : undefined}
            >
              <Input.Password placeholder="sk-..." />
            </Form.Item>
            <Form.Item name="model" label="模型" rules={[{ required: true, message: '请输入模型名' }]}>
              <Input placeholder="gpt-4o-mini" />
            </Form.Item>
          </Form>

          {aiConfig && (
            <>
              <Divider style={{ margin: '8px 0 16px' }} />
              <Button danger block icon={<ReloadOutlined />} onClick={handleAiRemove}>
                移除覆盖（回退到全局默认）
              </Button>
            </>
          )}
        </Spin>
      </Modal>
    </Spin>
  );
};

export default MerchantsPage;
