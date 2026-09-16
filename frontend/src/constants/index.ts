// API 基础配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const API_PREFIX = '/api/v1';
export const API_TIMEOUT = 30000; // 30秒

// WebSocket 配置
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

// 分页配置
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// 上传配置
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Token 存储 Key
export const TOKEN_KEY = 'ecommerce_access_token';
export const REFRESH_TOKEN_KEY = 'ecommerce_refresh_token';
export const USER_INFO_KEY = 'ecommerce_user_info';

// 路由路径
export const ROUTES = {
  // 公共
  LOGIN: '/login',
  REGISTER: '/register',

  // 系统后台
  SYSTEM: '/system',
  SYSTEM_MERCHANTS: '/system/merchants',
  SYSTEM_SKILLS: '/system/skills',
  SYSTEM_MONITOR: '/system/monitor',

  // 商家后台
  MERCHANT: '/merchant',
  MERCHANT_DASHBOARD: '/merchant/dashboard',
  MERCHANT_MY_SKILLS: '/merchant/my-skills',
  MERCHANT_AGENT_CONTROL: '/merchant/agent-control',
  MERCHANT_DESIGN_STUDIO: '/merchant/design-studio',
  MERCHANT_COMPETITOR: '/merchant/competitor',
  MERCHANT_SHOPS: '/merchant/shops',
};

// 用户角色
export const USER_ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  MERCHANT_ADMIN: 'merchant_admin',
  MERCHANT_USER: 'merchant_user',
} as const;

// 平台类型
export const PLATFORMS = {
  TAOBAO: 'taobao',
  PINDUODUO: 'pinduoduo',
  DOUYIN: 'douyin',
} as const;

export const PLATFORM_LABELS = {
  [PLATFORMS.TAOBAO]: '淘宝',
  [PLATFORMS.PINDUODUO]: '拼多多',
  [PLATFORMS.DOUYIN]: '抖音电商',
};

// 智能体状态
export const AGENT_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
} as const;

// 任务状态
export const TASK_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]: '等待中',
  [TASK_STATUS.RUNNING]: '执行中',
  [TASK_STATUS.COMPLETED]: '已完成',
  [TASK_STATUS.FAILED]: '失败',
  [TASK_STATUS.CANCELLED]: '已取消',
};

export const TASK_STATUS_COLORS = {
  [TASK_STATUS.PENDING]: 'default',
  [TASK_STATUS.RUNNING]: 'processing',
  [TASK_STATUS.COMPLETED]: 'success',
  [TASK_STATUS.FAILED]: 'error',
  [TASK_STATUS.CANCELLED]: 'warning',
} as const;
