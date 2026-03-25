import { useRef, useCallback, useEffect } from 'react';
import { createAnalyticsService, type AnalyticsService } from '@/services/analytics';
import type { SessionEndData } from '@/types/analytics';
import type { ExperiencePath, Choice1, Choice2 } from '@/types';

/** Derive ExperiencePath from choices (null if incomplete) */
function derivePath(choice1: Choice1, choice2: Choice2): ExperiencePath | null {
  if (choice1 === 'A' && choice2 === 'FICAR') return 'A_FICAR';
  if (choice1 === 'A' && choice2 === 'EMBORA') return 'A_EMBORA';
  if (choice1 === 'B' && choice2 === 'PISAR') return 'B_PISAR';
  if (choice1 === 'B' && choice2 === 'CONTORNAR') return 'B_CONTORNAR';
  return null;
}

const STATION_ID = typeof window !== 'undefined'
  ? (new URLSearchParams(window.location.search).get('station') || 'station-1')
  : 'station-1';

export function useSessionAnalytics() {
  const serviceRef = useRef<AnalyticsService | null>(null);
  const activeSessionRef = useRef<string | null>(null);

  // Lazy-init service
  const getService = useCallback((): AnalyticsService => {
    if (!serviceRef.current) {
      serviceRef.current = createAnalyticsService();
    }
    return serviceRef.current;
  }, []);

  const startSession = useCallback((sessionId: string) => {
    const svc = getService();
    svc.startSession({ sessionId, stationId: STATION_ID });
    activeSessionRef.current = sessionId;
  }, [getService]);

  const endSession = useCallback((
    sessionId: string,
    choice1: Choice1,
    choice2: Choice2,
    fallbackCount: number,
    completed: boolean,
  ) => {
    const svc = getService();
    const path = derivePath(choice1, choice2);
    svc.endSession({
      sessionId,
      path,
      fallbackCount,
      status: completed ? 'completed' : 'abandoned',
    });
    activeSessionRef.current = null;
  }, [getService]);

  const recordFallback = useCallback((sessionId: string) => {
    getService().recordFallback(sessionId);
  }, [getService]);

  // Cleanup: if component unmounts with active session, mark as abandoned
  useEffect(() => {
    return () => {
      if (activeSessionRef.current) {
        getService().endSession({
          sessionId: activeSessionRef.current,
          path: null,
          fallbackCount: 0,
          status: 'abandoned',
        });
      }
    };
  }, [getService]);

  return { startSession, endSession, recordFallback, stationId: STATION_ID };
}
