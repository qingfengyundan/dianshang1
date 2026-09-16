// ========== 用户相关类型 ==========

export interface User {
  id: number;
  tenantId?: number;
  username: string;
  role: UserRole;
  permissions?: Record<string, any>;
  createdAt: string;
}

export type UserRole = 'system_admin' | 'merchant_admin' | 'merchant_user';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ========== 租户相关类型 ==========

export interface Tenant {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  status: TenantStatus;
  planType?: string;
  planExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type TenantStatus = 'active' | 'suspended' | 'deleted';

// ========== 店铺相关类型 ==========

export interface Shop {
  id: number;
  tenantId: number;
  name: string;
  platform: Platform;
  shopUrl: string;
  status: string;
  lastSyncAt?: string;
  createdAt: string;
}

export type Platform = 'taobao' | 'pinduoduo' | 'douyin';

// ========== Skill 相关类型 ==========

export interface SystemSkill {
  id: number;
  name: string;
  slug: string;
  category?: string;
  subCategory?: string;
  description?: string;
  content: string; // YAML 格式
  version?: string;
  status: SkillStatus;
  platforms?: Platform[];
  usageCount: number;
  downloadCount: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantSkill {
  id: number;
  tenantId: number;
  name: string;
  baseSkillId?: number;
  sourceVersion?: string;
  content: string;
  isCustomized: boolean;
  status: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export type SkillStatus = 'draft' | 'published' | 'archived';

// ========== 数据分析相关类型 ==========

export interface Metric {
  id: number;
  tenantId: number;
  shopId: number;
  date: string;
  gmv?: number;
  orders?: number;
  uv?: number;
  pv?: number;
  conversionRate?: number;
  cartRate?: number;
  favoriteRate?: number;
  rawData?: Record<string, any>;
  createdAt: string;
}

export interface AiAnalysis {
  id: number;
  tenantId: number;
  shopId?: number;
  analysisDate: string;
  insights?: Record<string, any>;
  suggestions?: AiSuggestion[];
  priority?: string;
  status?: string;
  createdAt: string;
}

export interface AiSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions?: string[];
  estimatedImpact?: string;
}

// ========== 智能体相关类型 ==========

export interface AgentTask {
  id: number;
  tenantId: number;
  taskType: string;
  agentId?: string;
  skillId?: number;
  skillType?: 'system' | 'merchant';
  params?: Record<string, any>;
  status: TaskStatus;
  result?: Record<string, any>;
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface AgentInfo {
  id: string;
  name: string;
  type: 'codex' | 'workbuddy';
  status: AgentStatus;
  currentTask?: string;
  taskCount: number;
}

export type AgentStatus = 'online' | 'offline' | 'busy';

// ========== 竞品相关类型 ==========

export interface Competitor {
  id: number;
  tenantId: number;
  myProductId?: number;
  competitorName: string;
  competitorUrl: string;
  platform: Platform;
  monitoredMetrics?: string[];
  status: string;
  createdAt: string;
}

export interface CompetitorSnapshot {
  id: number;
  competitorId: number;
  snapshotTime: string;
  price?: number;
  salesVolume?: number;
  rating?: number;
  reviewCount?: number;
  title?: string;
  rawData?: Record<string, any>;
}

// ========== 通用类型 ==========

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}
