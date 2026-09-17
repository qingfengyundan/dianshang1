import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Select, Spin, message,
  Table, Tag, Typography, Progress, Button, Collapse,
} from 'antd';
import {
  ArrowUpOutlined, ArrowDownOutlined, ShopOutlined,
  ThunderboltOutlined, TeamOutlined, BarChartOutlined,
  FileTextOutlined, CommentOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { dashboardService, type MetricsSummary } from '../../../services/dashboard.service';
import { PLATFORM_LABELS } from '../../../constants';
import { AiInsightsCard } from './AiInsightsCard';
import { PlatformComparisonCard } from './PlatformComparisonCard';
import { AiReportModal } from './AiReportModal';
import { AiChatModal } from './AiChatModal';

const { Title } = Typography;

const PLATFORM_COLORS: Record<string, string> = {
  taobao: '#ff6a00',
  pinduoduo: '#e02020',
  douyin: '#000000',
};

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [data, setData] = useState<MetricsSummary | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);

  useEffect(() => {
    fetchData(days);
  }, [days]);

  const fetchData = async (d: number) => {
    setLoading(true);
    try {
      const summary = await dashboardService.getSummary(d);
      setData(summary);
    } catch {
      message.error('数据加载失败');
    } finally {
      setLoading(false);
    }
  };

  const trendChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['销售额(元)', '订单量', 'UV'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data?.dailyTrend.map((d) => d.date.slice(5)) || [],
    },
    yAxis: [
      { type: 'value', name: '销售额(元)', axisLabel: { formatter: (v: number) => (v >= 10000 ? `${(v / 10000).toFixed(1)}w` : v) } },
      { type: 'value', name: '订单/UV', position: 'right' },
    ],
    series: [
      {
        name: '销售额(元)', type: 'bar', data: data?.dailyTrend.map((d) => d.gmv) || [],
        itemStyle: { color: '#5470c6' },
      },
      {
        name: '订单量', type: 'line', yAxisIndex: 1,
        data: data?.dailyTrend.map((d) => d.orders) || [],
        itemStyle: { color: '#ee6666' }, smooth: true,
      },
      {
        name: 'UV', type: 'line', yAxisIndex: 1,
        data: data?.dailyTrend.map((d) => d.uv) || [],
        itemStyle: { color: '#91cc75' }, smooth: true,
      },
    ],
  };

  const pieChartOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: data?.shopBreakdown.map((s) => ({
        name: s.shopName,
        value: parseFloat(s.gmvShare.toFixed(2)),
        itemStyle: { color: PLATFORM_COLORS[s.platform] },
      })) || [],
      label: { formatter: '{b}\n{d}%' },
    }],
  };

  const shopColumns = [
    { title: '店铺', dataIndex: 'shopName', key: 'shopName' },
    {
      title: '平台', dataIndex: 'platform', key: 'platform',
      render: (p: string) => (
        <Tag color={p === 'taobao' ? 'orange' : p === 'pinduoduo' ? 'red' : 'default'}>
          {PLATFORM_LABELS[p as keyof typeof PLATFORM_LABELS] || p}
        </Tag>
      ),
    },
    {
      title: '销售额', dataIndex: 'gmv', key: 'gmv',
      render: (v: number) => `¥${v.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`,
      sorter: (a: any, b: any) => a.gmv - b.gmv,
    },
    { title: '订单量', dataIndex: 'orders', key: 'orders', sorter: (a: any, b: any) => a.orders - b.orders },
    { title: 'UV', dataIndex: 'uv', key: 'uv' },
    {
      title: '转化率', dataIndex: 'conversionRate', key: 'conversionRate',
      render: (v: number) => `${(v * 100).toFixed(2)}%`,
    },
    {
      title: 'GMV占比', dataIndex: 'gmvShare', key: 'gmvShare',
      render: (v: number) => <Progress percent={parseFloat(v.toFixed(1))} size="small" />,
    },
  ];

  // 紧凑型核心指标条：作为 AI 洞察的上下文，不再占满顶部黄金位置
  const metricItems = [
    {
      title: '总销售额 (GMV)', value: data?.totalGmv ?? 0, prefix: '¥',
      color: '#1890ff', icon: <ShopOutlined />, precision: 0,
      growth: data?.gmvGrowth,
    },
    {
      title: '总订单量', value: data?.totalOrders ?? 0, prefix: '',
      color: '#52c41a', icon: <ThunderboltOutlined />, precision: 0,
      growth: data?.ordersGrowth,
    },
    {
      title: '平均转化率', value: (data?.avgConversionRate ?? 0) * 100, prefix: '',
      color: '#faad14', icon: <BarChartOutlined />, precision: 2, suffix: '%',
      growth: undefined,
    },
    {
      title: '日均访客 (UV)', value: data?.avgUv ?? 0, prefix: '',
      color: '#eb2f96', icon: <TeamOutlined />, precision: 0,
      growth: undefined,
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '0 4px' }}>
        {/* 顶部工具栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>数据看板</Title>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              icon={<FileTextOutlined />}
              onClick={() => setReportModalVisible(true)}
            >
              生成报告
            </Button>
            <Button
              icon={<CommentOutlined />}
              onClick={() => setChatModalVisible(true)}
              type="primary"
            >
              AI 助手
            </Button>
            <Select
              value={days}
              onChange={setDays}
              style={{ width: 120 }}
              options={[
                { value: 7, label: '最近7天' },
                { value: 14, label: '最近14天' },
                { value: 30, label: '最近30天' },
                { value: 60, label: '最近60天' },
              ]}
            />
          </div>
        </div>

        {/* AI 运营洞察 —— 置顶：分析 + 建议是核心价值 */}
        <AiInsightsCard days={days} />

        {/* 跨平台对比 —— 单平台后台看不到的差异化价值 */}
        <PlatformComparisonCard shops={data?.shopBreakdown || []} />

        {/* 紧凑指标条 —— 数据上下文，降级展示 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            {metricItems.map((m) => (
              <Col xs={12} sm={12} lg={6} key={m.title}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${m.color}1a`, color: m.color, fontSize: 20,
                    }}
                  >
                    {m.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#888', fontSize: 12, marginBottom: 2 }}>{m.title}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: m.color }}>
                        {m.prefix}{Number(m.value).toLocaleString('zh-CN', { maximumFractionDigits: m.precision, minimumFractionDigits: m.precision })}{m.suffix}
                      </span>
                      {m.growth !== undefined && (
                        <span style={{ fontSize: 12, color: m.growth >= 0 ? '#3f8600' : '#cf1322' }}>
                          {m.growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                          {Math.abs(m.growth).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* 图表区 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={16}>
            <Card title="销售趋势">
              <ReactECharts option={trendChartOption} style={{ height: 280 }} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="店铺 GMV 占比">
              <ReactECharts option={pieChartOption} style={{ height: 280 }} />
            </Card>
          </Col>
        </Row>

        {/* 店铺明细表 —— 折叠到次位 */}
        <Collapse
          ghost
          items={[
            {
              key: '1',
              label: (
                <span style={{ fontWeight: 600 }}>
                  各店铺数据明细
                  <span style={{ color: '#999', fontWeight: 400, marginLeft: 8, fontSize: 12 }}>
                    （点击展开）
                  </span>
                </span>
              ),
              children: (
                <Table
                  columns={shopColumns}
                  dataSource={data?.shopBreakdown || []}
                  rowKey="shopId"
                  pagination={false}
                  size="middle"
                />
              ),
            },
          ]}
        />

        {/* AI 报告生成弹窗 */}
        <AiReportModal
          visible={reportModalVisible}
          onClose={() => setReportModalVisible(false)}
        />

        {/* AI 对话助手弹窗 */}
        <AiChatModal
          visible={chatModalVisible}
          onClose={() => setChatModalVisible(false)}
        />
      </div>
    </Spin>
  );
};

export default DashboardPage;
