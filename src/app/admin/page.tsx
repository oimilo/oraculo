'use client';

import { useState, useEffect } from 'react';
import { createAnalyticsService } from '@/services/analytics';
import { StationRegistry } from '@/services/station';
import type { SessionRecord } from '@/types/analytics';
import type { StationInfo } from '@/types/station';
import { StationCard } from './components/StationCard';
import { SessionMetrics } from './components/SessionMetrics';
import { PathDistribution } from './components/PathDistribution';

const REFRESH_INTERVAL_MS = 5000;

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [stations, setStations] = useState<StationInfo[]>([]);

  useEffect(() => {
    const analytics = createAnalyticsService();
    const registry = StationRegistry.getInstance();

    function refresh() {
      setSessions(analytics.getSessions());
      setStations(registry.getStations());
    }

    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">O Oraculo - Admin</h1>
        <p className="text-gray-400 mt-1">Real-time station monitoring and session analytics</p>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-300">Session Overview</h2>
        <SessionMetrics sessions={sessions} />
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-300">Stations</h2>
        {stations.length === 0 ? (
          <p className="text-gray-500">No stations registered yet. Start an experience at /?station=station-1</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stations.map(station => (
              <StationCard
                key={station.id}
                station={station}
                sessions={sessions.filter(s => s.stationId === station.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-300">Visitor Choices</h2>
        <PathDistribution sessions={sessions} />
      </section>

      <footer className="text-center text-gray-600 text-xs mt-16">
        Auto-refreshes every {REFRESH_INTERVAL_MS / 1000}s | Data stored locally (localStorage)
      </footer>
    </div>
  );
}
