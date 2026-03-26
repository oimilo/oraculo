import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import DebugPanel from '../DebugPanel';
import type { DebugPanelProps } from '../DebugPanel';

describe('DebugPanel', () => {
  const defaultProps: DebugPanelProps = {
    ttsComplete: false,
    micShouldActivate: false,
    voiceLifecyclePhase: 'idle',
    isRecording: false,
    currentState: 'IDLE',
    attemptCount: 0,
  };

  beforeEach(() => {
    // Clear any previous renders
  });

  it('does not render any visible content when shortcut has not been pressed', () => {
    render(<DebugPanel {...defaultProps} />);

    const panel = screen.queryByTestId('debug-panel');
    expect(panel).toBeNull();
  });

  it('renders panel with "Voice Pipeline Debug" heading after Ctrl+Shift+D keydown', () => {
    render(<DebugPanel {...defaultProps} />);

    // Fire the keyboard shortcut
    fireEvent.keyDown(window, {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    const panel = screen.getByTestId('debug-panel');
    expect(panel).toBeInTheDocument();
    expect(screen.getByText('Voice Pipeline Debug')).toBeInTheDocument();
  });

  it('displays ttsComplete value as "true" or "false" text', () => {
    render(<DebugPanel {...defaultProps} ttsComplete={false} />);

    fireEvent.keyDown(window, {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    const ttsCompleteElement = screen.getByTestId('debug-ttsComplete');
    expect(ttsCompleteElement).toHaveTextContent('false');

    // Rerender with true
    const { rerender } = render(<DebugPanel {...defaultProps} ttsComplete={true} />);

    fireEvent.keyDown(window, {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    const ttsCompleteElementUpdated = screen.getByTestId('debug-ttsComplete');
    expect(ttsCompleteElementUpdated).toHaveTextContent('true');
  });

  it('displays micShouldActivate value as "true" or "false" text', () => {
    render(<DebugPanel {...defaultProps} micShouldActivate={true} />);

    fireEvent.keyDown(window, {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    const micElement = screen.getByTestId('debug-micShouldActivate');
    expect(micElement).toHaveTextContent('true');
  });

  it('displays voiceLifecyclePhase value', () => {
    render(<DebugPanel {...defaultProps} voiceLifecyclePhase="listening" />);

    fireEvent.keyDown(window, {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    const lifecycleElement = screen.getByTestId('debug-voiceLifecycle');
    expect(lifecycleElement).toHaveTextContent('listening');
  });

  it('displays isRecording value as "true" or "false" text', () => {
    render(<DebugPanel {...defaultProps} isRecording={true} />);

    fireEvent.keyDown(window, {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    const recordingElement = screen.getByTestId('debug-isRecording');
    expect(recordingElement).toHaveTextContent('true');
  });

  it('pressing Ctrl+Shift+D again hides the panel', () => {
    render(<DebugPanel {...defaultProps} />);

    // Show panel
    fireEvent.keyDown(window, {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    expect(screen.getByTestId('debug-panel')).toBeInTheDocument();

    // Hide panel
    fireEvent.keyDown(window, {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    expect(screen.queryByTestId('debug-panel')).toBeNull();
  });

  it('boolean true values get green color class (text-green-400)', () => {
    render(<DebugPanel {...defaultProps} ttsComplete={true} micShouldActivate={true} />);

    fireEvent.keyDown(window, {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    const ttsElement = screen.getByTestId('debug-ttsComplete');
    const micElement = screen.getByTestId('debug-micShouldActivate');

    expect(ttsElement).toHaveClass('text-green-400');
    expect(micElement).toHaveClass('text-green-400');
  });

  it('boolean false values get red color class (text-red-400)', () => {
    render(<DebugPanel {...defaultProps} ttsComplete={false} micShouldActivate={false} />);

    fireEvent.keyDown(window, {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    const ttsElement = screen.getByTestId('debug-ttsComplete');
    const micElement = screen.getByTestId('debug-micShouldActivate');

    expect(ttsElement).toHaveClass('text-red-400');
    expect(micElement).toHaveClass('text-red-400');
  });

  it('shows current XState state value string', () => {
    render(<DebugPanel {...defaultProps} currentState="AGUARDANDO_INFERNO" />);

    fireEvent.keyDown(window, {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    const stateElement = screen.getByTestId('debug-machineState');
    expect(stateElement).toHaveTextContent('AGUARDANDO_INFERNO');
  });

  it('shows attempt count number', () => {
    render(<DebugPanel {...defaultProps} attemptCount={2} />);

    fireEvent.keyDown(window, {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    const attemptElement = screen.getByTestId('debug-attemptCount');
    expect(attemptElement).toHaveTextContent('2');
  });
});
