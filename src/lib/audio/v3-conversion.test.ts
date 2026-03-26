import { describe, it, expect } from 'vitest';
import { convertPauseToTag, buildV3Text } from './v3-conversion';

describe('convertPauseToTag', () => {
  it('Test 1: returns empty string for 0ms (no tag)', () => {
    expect(convertPauseToTag(0)).toBe('');
  });

  it('Test 2: returns empty string for 400ms (below 500ms threshold)', () => {
    expect(convertPauseToTag(400)).toBe('');
  });

  it('Test 3: returns [pause] for 500ms (lower boundary)', () => {
    expect(convertPauseToTag(500)).toBe('[pause]');
  });

  it('Test 4: returns [pause] for 800ms (mid-range short pause)', () => {
    expect(convertPauseToTag(800)).toBe('[pause]');
  });

  it('Test 5: returns [pause] for 1500ms (upper boundary of short pause)', () => {
    expect(convertPauseToTag(1500)).toBe('[pause]');
  });

  it('Test 6: returns [long pause] for 1501ms (above 1500ms threshold)', () => {
    expect(convertPauseToTag(1501)).toBe('[long pause]');
  });

  it('Test 7: returns [long pause] for 2100ms (standard script pause)', () => {
    expect(convertPauseToTag(2100)).toBe('[long pause]');
  });

  it('Test 8: returns [long pause] for 4100ms (longest pause in script)', () => {
    expect(convertPauseToTag(4100)).toBe('[long pause]');
  });
});

describe('buildV3Text', () => {
  it('Test 9: single segment without pause or inflection returns plain text', () => {
    expect(buildV3Text([{ text: 'Hello' }])).toBe('Hello');
  });

  it('Test 10: two segments with long pause between them', () => {
    expect(buildV3Text([
      { text: 'A', pauseAfter: 2100 },
      { text: 'B' },
    ])).toBe('A [long pause] B');
  });

  it('Test 11: two segments with short pause between them', () => {
    expect(buildV3Text([
      { text: 'A', pauseAfter: 800 },
      { text: 'B' },
    ])).toBe('A [pause] B');
  });

  it('Test 12: trailing pause on last segment is ignored', () => {
    expect(buildV3Text([
      { text: 'Last', pauseAfter: 2100 },
    ])).toBe('Last');
  });

  it('Test 13: single inflection tag prepended to text', () => {
    expect(buildV3Text([
      { text: 'X', inflection: ['thoughtful'] },
      { text: 'Y' },
    ])).toBe('[thoughtful]X Y');
  });

  it('Test 14: multiple inflection tags prepended to text', () => {
    expect(buildV3Text([
      { text: 'X', inflection: ['whispers', 'sad'] },
    ])).toBe('[whispers][sad]X');
  });

  it('Test 15: mixed inflection + pause produces correct ordering', () => {
    expect(buildV3Text([
      { text: 'A', inflection: ['determined'], pauseAfter: 2100 },
      { text: 'B' },
    ])).toBe('[determined]A [long pause] B');
  });

  it('Test 16: SpeechSegment with no inflection field is backward compatible', () => {
    const segments = [
      { text: 'First', pauseAfter: 1600 },
      { text: 'Second' },
    ];
    expect(buildV3Text(segments)).toBe('First [long pause] Second');
  });

  it('Test 17: empty array returns empty string', () => {
    expect(buildV3Text([])).toBe('');
  });

  it('Test 18: segment with empty inflection array has no tags', () => {
    expect(buildV3Text([
      { text: 'Plain', inflection: [] },
    ])).toBe('Plain');
  });

  it('Test 19: sub-threshold pause between segments gives space only', () => {
    expect(buildV3Text([
      { text: 'A', pauseAfter: 200 },
      { text: 'B' },
    ])).toBe('A B');
  });

  it('Test 20: three segments with varied pauses and inflections', () => {
    expect(buildV3Text([
      { text: 'Start', inflection: ['whispers'], pauseAfter: 2100 },
      { text: 'Middle', pauseAfter: 800 },
      { text: 'End', inflection: ['sad'] },
    ])).toBe('[whispers]Start [long pause] Middle [pause] [sad]End');
  });
});
