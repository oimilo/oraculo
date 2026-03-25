'use client';

import type { SessionRecord } from '@/types/analytics';
import type { ExperiencePath } from '@/types';

interface PathDistributionProps {
  sessions: SessionRecord[];
}

const PATH_LABELS: Record<ExperiencePath, string> = {
  A_FICAR: 'Vozes + Ficar',
  A_EMBORA: 'Vozes + Embora',
  B_PISAR: 'Silencio + Pisar',
  B_CONTORNAR: 'Silencio + Contornar',
};

const PATH_COLORS: Record<ExperiencePath, string> = {
  A_FICAR: 'bg-amber-500',
  A_EMBORA: 'bg-red-500',
  B_PISAR: 'bg-blue-500',
  B_CONTORNAR: 'bg-emerald-500',
};

export function PathDistribution({ sessions }: PathDistributionProps) {
  const completedWithPath = sessions.filter(
    (s): s is SessionRecord & { path: ExperiencePath } =>
      s.status === 'completed' && s.path !== null
  );

  const counts: Record<ExperiencePath, number> = {
    A_FICAR: 0, A_EMBORA: 0, B_PISAR: 0, B_CONTORNAR: 0,
  };

  completedWithPath.forEach(s => { counts[s.path] += 1; });

  const total = completedWithPath.length;
  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Path Distribution</h3>
      {total === 0 ? (
        <p className="text-gray-500 text-sm">No completed sessions yet.</p>
      ) : (
        <div className="space-y-3">
          {(Object.entries(counts) as [ExperiencePath, number][]).map(([path, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div key={path}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{PATH_LABELS[path]}</span>
                  <span className="text-gray-400">{count} ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className={`${PATH_COLORS[path]} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
