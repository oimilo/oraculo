export type StationStatus = 'online' | 'offline';

export interface StationInfo {
  /** Station identifier (e.g., "station-1") */
  id: string;
  /** Current station status based on heartbeat freshness */
  status: StationStatus;
  /** ISO timestamp of last heartbeat */
  lastHeartbeat: string;
  /** ID of currently active session (null if idle) */
  activeSessionId: string | null;
}
