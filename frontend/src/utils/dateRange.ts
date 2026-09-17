/** 时间区间工具：集中计算快捷区间，供看板、报告复用 */

export interface DateRange {
  startDate: string;
  endDate: string;
}

export type QuickRangeKey =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'last7d'
  | 'last14d'
  | 'last30d'
  | 'last60d';

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

/** 本周周一 */
function startOfWeek(d: Date): Date {
  const r = startOfDay(d);
  const day = r.getDay(); // 0=周日
  const diff = day === 0 ? 6 : day - 1; // 距周一天数
  r.setDate(r.getDate() - diff);
  return r;
}

/** 最近 N 天（含今天） */
function lastNDays(n: number): DateRange {
  const end = startOfDay(new Date());
  const start = new Date(end);
  start.setDate(start.getDate() - (n - 1));
  return { startDate: fmt(start), endDate: fmt(end) };
}

export function resolveQuickRange(key: QuickRangeKey): DateRange {
  const today = startOfDay(new Date());

  switch (key) {
    case 'today':
      return { startDate: fmt(today), endDate: fmt(today) };
    case 'yesterday': {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      return { startDate: fmt(d), endDate: fmt(d) };
    }
    case 'thisWeek':
      return { startDate: fmt(startOfWeek(today)), endDate: fmt(today) };
    case 'lastWeek': {
      const thisMonday = startOfWeek(today);
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(lastMonday.getDate() - 7);
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastSunday.getDate() + 6);
      return { startDate: fmt(lastMonday), endDate: fmt(lastSunday) };
    }
    case 'thisMonth': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: fmt(start), endDate: fmt(today) };
    }
    case 'lastMonth': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0); // 上月最后一天
      return { startDate: fmt(start), endDate: fmt(end) };
    }
    case 'last14d':
      return lastNDays(14);
    case 'last30d':
      return lastNDays(30);
    case 'last60d':
      return lastNDays(60);
    case 'last7d':
    default:
      return lastNDays(7);
  }
}
