'use client';
import { useState, useEffect } from 'react';

interface ChoiceButtonsProps {
  options: Array<{ label: string; event: string }>;
  onChoice: (eventType: string) => void;
  timeoutSeconds: number;
}

export default function ChoiceButtons({ options, onChoice, timeoutSeconds }: ChoiceButtonsProps) {
  const [remaining, setRemaining] = useState(timeoutSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 z-40">
      <div className="flex gap-8">
        {options.map((option) => (
          <button key={option.event} onClick={() => onChoice(option.event)}
            className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-10 py-5 rounded-full text-lg font-light transition-all duration-300 hover:scale-105">
            {option.label}
          </button>
        ))}
      </div>
      <p className="text-white/40 text-sm">{remaining}s</p>
    </div>
  );
}
