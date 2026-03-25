'use client';

export interface ListeningIndicatorProps {
  isListening: boolean;
}

export default function ListeningIndicator({ isListening }: ListeningIndicatorProps) {
  if (!isListening) return null;

  return (
    <div
      data-testid="listening-indicator"
      className="flex items-center justify-center gap-1"
      aria-label="Ouvindo"
      role="status"
    >
      {/* Five pulsing bars that animate at different delays — visual "sound wave" effect */}
      <span
        className="inline-block w-1 bg-white/70 rounded-full animate-pulse"
        style={{ height: '16px', animationDelay: '0ms', animationDuration: '1s' }}
      />
      <span
        className="inline-block w-1 bg-white/70 rounded-full animate-pulse"
        style={{ height: '24px', animationDelay: '200ms', animationDuration: '1s' }}
      />
      <span
        className="inline-block w-1 bg-white/70 rounded-full animate-pulse"
        style={{ height: '32px', animationDelay: '100ms', animationDuration: '1s' }}
      />
      <span
        className="inline-block w-1 bg-white/70 rounded-full animate-pulse"
        style={{ height: '24px', animationDelay: '300ms', animationDuration: '1s' }}
      />
      <span
        className="inline-block w-1 bg-white/70 rounded-full animate-pulse"
        style={{ height: '16px', animationDelay: '150ms', animationDuration: '1s' }}
      />
    </div>
  );
}
