import React, { useMemo } from 'react';
import { Card, Progress, Tag, Tooltip, Empty } from 'antd';
import {
  CrownOutlined,
} from '@ant-design/icons';
import type { ShopMetrics } from '../../../services/dashboard.service';
import { PLATFORM_LABELS } from '../../../constants';

interface PlatformComparisonCardProps {
  shops: ShopMetrics[];
}

interface PlatformAgg {
  platform: string;
  gmv: number;
  orders: number;
  conversionRate: number;
  shopCount: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  taobao: '#ff6a00',
  pinduoduo: '#e02020',
  douyin: '#000000',
};

/** 将店铺明细按平台聚合，用于跨平台对比 */
function aggregateByPlatform(shops: ShopMetrics[]): PlatformAgg[] {
  const map = new Map<string, PlatformAgg>();
  for (const s of shops) {
    const agg = map.get(s.platform) || {
      platform: s.platform,
      gmv: 0,
      orders: 0,
      conversionRate: 0,
      shopCount: 0,
    };
    agg.gmv += s.gmv;
    agg.orders += s.orders;
    // 转化率取平台内店铺的加权平均（按 UV 加权更合理，但这里按店铺均摊，避免单店异常放大）
    agg.conversionRate += s.conversionRate;
    agg.shopCount += 1;
    map.set(s.platform, agg);
  }
  return Array.from(map.values()).map((a) => ({
    ...a,
    conversionRate: a.shopCount > 0 ? a.conversionRate / a.shopCount : 0,
  }));
}

export const PlatformComparisonCard: React.FC<PlatformComparisonCardProps> = ({ shops }) => {
  const aggregates = useMemo(() => aggregateByPlatform(shops), [shops]);

  if (aggregates.length === 0) {
    return (
      <Card title="跨平台对比" style={{ marginBottom: 16 }}>
        <Empty description="暂无店铺数据" />
      </Card>
    );
  }

  const totalGmv = aggregates.reduce((sum, a) => sum + a.gmv, 0) || 1;
  const bestConv = Math.max(...aggregates.map((a) => a.conversionRate));
  const bestGmv = Math.max(...aggregates.map((a) => a.gmv));

  return (
    <Card
      title={
        <span style={{ fontSize: 16, fontWeight: 600 }}>
          跨平台对比
          <Tag style={{ marginLeft: 8 }} color="purple">单平台后台看不到</Tag>
        </span>
      }
      style={{ marginBottom: 16 }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {aggregates.map((agg) => {
          const color = PLATFORM_COLORS[agg.platform] || '#1890ff';
          const share = (agg.gmv / totalGmv) * 100;
          const isBestConv = agg.conversionRate === bestConv && bestConv > 0;
          const isBestGmv = agg.gmv === bestGmv && bestGmv > 0;

          return (
            <div
              key={agg.platform}
              style={{
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                padding: 16,
                background: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>
                  {PLATFORM_LABELS[agg.platform as keyof typeof PLATFORM_LABELS] || agg.platform}
                  <span style={{ color: '#999', fontWeight: 400, marginLeft: 6, fontSize: 12 }}>
                    {agg.shopCount} 店
                  </span>
                </span>
                {(isBestConv || isBestGmv) && (
                  <Tooltip title={isBestConv ? '转化率最高' : 'GMV 最高'}>
                    <CrownOutlined style={{ color: '#faad14', fontSize: 18 }} />
                  </Tooltip>
                )}
              </div>

              <div style={{ fontSize: 22, fontWeight: 700, color, marginBottom: 4 }}>
                ¥{agg.gmv.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
              </div>
              <div style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>
                GMV 占比 {share.toFixed(1)}%
              </div>

              <Progress
                percent={parseFloat(share.toFixed(1))}
                showInfo={false}
                strokeColor={color}
                size="small"
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 13 }}>
                <span style={{ color: '#595959' }}>
                  转化率{' '}
                  <b style={{ color: isBestConv ? '#3f8600' : '#262626' }}>
                    {(agg.conversionRate * 100).toFixed(2)}%
                  </b>
                </span>
                <span style={{ color: '#595959' }}>
                  订单 <b>{agg.orders.toLocaleString('zh-CN')}</b>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
