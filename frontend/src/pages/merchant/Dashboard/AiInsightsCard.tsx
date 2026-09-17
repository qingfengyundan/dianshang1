import React, { useState, useEffect } from 'react';
import { Card, Spin, Alert, Tag, Badge, Empty } from 'antd';
import {
  BulbOutlined,
  RiseOutlined,
  FallOutlined,
  WarningOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { aiService, type AiInsight } from '../../../services/ai.service';

interface AiInsightsCardProps {
  days: number;
}

const priorityColors = {
  high: 'red',
  medium: 'orange',
  low: 'blue',
};

const categoryIcons = {
  trend: <RiseOutlined />,
  anomaly: <WarningOutlined />,
  opportunity: <ThunderboltOutlined />,
  warning: <FallOutlined />,
};

const categoryLabels = {
  trend: '趋势',
  anomaly: '异常',
  opportunity: '机会',
  warning: '预警',
};

export const AiInsightsCard: React.FC<AiInsightsCardProps> = ({ days }) => {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, [days]);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiService.getInsights(days);
      setInsights(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card title="🤖 AI 数据洞察" style={{ marginTop: 24 }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#666' }}>AI 正在分析数据...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="🤖 AI 数据洞察" style={{ marginTop: 24 }}>
        <Alert
          message="获取 AI 洞察失败"
          description={error}
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card title="🤖 AI 数据洞察" style={{ marginTop: 24 }}>
        <Empty description="暂无 AI 洞察数据" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <span>
          <BulbOutlined style={{ marginRight: 8, color: '#faad14' }} />
          AI 数据洞察
        </span>
      }
      style={{ marginTop: 24 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {insights.map((insight, index) => (
          <Card
            key={index}
            size="small"
            style={{
              borderLeft: `4px solid ${
                insight.priority === 'high'
                  ? '#ff4d4f'
                  : insight.priority === 'medium'
                  ? '#faad14'
                  : '#1890ff'
              }`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>
                    {categoryIcons[insight.category]} {insight.title}
                  </span>
                  <Tag color={priorityColors[insight.priority]}>
                    {insight.priority === 'high' ? '高优先级' : insight.priority === 'medium' ? '中优先级' : '低优先级'}
                  </Tag>
                  <Badge
                    count={categoryLabels[insight.category]}
                    style={{
                      backgroundColor:
                        insight.category === 'trend'
                          ? '#52c41a'
                          : insight.category === 'anomaly'
                          ? '#faad14'
                          : insight.category === 'opportunity'
                          ? '#1890ff'
                          : '#ff4d4f',
                    }}
                  />
                </div>
                <div style={{ color: '#666', marginBottom: 8, lineHeight: 1.6 }}>
                  {insight.description}
                </div>
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f0f5ff',
                    borderRadius: 4,
                    color: '#1890ff',
                    fontSize: 13,
                  }}
                >
                  💡 建议: {insight.suggestion}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};
