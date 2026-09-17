import apiClient from './api';

export interface DataSync {
  id: number;
  shopId: number | null;
  status: 'running' | 'success' | 'failed';
  source: string;
  recordsSynced: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  shop: { id: number; name: string; platform: string } | null;
}

const messageOf = (error: any, fallback: string) => new Error(error?.response?.data?.message || fallback);

export const dataSyncService = {
  async list(): Promise<DataSync[]> {
    try { return await apiClient.get<never, DataSync[]>('/data-syncs'); } catch (error) { throw messageOf(error, '获取同步记录失败'); }
  },
  async trigger(shopId?: number): Promise<DataSync> {
    try { return await apiClient.post<never, DataSync>('/data-syncs', shopId ? { shopId } : {}); } catch (error) { throw messageOf(error, '发起同步失败'); }
  },
  async retry(id: number): Promise<DataSync> {
    try { return await apiClient.post<never, DataSync>(`/data-syncs/${id}/retry`); } catch (error) { throw messageOf(error, '重试同步失败'); }
  },
};
