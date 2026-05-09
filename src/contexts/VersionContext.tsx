'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ExperienceVersion } from '@/types';

interface VersionContextValue {
  version: ExperienceVersion;
  setVersion: (v: ExperienceVersion) => void;
}

const VersionContext = createContext<VersionContextValue | null>(null);

interface VersionProviderProps {
  children: ReactNode;
  initialVersion?: ExperienceVersion;
}

export function VersionProvider({ children, initialVersion = 'V1' }: VersionProviderProps) {
  const [version, setVersion] = useState<ExperienceVersion>(initialVersion);
  return (
    <VersionContext.Provider value={{ version, setVersion }}>
      {children}
    </VersionContext.Provider>
  );
}

/**
 * Access current experience version (V1 or V2).
 * Must be used within a VersionProvider.
 */
export function useVersion(): VersionContextValue {
  const ctx = useContext(VersionContext);
  if (!ctx) {
    throw new Error('useVersion must be used within a VersionProvider');
  }
  return ctx;
}
