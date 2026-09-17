import React, { useState } from 'react';
import { Modal, Form, DatePicker, Select, Button, message, Spin } from 'antd';
import { FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import { aiService } from '../../../services/ai.service';
import ReactMarkdown from 'react-markdown';
import dayjs, { type Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface AiReportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AiReportModal: React.FC<AiReportModalProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const handleGenerate = async (values: any) => {
    const { type, dateRange } = values;
    const [start, end] = dateRange as [Dayjs, Dayjs];

    setLoading(true);
    try {
      const reportContent = await aiService.generateReport({
        type,
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
      });
      setReport(reportContent);
      message.success('报告生成成功');
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `电商数据报告_${dayjs().format('YYYY-MM-DD')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setReport(null);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <span>
          <FileTextOutlined style={{ marginRight: 8 }} />
          生成 AI 智能报告
        </span>
      }
      open={visible}
      onCancel={handleClose}
      width={800}
      footer={null}
    >
      <Spin spinning={loading}>
        {!report ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleGenerate}
            initialValues={{
              type: 'weekly',
              dateRange: [dayjs().subtract(7, 'day'), dayjs()],
            }}
          >
            <Form.Item
              name="type"
              label="报告类型"
              rules={[{ required: true, message: '请选择报告类型' }]}
            >
              <Select>
                <Option value="weekly">周报</Option>
                <Option value="monthly">月报</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dateRange"
              label="日期范围"
              rules={[{ required: true, message: '请选择日期范围' }]}
            >
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                生成报告
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                type="primary"
              >
                下载报告
              </Button>
            </div>
            <div
              style={{
                maxHeight: 500,
                overflowY: 'auto',
                padding: 16,
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
              }}
            >
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          </div>
        )}
      </Spin>
    </Modal>
  );
};
