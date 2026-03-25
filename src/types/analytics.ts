import type { ExperiencePath } from '@/types';

/** Status of a session */
export type SessionStatus = 'active' | 'completed' | 'abandoned' | 'timeout';

/**
 * Anonymous session record -- ANA-02 compliance.
 * NEVER add: audio blobs, transcript text, visitor names/IDs,
 * IP addresses, or any personally identifiable information.
 */
export interface SessionRecord {
  /** Unique session ID (UUID, not tied to any visitor identity) */
  id: string;
  /** Station identifier (e.g., "station-1", "station-2") */
  stationId: string;
  /** Path taken through the experience (null if not completed past Inferno) */
  path: ExperiencePath | null;
  /** Session duration in milliseconds */
  durationMs: number;
  /** Number of times fallback TTS was used */
  fallbackCount: number;
  /** Whether the session completed the full experience */
  status: SessionStatus;
  /** ISO timestamp when session started */
  startedAt: string;
  /** ISO timestamp when session ended (null if still active) */
  endedAt: string | null;
}

/** Data needed to start a session */
export interface SessionStartData {
  sessionId: string;
  stationId: string;
}

/** Data needed to end a session */
export interface SessionEndData {
  sessionId: string;
  path: ExperiencePath | null;
  fallbackCount: number;
  status: SessionStatus;
}
