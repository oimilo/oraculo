import type { AnalyticsService } from './index';
import type { SessionRecord, SessionStartData, SessionEndData } from '@/types/analytics';

const STORAGE_KEY = 'oraculo_analytics';

export class MockAnalyticsService implements AnalyticsService {
  private sessions: Map<string, SessionRecord> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  startSession(data: SessionStartData): void {
    const record: SessionRecord = {
      id: data.sessionId,
      stationId: data.stationId,
      path: null,
      durationMs: 0,
      fallbackCount: 0,
      status: 'active',
      startedAt: new Date().toISOString(),
      endedAt: null,
    };
    this.sessions.set(data.sessionId, record);
    this.saveToStorage();
  }

  endSession(data: SessionEndData): void {
    const session = this.sessions.get(data.sessionId);
    if (!session) return;
    const now = new Date();
    session.path = data.path;
    session.fallbackCount = data.fallbackCount;
    session.status = data.status;
    session.endedAt = now.toISOString();
    session.durationMs = now.getTime() - new Date(session.startedAt).getTime();
    this.saveToStorage();
  }

  recordFallback(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.fallbackCount += 1;
    this.saveToStorage();
  }

  getSessions(): SessionRecord[] {
    return Array.from(this.sessions.values());
  }

  getActiveSessions(): SessionRecord[] {
    return this.getSessions().filter(s => s.status === 'active');
  }

  getSessionsByStation(stationId: string): SessionRecord[] {
    return this.getSessions().filter(s => s.stationId === stationId);
  }

  clearOldSessions(maxAgeMs: number): void {
    const cutoff = Date.now() - maxAgeMs;
    for (const [id, session] of this.sessions) {
      if (new Date(session.startedAt).getTime() < cutoff) {
        this.sessions.delete(id);
      }
    }
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const entries: SessionRecord[] = JSON.parse(raw);
        entries.forEach(s => this.sessions.set(s.id, s));
      }
    } catch { /* ignore parse errors */ }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.getSessions()));
    } catch { /* ignore quota errors */ }
  }
}
