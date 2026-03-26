'use client';

import { useState } from 'react';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

export interface DebugPanelProps {
  ttsComplete: boolean;
  micShouldActivate: boolean;
  voiceLifecyclePhase: string;
  isRecording: boolean;
  currentState: string;
  attemptCount: number;
}

export default function DebugPanel(props: DebugPanelProps) {
  const [visible, setVisible] = useState(false);

  useKeyboardShortcut('D', () => setVisible((prev) => !prev), { ctrl: true, shift: true });

  if (!visible) return null;

  const boolRow = (label: string, value: boolean) => (
    <tr key={label}>
      <td className="pr-4 text-gray-400">{label}:</td>
      <td
        className={value ? 'text-green-400' : 'text-red-400'}
        data-testid={`debug-${label}`}
      >
        {String(value)}
      </td>
    </tr>
  );

  return (
    <div
      className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-xl z-[9999] font-mono text-xs pointer-events-auto"
      data-testid="debug-panel"
    >
      <h3 className="font-bold mb-2">Voice Pipeline Debug</h3>
      <table className="border-collapse">
        <tbody>
          {boolRow('ttsComplete', props.ttsComplete)}
          {boolRow('micShouldActivate', props.micShouldActivate)}
          <tr>
            <td className="pr-4 text-gray-400">voiceLifecycle:</td>
            <td className="text-yellow-400" data-testid="debug-voiceLifecycle">
              {props.voiceLifecyclePhase}
            </td>
          </tr>
          {boolRow('isRecording', props.isRecording)}
          <tr>
            <td className="pr-4 text-gray-400">machineState:</td>
            <td className="text-blue-400" data-testid="debug-machineState">
              {props.currentState}
            </td>
          </tr>
          <tr>
            <td className="pr-4 text-gray-400">attemptCount:</td>
            <td className="text-orange-400" data-testid="debug-attemptCount">
              {props.attemptCount}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-gray-500 text-[10px]">Ctrl+Shift+D to hide</p>
    </div>
  );
}
