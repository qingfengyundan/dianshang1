import React, { useState, useEffect, useMemo } from 'react';
import { Card, Spin, Alert, Tag, Empty, Button, Space, Tooltip, message } from 'antd';
import {
  BulbOutlined,
  RiseOutlined,
  FallOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  RightOutlined,
  CheckOutlined,
  AimOutlined,
} from '@ant-design/icons';
import { aiService, type AiInsight } from '../../../services/ai.service';

interface AiInsightsCardProps {
  days: number;
}

// 优先级视觉映射：高优先级用醒目的红色渐变 + 动画光晕，中等用橙色，低用蓝色
const PRIORITY_META: Record<
  AiInsight['priority'],
  { label: string; gradient: string; border: string; color: string; glow: string }
> = {
  high: {
    label: '高优先级',
    gradient: 'linear-gradient(135deg, #fff1f0 0%, #ffffff 60%)',
    border: '#ff4d4f',
    color: '#cf1322',
    glow: '0 0 0 2px rgba(255,77,79,0.12)',
  },
  medium: {
    label: '中优先级',
    gradient: 'linear-gradient(135deg, #fff7e6 0%, #ffffff 60%)',
    border: '#faad14',
    color: '#ad6800',
    glow: '0 0 0 2px rgba(250,173,20,0.10)',
  },
  low: {
    label: '低优先级',
    gradient: 'linear-gradient(135deg, #f0f5ff 0%, #ffffff 60%)',
    border: '#1890ff',
    color: '#0958d9',
    glow: 'none',
  },
};

const CATEGORY_META: Record<
  AiInsight['category'],
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  trend: { label: '趋势', icon: <RiseOutlined />, color: '#52c41a', bg: '#f6ffed' },
  anomaly: { label: '异常', icon: <WarningOutlined />, color: '#faad14', bg: '#fffbe6' },
  opportunity: { label: '机会', icon: <ThunderboltOutlined />, color: '#1890ff', bg: '#e6f7ff' },
  warning: { label: '预警', icon: <FallOutlined />, color: '#ff4d4f', bg: '#fff1f0' },
};

export const AiInsightsCard: React.FC<AiInsightsCardProps> = ({ days }) => {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiService.getInsights(days);
      setInsights(data);
      // 默认展开所有高优先级洞察
      setExpanded(new Set(data.map((_, i) => (data[i].priority === 'high' ? i : -1)).filter((i) => i >= 0)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const highCount = useMemo(
    () => insights.filter((i) => i.priority === 'high').length,
    [insights],
  );

  const toggleExpand = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const markRead = (index: number) => {
    setReadIds((prev) => new Set(prev).add(index));
  };

  const headerExtra = (
    <span style={{ fontSize: 13, color: '#888' }}>
      {loading ? '分析中…' : `${insights.length} 条洞察`}
      {!loading && highCount > 0 && (
        <Tag color="red" style={{ marginLeft: 8 }}>
          {highCount} 项需关注
        </Tag>
      )}
    </span>
  );

  const renderBody = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#666' }}>AI 正在分析数据…</div>
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          message="获取 AI 洞察失败"
          description={error}
          type="warning"
          showIcon
        />
      );
    }

    if (insights.length === 0) {
      return <Empty description="暂无 AI 洞察数据" />;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {insights.map((insight, index) => {
          const pm = PRIORITY_META[insight.priority];
          const cm = CATEGORY_META[insight.category];
          const isExpanded = expanded.has(index);
          const isRead = readIds.has(index);

          return (
            <div
              key={index}
              style={{
                background: pm.gradient,
                border: `1px solid ${pm.border}`,
                borderLeft: `5px solid ${pm.border}`,
                borderRadius: 8,
                padding: '14px 16px',
                boxShadow: pm.glow,
                opacity: isRead ? 0.55 : 1,
                transition: 'opacity 0.25s',
              }}
            >
              {/* 标题行 */}
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
                onClick={() => toggleExpand(index)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>
                      {cm.icon} {insight.title}
                    </span>
                    <Tag color={pm.color.replace('#', '')} style={{ margin: 0 }}>
                      {pm.label}
                    </Tag>
                    <span
                      style={{
                        fontSize: 12,
                        color: cm.color,
                        background: cm.bg,
                        padding: '1px 8px',
                        borderRadius: 10,
                      }}
                    >
                      {cm.label}
                    </span>
                  </div>
                  <div style={{ color: '#595959', marginTop: 8, lineHeight: 1.65, fontSize: 13 }}>
                    {insight.description}
                  </div>
                </div>
                <RightOutlined
                  style={{ color: '#999', marginLeft: 12, marginTop: 4, transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
                />
              </div>

              {/* 展开的建议区 + 操作 */}
              {isExpanded && (
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.85)',
                      border: `1px dashed ${pm.border}`,
                      borderRadius: 6,
                      color: pm.color,
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    <AimOutlined style={{ marginRight: 6 }} />
                    <b>建议:</b> {insight.suggestion}
                  </div>
                  <Space style={{ marginTop: 12 }}>
                    <Button
                      size="small"
                      type="primary"
                      ghost
                      icon={<ThunderboltOutlined />}
                      onClick={() => message.info('执行通道将在「智能体管理」阶段上线')}
                    >
                      一键执行
                    </Button>
                    <Button size="small" icon={<CheckOutlined />} onClick={() => markRead(index)}>
                      标记已读
                    </Button>
                  </Space>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <BulbOutlined style={{ marginRight: 8, color: '#faad14' }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>AI 运营洞察</span>
          <Tooltip title="AI 自动识别趋势、异常与机会，给出可执行的优化建议">
            <Tag style={{ marginLeft: 8 }} color="processing">核心</Tag>
          </Tooltip>
        </span>
      }
      extra={headerExtra}
      style={{ marginBottom: 16 }}
    >
      {renderBody()}
    </Card>
  );
};
