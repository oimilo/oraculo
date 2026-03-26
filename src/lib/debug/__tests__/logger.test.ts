import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger } from '../logger';

describe('createLogger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('creates logger with log and error methods', () => {
    const logger = createLogger('TTS');

    expect(logger).toBeDefined();
    expect(logger.log).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(typeof logger.log).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('logger.log calls console.log with timestamp and namespace prefix', () => {
    const logger = createLogger('TTS');

    logger.log('test message');

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const firstArg = consoleLogSpy.mock.calls[0][0];
    expect(firstArg).toMatch(/^\[\d+\.\d+ms\] \[TTS\] test message$/);
  });

  it('logger.error calls console.error with timestamp and namespace prefix', () => {
    const logger = createLogger('STT');

    logger.error('error message');

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const firstArg = consoleErrorSpy.mock.calls[0][0];
    expect(firstArg).toMatch(/^\[\d+\.\d+ms\] \[STT\] error message$/);
  });

  it('logger.log passes extra arguments after formatted string', () => {
    const logger = createLogger('TEST');
    const extraData = { foo: 'bar', count: 42 };

    logger.log('message with data', extraData);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy.mock.calls[0][0]).toMatch(/^\[\d+\.\d+ms\] \[TEST\] message with data$/);
    expect(consoleLogSpy.mock.calls[0][1]).toBe(extraData);
  });

  it('loggers with different namespaces produce different prefixes', () => {
    const ttsLogger = createLogger('TTS');
    const sttLogger = createLogger('STT');

    ttsLogger.log('from tts');
    sttLogger.log('from stt');

    expect(consoleLogSpy).toHaveBeenCalledTimes(2);

    const firstCall = consoleLogSpy.mock.calls[0][0];
    const secondCall = consoleLogSpy.mock.calls[1][0];

    expect(firstCall).toMatch(/\[TTS\] from tts$/);
    expect(secondCall).toMatch(/\[STT\] from stt$/);
    expect(firstCall).not.toContain('[STT]');
    expect(secondCall).not.toContain('[TTS]');
  });
});
