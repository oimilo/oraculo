'use client';

import type { StationInfo } from '@/types/station';
import type { SessionRecord } from '@/types/analytics';

interface StationCardProps {
  station: StationInfo;
  sessions: SessionRecord[];
}

export function StationCard({ station, sessions }: StationCardProps) {
  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{station.id}</h3>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            station.status === 'online'
              ? 'bg-green-900/50 text-green-400 border border-green-700'
              : 'bg-red-900/50 text-red-400 border border-red-700'
          }`}
          data-testid={`station-status-${station.id}`}
        >
          <span className={`w-2 h-2 rounded-full ${
            station.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`} />
          {station.status === 'online' ? 'Online' : 'Offline'}
        </span>
      </div>
      <div className="space-y-2 text-sm text-gray-400">
        <p>Active sessions: <span className="text-white">{activeSessions.length}</span></p>
        <p>Completed today: <span className="text-white">{completedSessions.length}</span></p>
        {station.activeSessionId && (
          <p>Current session: <span className="text-yellow-400 font-mono text-xs">{station.activeSessionId.slice(0, 8)}...</span></p>
        )}
        <p className="text-xs text-gray-500">
          Last heartbeat: {new Date(station.lastHeartbeat).toLocaleTimeString('pt-BR')}
        </p>
      </div>
    </div>
  );
}
