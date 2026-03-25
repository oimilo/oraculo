import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockAnalyticsService } from '../mock';
import type { SessionRecord } from '@/types/analytics';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'window', {
  value: { localStorage: localStorageMock },
  writable: true,
});

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('MockAnalyticsService', () => {
  let service: MockAnalyticsService;

  beforeEach(() => {
    localStorageMock.clear();
    service = new MockAnalyticsService();
  });

  it('Test 1: startSession stores a session with status "active" and returns a session ID', () => {
    service.startSession({ sessionId: 'session-1', stationId: 'station-1' });
    const sessions = service.getSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe('session-1');
    expect(sessions[0].status).toBe('active');
    expect(sessions[0].stationId).toBe('station-1');
  });

  it('Test 2: endSession updates status to "completed" and records duration', () => {
    service.startSession({ sessionId: 'session-2', stationId: 'station-1' });
    service.endSession({
      sessionId: 'session-2',
      path: 'A_FICAR',
      fallbackCount: 0,
      status: 'completed',
    });
    const sessions = service.getSessions();
    expect(sessions[0].status).toBe('completed');
    expect(sessions[0].endedAt).not.toBeNull();
    expect(sessions[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('Test 3: endSession calculates duration from start time', () => {
    const startTime = Date.now();
    service.startSession({ sessionId: 'session-3', stationId: 'station-1' });

    // Wait a bit
    const waitMs = 50;
    const endTime = Date.now() + waitMs;
    vi.useFakeTimers();
    vi.setSystemTime(endTime);

    service.endSession({
      sessionId: 'session-3',
      path: 'B_PISAR',
      fallbackCount: 2,
      status: 'completed',
    });

    const sessions = service.getSessions();
    expect(sessions[0].durationMs).toBeGreaterThanOrEqual(waitMs);

    vi.useRealTimers();
  });

  it('Test 4: recordFallback increments fallbackCount on the session', () => {
    service.startSession({ sessionId: 'session-4', stationId: 'station-1' });
    expect(service.getSessions()[0].fallbackCount).toBe(0);

    service.recordFallback('session-4');
    expect(service.getSessions()[0].fallbackCount).toBe(1);

    service.recordFallback('session-4');
    expect(service.getSessions()[0].fallbackCount).toBe(2);
  });

  it('Test 5: getSessions returns all stored sessions', () => {
    service.startSession({ sessionId: 'session-5a', stationId: 'station-1' });
    service.startSession({ sessionId: 'session-5b', stationId: 'station-2' });
    const sessions = service.getSessions();
    expect(sessions).toHaveLength(2);
    expect(sessions.map(s => s.id)).toContain('session-5a');
    expect(sessions.map(s => s.id)).toContain('session-5b');
  });

  it('Test 6: getActiveSessions returns only sessions with status "active"', () => {
    service.startSession({ sessionId: 'session-6a', stationId: 'station-1' });
    service.startSession({ sessionId: 'session-6b', stationId: 'station-1' });
    service.endSession({
      sessionId: 'session-6a',
      path: 'A_EMBORA',
      fallbackCount: 0,
      status: 'completed',
    });

    const active = service.getActiveSessions();
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe('session-6b');
  });

  it('Test 7: SessionRecord never contains audio blobs, transcripts, or visitor names (ANA-02 compliance)', () => {
    service.startSession({ sessionId: 'session-7', stationId: 'station-1' });
    service.endSession({
      sessionId: 'session-7',
      path: 'B_CONTORNAR',
      fallbackCount: 1,
      status: 'completed',
    });

    const sessions = service.getSessions();
    const record = sessions[0];
    const allowedKeys = ['id', 'stationId', 'path', 'durationMs', 'fallbackCount', 'status', 'startedAt', 'endedAt'];
    const actualKeys = Object.keys(record);

    expect(actualKeys.sort()).toEqual(allowedKeys.sort());
    expect(record).not.toHaveProperty('audio');
    expect(record).not.toHaveProperty('transcript');
    expect(record).not.toHaveProperty('visitorName');
    expect(record).not.toHaveProperty('visitorId');
    expect(record).not.toHaveProperty('ipAddress');
  });

  it('Test 8: MockAnalyticsService persists to localStorage under key "oraculo_analytics"', () => {
    service.startSession({ sessionId: 'session-8', stationId: 'station-1' });

    const stored = localStorageMock.getItem('oraculo_analytics');
    expect(stored).not.toBeNull();

    const parsed: SessionRecord[] = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe('session-8');
  });
});
