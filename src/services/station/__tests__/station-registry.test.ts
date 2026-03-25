import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { StationRegistry } from '../registry';

describe('StationRegistry', () => {
  let mockStorage: Map<string, string>;

  beforeEach(() => {
    // Mock localStorage with in-memory Map
    mockStorage = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage.get(key) ?? null,
      setItem: (key: string, value: string) => mockStorage.set(key, value),
      removeItem: (key: string) => mockStorage.delete(key),
      clear: () => mockStorage.clear(),
    });

    // Reset singleton between tests
    StationRegistry.resetInstance();

    // Use fake timers for heartbeat expiry tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('Test 1: StationRegistry.heartbeat(stationId) stores current timestamp for station', () => {
    const registry = StationRegistry.getInstance();
    const now = new Date('2026-03-25T10:00:00Z');
    vi.setSystemTime(now);

    registry.heartbeat('station-1');

    const station = registry.getStation('station-1');
    expect(station).toBeDefined();
    expect(station?.id).toBe('station-1');
    expect(station?.lastHeartbeat).toBe(now.toISOString());
  });

  it('Test 2: StationRegistry.getStations() returns all known stations with status', () => {
    const registry = StationRegistry.getInstance();
    vi.setSystemTime(new Date('2026-03-25T10:00:00Z'));

    registry.heartbeat('station-1');
    registry.heartbeat('station-2');

    const stations = registry.getStations();
    expect(stations).toHaveLength(2);
    expect(stations.map(s => s.id).sort()).toEqual(['station-1', 'station-2']);
    expect(stations[0]).toHaveProperty('status');
    expect(stations[0]).toHaveProperty('lastHeartbeat');
    expect(stations[0]).toHaveProperty('activeSessionId');
  });

  it('Test 3: Station with heartbeat within last 15 seconds has status "online"', () => {
    const registry = StationRegistry.getInstance();
    const startTime = new Date('2026-03-25T10:00:00Z');
    vi.setSystemTime(startTime);

    registry.heartbeat('station-1');

    // Advance time by 10 seconds (within 15s threshold)
    vi.setSystemTime(new Date('2026-03-25T10:00:10Z'));

    const station = registry.getStation('station-1');
    expect(station?.status).toBe('online');
  });

  it('Test 4: Station with heartbeat older than 15 seconds has status "offline"', () => {
    const registry = StationRegistry.getInstance();
    const startTime = new Date('2026-03-25T10:00:00Z');
    vi.setSystemTime(startTime);

    registry.heartbeat('station-1');

    // Advance time by 16 seconds (exceeds 15s threshold)
    vi.setSystemTime(new Date('2026-03-25T10:00:16Z'));

    const station = registry.getStation('station-1');
    expect(station?.status).toBe('offline');
  });

  it('Test 5: Station with no heartbeat has status "offline"', () => {
    const registry = StationRegistry.getInstance();

    const station = registry.getStation('station-unknown');
    expect(station).toBeNull();
  });

  it('Test 6: StationRegistry.heartbeat() persists to localStorage under "oraculo_stations" key', () => {
    const registry = StationRegistry.getInstance();
    vi.setSystemTime(new Date('2026-03-25T10:00:00Z'));

    registry.heartbeat('station-1', 'session-abc');

    const stored = mockStorage.get('oraculo_stations');
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed).toBeInstanceOf(Array);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({
      id: 'station-1',
      lastHeartbeat: '2026-03-25T10:00:00.000Z',
      activeSessionId: 'session-abc',
    });
  });

  it('Test 7: Multiple stations can be tracked independently', () => {
    const registry = StationRegistry.getInstance();
    vi.setSystemTime(new Date('2026-03-25T10:00:00Z'));

    registry.heartbeat('station-1', 'session-a');

    vi.setSystemTime(new Date('2026-03-25T10:00:05Z'));
    registry.heartbeat('station-2', 'session-b');

    vi.setSystemTime(new Date('2026-03-25T10:00:10Z'));
    registry.heartbeat('station-3', null);

    const stations = registry.getStations();
    expect(stations).toHaveLength(3);

    const s1 = stations.find(s => s.id === 'station-1');
    const s2 = stations.find(s => s.id === 'station-2');
    const s3 = stations.find(s => s.id === 'station-3');

    expect(s1?.activeSessionId).toBe('session-a');
    expect(s2?.activeSessionId).toBe('session-b');
    expect(s3?.activeSessionId).toBeNull();
    expect(s1?.lastHeartbeat).toBe('2026-03-25T10:00:00.000Z');
    expect(s2?.lastHeartbeat).toBe('2026-03-25T10:00:05.000Z');
    expect(s3?.lastHeartbeat).toBe('2026-03-25T10:00:10.000Z');
  });
});
