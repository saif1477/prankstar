export interface Report {
  id: string;
  prankSlug: string;
  userId: string;
  reason: 'inappropriate' | 'misleading' | 'harmful' | 'spam' | 'other';
  description: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

const REPORTS_KEY = 'prankstar_reports';

function getReportsDB(): Report[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(REPORTS_KEY);
  if (!stored) return [];
  try { return JSON.parse(stored) as Report[]; } catch { return []; }
}

function saveReportsDB(reports: Report[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export function submitReport(slug: string, userId: string, reason: Report['reason'], description: string): Report {
  const reports = getReportsDB();
  const report: Report = {
    id: `report-${Date.now()}`,
    prankSlug: slug,
    userId,
    reason,
    description,
    timestamp: new Date().toISOString(),
    status: 'pending',
  };
  reports.push(report);
  saveReportsDB(reports);
  return report;
}

export function getPendingReports(): Report[] {
  return getReportsDB().filter(r => r.status === 'pending');
}

export function resolveReport(reportId: string, status: 'reviewed' | 'dismissed'): void {
  const reports = getReportsDB();
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx >= 0) {
    reports[idx].status = status;
    saveReportsDB(reports);
  }
}

export function getAllReports(): Report[] {
  return getReportsDB();
}
