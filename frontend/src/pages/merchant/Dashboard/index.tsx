import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Statistic, Select, Spin, message,
  Table, Tag, Typography, Progress,
} from 'antd';
import {
  ArrowUpOutlined, ArrowDownOutlined, ShopOutlined,
  ThunderboltOutlined, TeamOutlined, BarChartOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { dashboardService, type MetricsSummary } from '../../../services/dashboard.service';
import { PLATFORM_LABELS } from '../../../constants';

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

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '0 4px' }}>
        {/* 顶部工具栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>数据看板</Title>
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

        {/* 核心指标卡片 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总销售额 (GMV)"
                value={data?.totalGmv || 0}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ShopOutlined />}
                suffix="元"
                formatter={(v) => `¥${Number(v).toLocaleString()}`}
              />
              {data && (
                <div style={{ marginTop: 8, fontSize: 12, color: data.gmvGrowth >= 0 ? '#3f8600' : '#cf1322' }}>
                  {data.gmvGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {' '}{Math.abs(data.gmvGrowth).toFixed(1)}% vs 上周期
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总订单量"
                value={data?.totalOrders || 0}
                valueStyle={{ color: '#52c41a' }}
                prefix={<ThunderboltOutlined />}
                suffix="单"
              />
              {data && (
                <div style={{ marginTop: 8, fontSize: 12, color: data.ordersGrowth >= 0 ? '#3f8600' : '#cf1322' }}>
                  {data.ordersGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {' '}{Math.abs(data.ordersGrowth).toFixed(1)}% vs 上周期
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="平均转化率"
                value={((data?.avgConversionRate || 0) * 100).toFixed(2)}
                valueStyle={{ color: '#faad14' }}
                prefix={<BarChartOutlined />}
                suffix="%"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="日均访客 (UV)"
                value={data?.avgUv || 0}
                valueStyle={{ color: '#eb2f96' }}
                prefix={<TeamOutlined />}
                suffix="人"
              />
            </Card>
          </Col>
        </Row>

        {/* 图表区 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
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

        {/* 店铺明细表 */}
        <Card title="各店铺数据明细" style={{ marginTop: 16 }}>
          <Table
            columns={shopColumns}
            dataSource={data?.shopBreakdown || []}
            rowKey="shopId"
            pagination={false}
            size="middle"
          />
        </Card>
      </div>
    </Spin>
  );
};

export default DashboardPage;
