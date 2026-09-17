import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, message, Select, Space, Table, Tag, Typography } from 'antd';
import { ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import { dataSyncService, type DataSync } from '../../../services/data-sync.service';
import { shopService, type Shop } from '../../../services/shop.service';
import { authService } from '../../../services/auth.service';

const { Title, Text } = Typography;

const statusLabel: Record<DataSync['status'], { color: string; text: string }> = {
  running: { color: 'processing', text: '同步中' }, success: { color: 'success', text: '已完成' }, failed: { color: 'error', text: '失败' },
};

const DataSyncPage: React.FC = () => {
  const [records, setRecords] = useState<DataSync[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const isAdmin = authService.getCurrentUser()?.role === 'merchant_admin';
  const load = useCallback(async () => {
    setLoading(true);
    try { const [history, shopList] = await Promise.all([dataSyncService.list(), shopService.list()]); setRecords(history); setShops(shopList.filter((shop) => shop.isActive)); }
    catch (error: any) { message.error(error.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const run = async (retryId?: number) => {
    try { setSyncing(true); if (retryId) await dataSyncService.retry(retryId); else await dataSyncService.trigger(shopId); message.success('模拟数据同步已完成'); await load(); }
    catch (error: any) { message.error(error.message); } finally { setSyncing(false); }
  };
  return <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <div><Title level={4} style={{ margin: 0 }}>数据同步</Title><Text type="secondary">当前使用模拟数据源；接入平台 API 后将显示真实采集结果。</Text></div>
      {isAdmin && <Space><Select allowClear placeholder="全部启用店铺" style={{ width: 180 }} options={shops.map((shop) => ({ value: shop.id, label: shop.name }))} onChange={setShopId} /><Button type="primary" icon={<SyncOutlined />} loading={syncing} onClick={() => run()}>立即同步</Button></Space>}
    </div>
    <Card><Table loading={loading} rowKey="id" dataSource={records} pagination={{ pageSize: 10 }} locale={{ emptyText: '暂无同步记录' }} columns={[
      { title: '店铺', key: 'shop', render: (_: unknown, row: DataSync) => row.shop?.name || '全部店铺' },
      { title: '数据源', dataIndex: 'source', key: 'source', render: () => <Tag>模拟数据</Tag> },
      { title: '状态', dataIndex: 'status', key: 'status', render: (status: DataSync['status']) => <Tag color={statusLabel[status].color}>{statusLabel[status].text}</Tag> },
      { title: '同步记录', dataIndex: 'recordsSynced', key: 'recordsSynced', render: (count: number) => `${count} 条` },
      { title: '开始时间', dataIndex: 'startedAt', key: 'startedAt', render: (value: string) => new Date(value).toLocaleString('zh-CN') },
      { title: '完成时间', dataIndex: 'completedAt', key: 'completedAt', render: (value: string | null) => value ? new Date(value).toLocaleString('zh-CN') : '—' },
      { title: '操作', key: 'action', render: (_: unknown, row: DataSync) => isAdmin && row.status === 'failed' ? <Button size="small" icon={<ReloadOutlined />} loading={syncing} onClick={() => run(row.id)}>重试</Button> : '—' },
    ]} /></Card>
  </>;
};

export default DataSyncPage;
