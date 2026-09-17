import apiClient from './api';

const AI_REQUEST_TIMEOUT = 120_000;

export interface AiInsight {
  title: string;
  description: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  category: 'trend' | 'anomaly' | 'opportunity' | 'warning';
}

export interface AiInsightsResponse {
  success: boolean;
  data: AiInsight[];
  meta: {
    days: number;
    generatedAt: string;
  };
}

export interface GenerateReportRequest {
  type: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}

export interface GenerateReportResponse {
  success: boolean;
  data: {
    report: string;
    type: string;
    dateRange: {
      startDate: string;
      endDate: string;
    };
  };
}

export interface ChatResponse {
  success: boolean;
  data: {
    question: string;
    answer: string;
    context: {
      days: number;
    };
  };
}

/** 从 axios 错误中提取后端返回的中文提示 */
function toMessage(error: any, fallback: string): Error {
  if (error?.code === 'ECONNABORTED') {
    return new Error('AI 分析响应较慢，请稍后重试');
  }
  const detail = error?.response?.data?.message;
  return new Error(Array.isArray(detail) ? detail.join('；') : detail || fallback);
}

class AiService {
  /** 获取 AI 数据洞察 */
  async getInsights(opts: { days?: number; startDate?: string; endDate?: string } = {}): Promise<AiInsight[]> {
    try {
      const res = await apiClient.get<never, AiInsightsResponse>('/ai/insights', {
        params: opts,
        timeout: AI_REQUEST_TIMEOUT,
      });
      return res.data;
    } catch (error) {
      throw toMessage(error, '获取 AI 洞察失败');
    }
  }

  /** 生成智能报告 */
  async generateReport(request: GenerateReportRequest): Promise<string> {
    try {
      const res = await apiClient.post<never, GenerateReportResponse>('/ai/report', request, {
        timeout: AI_REQUEST_TIMEOUT,
      });
      return res.data.report;
    } catch (error) {
      throw toMessage(error, '生成报告失败');
    }
  }

  /** AI 对话查询 */
  async chat(question: string, days: number = 7): Promise<string> {
    try {
      const res = await apiClient.post<never, ChatResponse>('/ai/chat', { question, days }, {
        timeout: AI_REQUEST_TIMEOUT,
      });
      return res.data.answer;
    } catch (error) {
      throw toMessage(error, 'AI 对话失败');
    }
  }
}

export const aiService = new AiService();
