'use client';

import type { SessionRecord } from '@/types/analytics';

interface SessionMetricsProps {
  sessions: SessionRecord[];
}

export function SessionMetrics({ sessions }: SessionMetricsProps) {
  const completed = sessions.filter(s => s.status === 'completed');
  const totalSessions = sessions.length;
  const completionRate = totalSessions > 0
    ? Math.round((completed.length / totalSessions) * 100)
    : 0;
  const avgDuration = completed.length > 0
    ? Math.round(completed.reduce((sum, s) => sum + s.durationMs, 0) / completed.length / 1000)
    : 0;
  const totalFallbacks = sessions.reduce((sum, s) => sum + s.fallbackCount, 0);
  const activeSessions = sessions.filter(s => s.status === 'active').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <MetricCard label="Active Now" value={activeSessions} color="text-yellow-400" />
      <MetricCard label="Total Sessions" value={totalSessions} color="text-white" />
      <MetricCard label="Completion Rate" value={`${completionRate}%`} color="text-green-400" />
      <MetricCard label="Avg Duration" value={`${avgDuration}s`} color="text-blue-400" />
      <MetricCard label="Total Fallbacks" value={totalFallbacks} color="text-orange-400" />
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
