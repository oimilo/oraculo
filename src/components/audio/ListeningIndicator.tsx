'use client';

export interface ListeningIndicatorProps {
  isListening: boolean;
}

export default function ListeningIndicator({ isListening }: ListeningIndicatorProps) {
  if (!isListening) return null;

  const bars = [
    { height: 12, delay: '0ms', duration: '1.2s' },
    { height: 18, delay: '150ms', duration: '1.0s' },
    { height: 24, delay: '50ms', duration: '1.1s' },
    { height: 18, delay: '250ms', duration: '0.9s' },
    { height: 12, delay: '100ms', duration: '1.3s' },
  ];

  return (
    <div
      data-testid="listening-indicator"
      className="flex items-center justify-center gap-[3px]"
      aria-label="Ouvindo"
      role="status"
    >
      {bars.map((bar, i) => (
        <span
          key={i}
          className="inline-block w-[2px] rounded-full"
          style={{
            height: `${bar.height}px`,
            background: 'rgba(255, 255, 255, 0.45)',
            animation: `listening-bar ${bar.duration} ease-in-out ${bar.delay} infinite`,
            transformOrigin: 'center',
          }}
        />
      ))}
    </div>
  );
}
