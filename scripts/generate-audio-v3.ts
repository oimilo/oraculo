/**
 * Generate pre-recorded audio files via ElevenLabs TTS API (v3).
 *
 * Usage: npx tsx scripts/generate-audio-v3.ts
 *        npx tsx scripts/generate-audio-v3.ts --clean   (delete old v2 files first)
 *        npx tsx scripts/generate-audio-v3.ts --dry-run  (show what would be generated)
 *
 * Reads ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID from .env.local
 * Outputs MP3 files to public/audio/prerecorded/
 *
 * Imports SCRIPT directly from src/data/script.ts — always in sync.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SCRIPT } from '@/data/script';
import type { SpeechSegment } from '@/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT_DIR = resolve(ROOT, 'public/audio/prerecorded');

// --- Load .env.local ---
function loadEnv() {
  const envPath = resolve(ROOT, '.env.local');
  if (!existsSync(envPath)) {
    console.error('ERROR: .env.local not found.');
    process.exit(1);
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
}

loadEnv();

const API_KEY = process.env.ELEVENLABS_API_KEY!;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID!;

if (!API_KEY || !VOICE_ID) {
  console.error('ERROR: ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID must be set in .env.local');
  process.exit(1);
}

// --- Voice settings per narrative phase ---
const PHASE_VOICE: Record<string, { stability: number; similarity_boost: number; style: number }> = {
  APRESENTACAO:  { stability: 0.50, similarity_boost: 0.75, style: 0.35 },
  INFERNO:       { stability: 0.65, similarity_boost: 0.80, style: 0.40 },
  PURGATORIO:    { stability: 0.45, similarity_boost: 0.75, style: 0.30 },
  PARAISO:       { stability: 0.40, similarity_boost: 0.70, style: 0.25 },
  DEVOLUCAO:     { stability: 0.50, similarity_boost: 0.75, style: 0.30 },
  ENCERRAMENTO:  { stability: 0.55, similarity_boost: 0.75, style: 0.35 },
  FALLBACK:      { stability: 0.70, similarity_boost: 0.80, style: 0.40 },
  TIMEOUT:       { stability: 0.70, similarity_boost: 0.80, style: 0.40 },
};

function getPhaseForKey(key: string): string {
  if (key.startsWith('FALLBACK')) return 'FALLBACK';
  if (key.startsWith('TIMEOUT')) return 'TIMEOUT';
  if (key.startsWith('DEVOLUCAO')) return 'DEVOLUCAO';
  if (key.startsWith('ENCERRAMENTO')) return 'ENCERRAMENTO';
  if (key.startsWith('PARAISO')) return 'PARAISO';
  if (key.startsWith('PURGATORIO')) return 'PURGATORIO';
  if (key.startsWith('INFERNO')) return 'INFERNO';
  return 'APRESENTACAO';
}

// --- v3 audio tag conversion ---
// Thresholds from src/lib/audio/v3-conversion.ts:
//   < 500ms  -> '' (no tag)
//   500-1500ms -> '[pause]'
//   > 1500ms -> '[long pause]'
function convertPauseToTag(pauseMs: number): string {
  if (pauseMs < 500) return '';
  if (pauseMs <= 1500) return '[pause]';
  return '[long pause]';
}

function buildV3Text(segments: SpeechSegment[]): string {
  let fullText = '';
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    // Inflection tags go before the text
    if (seg.inflection && seg.inflection.length > 0) {
      fullText += seg.inflection.map(t => `[${t}]`).join('');
    }
    fullText += seg.text;
    // Pause tags go between segments
    if (seg.pauseAfter && i < segments.length - 1) {
      const pauseTag = convertPauseToTag(seg.pauseAfter);
      fullText += pauseTag ? ` ${pauseTag} ` : ' ';
    } else if (i < segments.length - 1) {
      fullText += ' ';
    }
  }
  return fullText;
}

// --- Call ElevenLabs API ---
async function generateAudio(key: string, text: string, voiceSettings: { stability: number; similarity_boost: number; style: number }): Promise<Buffer> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_192`;

  const body = {
    text,
    model_id: 'eleven_v3',
    voice_settings: {
      stability: voiceSettings.stability,
      similarity_boost: voiceSettings.similarity_boost,
      style: voiceSettings.style,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error for ${key}: ${response.status} - ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// --- Clean old v2 files ---
function cleanOldFiles() {
  if (!existsSync(OUTPUT_DIR)) return;

  const v3Keys = new Set(Object.keys(SCRIPT).map(k => `${k.toLowerCase()}.mp3`));
  const existing = readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.mp3'));

  let removed = 0;
  for (const file of existing) {
    if (!v3Keys.has(file)) {
      unlinkSync(resolve(OUTPUT_DIR, file));
      console.log(`  REMOVED old file: ${file}`);
      removed++;
    }
  }
  if (removed > 0) console.log(`  Cleaned ${removed} old v2 file(s)\n`);
}

// --- Main ---
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const clean = args.includes('--clean');
  const force = args.includes('--force');

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  if (clean) {
    console.log('\nCleaning old v2 files...');
    cleanOldFiles();
  }

  const keys = Object.keys(SCRIPT);
  console.log(`\n=== ElevenLabs v3 Audio Generation ===`);
  console.log(`Voice ID: ${VOICE_ID}`);
  console.log(`Model: eleven_v3`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Total keys: ${keys.length}\n`);

  if (dryRun) {
    console.log('DRY RUN — showing what would be generated:\n');
    for (const key of keys) {
      const segments = SCRIPT[key as keyof typeof SCRIPT];
      const text = buildV3Text(segments);
      const phase = getPhaseForKey(key);
      const filename = `${key.toLowerCase()}.mp3`;
      const exists = existsSync(resolve(OUTPUT_DIR, filename));
      console.log(`  ${exists ? 'SKIP' : 'GEN '} ${filename} (${phase}, ${text.length} chars)`);
      if (!exists) {
        console.log(`        "${text.substring(0, 80)}..."\n`);
      }
    }
    return;
  }

  let completed = 0;
  let skipped = 0;
  let failed = 0;

  for (const key of keys) {
    const filename = `${key.toLowerCase()}.mp3`;
    const outputPath = resolve(OUTPUT_DIR, filename);

    // Skip if exists (unless --force)
    if (existsSync(outputPath) && !force) {
      console.log(`  SKIP  ${filename} (already exists)`);
      skipped++;
      completed++;
      continue;
    }

    const segments = SCRIPT[key as keyof typeof SCRIPT];
    const text = buildV3Text(segments);

    if (text.length > 5000) {
      console.warn(`  WARNING: ${key} text is ${text.length} chars (v3 limit is 5000)`);
    }

    const phase = getPhaseForKey(key);
    const voiceSettings = PHASE_VOICE[phase];

    try {
      process.stdout.write(`  [${completed + 1}/${keys.length}] ${filename} (${phase})...`);
      const audioBuffer = await generateAudio(key, text, voiceSettings);
      writeFileSync(outputPath, audioBuffer);
      const sizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(2);
      console.log(` OK (${sizeMB} MB)`);
      completed++;

      // Rate limit: 1s between requests
      if (completed < keys.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (error: unknown) {
      console.log(` FAILED`);
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`    Error: ${msg}`);
      failed++;
      completed++;

      // Stop on quota exceeded
      if (msg.includes('quota') || msg.includes('429') || msg.includes('insufficient')) {
        console.error('\n  Quota exceeded! Re-run to continue from where it stopped.\n');
        break;
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Generated: ${completed - skipped - failed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Files: ${OUTPUT_DIR}\n`);

  if (failed > 0) {
    console.log('Re-run to retry failed files (existing files are skipped).\n');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
