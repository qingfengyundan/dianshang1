import React, { useEffect, useState } from 'react';
import {
  Card, Form, Input, Switch, Button, Typography, Spin, message, Alert, Descriptions,
} from 'antd';
import { SaveOutlined, RobotOutlined } from '@ant-design/icons';
import { aiConfigService, type SafeAiConfig } from '../../../services/ai-config.service';

const { Title, Text } = Typography;

interface AiConfigFormValues {
  baseUrl: string;
  apiKey: string;
  model: string;
  isActive: boolean;
}

const AiConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SafeAiConfig | null>(null);
  const [form] = Form.useForm<AiConfigFormValues>();

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const cfg = await aiConfigService.getGlobal();
      setConfig(cfg);
      if (cfg) {
        form.setFieldsValue({
          baseUrl: cfg.baseUrl,
          apiKey: '',
          model: cfg.model,
          isActive: cfg.isActive,
        });
      }
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const saved = await aiConfigService.saveGlobal(values);
      setConfig(saved);
      form.setFieldsValue({ apiKey: '' });
      message.success('AI 配置已保存，立即生效');
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            <RobotOutlined style={{ marginRight: 8, color: '#faad14' }} />
            AI 服务配置
          </Title>
          <Text type="secondary">
            配置大模型中转代理服务，供全平台 AI 洞察、报告与问答使用。租户可在「商户管理」中覆盖。
          </Text>
        </div>

        {config && (
          <Alert
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
            message="已配置"
            description={
              <Descriptions column={1} size="small" style={{ marginTop: 8 }}>
                <Descriptions.Item label="Base URL">{config.baseUrl}</Descriptions.Item>
                <Descriptions.Item label="模型">{config.model}</Descriptions.Item>
                <Descriptions.Item label="API Key">{config.apiKeyMasked}</Descriptions.Item>
              </Descriptions>
            }
          />
        )}

        <Card title="全局默认配置">
          <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
            <Form.Item
              name="baseUrl"
              label="中转代理 Base URL"
              rules={[{ required: true, message: '请输入 Base URL' }]}
              extra="兼容 OpenAI 协议的服务地址，通常以 /v1 结尾"
            >
              <Input placeholder="https://your-proxy.com/v1" />
            </Form.Item>
            <Form.Item
              name="apiKey"
              label="API Key"
              rules={[{ required: true, message: '请输入 API Key' }]}
              extra={config ? '留空并保存将沿用现有 Key（已脱敏显示）' : '填写中转服务提供的密钥'}
            >
              <Input.Password placeholder="sk-..." />
            </Form.Item>
            <Form.Item
              name="model"
              label="模型"
              rules={[{ required: true, message: '请输入模型名' }]}
              extra="如 gpt-4o-mini、deepseek-chat 等，需与中转服务支持的模型一致"
            >
              <Input placeholder="gpt-4o-mini" />
            </Form.Item>
            <Form.Item name="isActive" label="启用 AI 服务" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              保存配置
            </Button>
          </Form>
        </Card>

        <Alert
          type="info"
          showIcon
          style={{ marginTop: 16 }}
          message="API Key 安全说明"
          description="Key 仅用于后端调用大模型服务，接口返回时已脱敏，不会明文回显。"
        />
      </div>
    </Spin>
  );
};

export default AiConfigPage;
