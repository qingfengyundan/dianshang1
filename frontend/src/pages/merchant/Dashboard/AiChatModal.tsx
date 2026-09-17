import React, { useState } from 'react';
import { Modal, Input, Button, message, Spin, Avatar, Select } from 'antd';
import { CommentOutlined, RobotOutlined, UserOutlined, SendOutlined } from '@ant-design/icons';
import { aiService } from '../../../services/ai.service';

const { TextArea } = Input;
const { Option } = Select;

interface AiChatModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export const AiChatModal: React.FC<AiChatModalProps> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const answer = await aiService.chat(input, days);
      const aiMessage: Message = {
        role: 'ai',
        content: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessages([]);
    setInput('');
    onClose();
  };

  const quickQuestions = [
    '上周哪个店铺表现最好？',
    '为什么销售额下降了？',
    '转化率如何提升？',
    '各平台对比分析',
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            <CommentOutlined style={{ marginRight: 8 }} />
            AI 数据助手
          </span>
          <Select
            value={days}
            onChange={setDays}
            style={{ width: 120 }}
            size="small"
          >
            <Option value={7}>最近7天</Option>
            <Option value={14}>最近14天</Option>
            <Option value={30}>最近30天</Option>
          </Select>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      width={700}
      footer={null}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: 500 }}>
        {/* 消息列表 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            backgroundColor: '#f5f5f5',
            borderRadius: 4,
            marginBottom: 16,
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              <RobotOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <div>你好！我是 AI 数据助手，有什么可以帮你分析的？</div>
              <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {quickQuestions.map((q, i) => (
                  <Button
                    key={i}
                    size="small"
                    onClick={() => setInput(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: 12,
                  marginBottom: 16,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Avatar
                  icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                  style={{
                    backgroundColor: msg.role === 'user' ? '#1890ff' : '#52c41a',
                  }}
                />
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    backgroundColor: msg.role === 'user' ? '#1890ff' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#000',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Spin tip="AI 正在思考..." />
            </div>
          )}
        </div>

        {/* 输入框 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你的问题，例如：上周哪个店铺表现最好？"
            autoSize={{ minRows: 2, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            disabled={!input.trim()}
          >
            发送
          </Button>
        </div>
      </div>
    </Modal>
  );
};
