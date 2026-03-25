import type { StationInfo, StationStatus } from '@/types/station';

const STORAGE_KEY = 'oraculo_stations';
const HEARTBEAT_TIMEOUT_MS = 15000; // 15 seconds

interface StationHeartbeat {
  id: string;
  lastHeartbeat: string;
  activeSessionId: string | null;
}

export class StationRegistry {
  private static instance: StationRegistry | null = null;

  static getInstance(): StationRegistry {
    if (!StationRegistry.instance) {
      StationRegistry.instance = new StationRegistry();
    }
    return StationRegistry.instance;
  }

  /** Reset singleton (for testing) */
  static resetInstance(): void {
    StationRegistry.instance = null;
  }

  heartbeat(stationId: string, activeSessionId: string | null = null): void {
    const heartbeats = this.loadHeartbeats();
    heartbeats.set(stationId, {
      id: stationId,
      lastHeartbeat: new Date().toISOString(),
      activeSessionId,
    });
    this.saveHeartbeats(heartbeats);
  }

  getStations(): StationInfo[] {
    const heartbeats = this.loadHeartbeats();
    const now = Date.now();
    return Array.from(heartbeats.values()).map(hb => ({
      id: hb.id,
      status: this.computeStatus(hb.lastHeartbeat, now),
      lastHeartbeat: hb.lastHeartbeat,
      activeSessionId: hb.activeSessionId,
    }));
  }

  getStation(stationId: string): StationInfo | null {
    const heartbeats = this.loadHeartbeats();
    const hb = heartbeats.get(stationId);
    if (!hb) return null;
    return {
      id: hb.id,
      status: this.computeStatus(hb.lastHeartbeat, Date.now()),
      lastHeartbeat: hb.lastHeartbeat,
      activeSessionId: hb.activeSessionId,
    };
  }

  private computeStatus(lastHeartbeat: string, now: number): StationStatus {
    const elapsed = now - new Date(lastHeartbeat).getTime();
    return elapsed <= HEARTBEAT_TIMEOUT_MS ? 'online' : 'offline';
  }

  private loadHeartbeats(): Map<string, StationHeartbeat> {
    const map = new Map<string, StationHeartbeat>();
    if (typeof window === 'undefined') return map;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const entries: StationHeartbeat[] = JSON.parse(raw);
        entries.forEach(hb => map.set(hb.id, hb));
      }
    } catch { /* ignore */ }
    return map;
  }

  private saveHeartbeats(heartbeats: Map<string, StationHeartbeat>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(heartbeats.values())));
    } catch { /* ignore */ }
  }
}
