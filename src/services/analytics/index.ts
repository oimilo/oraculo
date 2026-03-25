import type { SessionRecord, SessionStartData, SessionEndData } from '@/types/analytics';
import { MockAnalyticsService } from './mock';

export interface AnalyticsService {
  startSession(data: SessionStartData): void;
  endSession(data: SessionEndData): void;
  recordFallback(sessionId: string): void;
  getSessions(): SessionRecord[];
  getActiveSessions(): SessionRecord[];
  getSessionsByStation(stationId: string): SessionRecord[];
  clearOldSessions(maxAgeMs: number): void;
}

export function createAnalyticsService(): AnalyticsService {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_REAL_APIS === 'true') {
    // Real Supabase implementation (future)
    // For now fall through to mock
  }
  return new MockAnalyticsService();
}

export type { SessionRecord, SessionStartData, SessionEndData } from '@/types/analytics';
