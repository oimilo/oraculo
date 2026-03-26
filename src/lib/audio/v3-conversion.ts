import type { SpeechSegment } from '@/types';

/**
 * Convert pauseAfter milliseconds to a v3 audio tag string.
 * Thresholds based on research (ARCHITECTURE.md):
 *   < 500ms  -> '' (no tag -- natural speech gap)
 *   500-1500ms -> '[pause]'
 *   > 1500ms -> '[long pause]'
 */
export function convertPauseToTag(pauseMs: number): string {
  if (pauseMs < 500) return '';
  if (pauseMs <= 1500) return '[pause]';
  return '[long pause]';
}

/**
 * Convert SpeechSegment[] to v3 text with audio tags.
 * - Prepends inflection tags (e.g. [thoughtful]) before segment text
 * - Appends pause tag after segment text (except last segment)
 * - Replaces SSML break-tag approach used in v2
 */
export function buildV3Text(segments: SpeechSegment[]): string {
  let fullText = '';
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];

    // Prepend inflection tags
    if (seg.inflection && seg.inflection.length > 0) {
      fullText += seg.inflection.map(t => `[${t}]`).join('');
    }

    fullText += seg.text;

    // Add pause tag after segment (not on last segment)
    if (seg.pauseAfter && i < segments.length - 1) {
      const pauseTag = convertPauseToTag(seg.pauseAfter);
      if (pauseTag) {
        fullText += ` ${pauseTag} `;
      } else {
        fullText += ' ';
      }
    } else if (i < segments.length - 1) {
      fullText += ' ';
    }
  }
  return fullText;
}
