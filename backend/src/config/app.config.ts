// ========== 应用配置 ==========
export const appConfig = {
  name: '电商智能运营中台',
  version: '1.0.0',
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// ========== 数据库配置 ==========
export const databaseConfig = {
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'ecommerce_platform',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
};

// ========== Redis 配置 ==========
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: 0,
  keyPrefix: 'ecommerce:',
};

// ========== JWT 配置 ==========
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};

// ========== AI 服务配置 ==========
export const aiConfig = {
  provider: 'claude',
  apiKey: process.env.CLAUDE_API_KEY || '',
  model: process.env.CLAUDE_MODEL || 'claude-sonnet-5',
  maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS || '4096', 10),
  timeout: 30000, // 30秒
  maxRetries: 3,
};

// ========== 智能体配置 ==========
export const agentConfig = {
  codex: {
    host: process.env.CODEX_AGENT_HOST || 'localhost',
    port: parseInt(process.env.CODEX_AGENT_PORT || '52001', 10),
    protocol: 'http',
  },
  workbuddy: {
    host: process.env.WORKBUDDY_AGENT_HOST || 'localhost',
    port: parseInt(process.env.WORKBUDDY_AGENT_PORT || '8080', 10),
    protocol: 'http',
  },
};

// ========== 日志配置 ==========
export const logConfig = {
  level: process.env.LOG_LEVEL || 'info',
  dir: process.env.LOG_DIR || 'logs',
  maxFiles: '14d',
  maxSize: '50m',
};

// ========== 文件上传配置 ==========
export const uploadConfig = {
  dir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};
