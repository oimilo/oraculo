/**
 * Generate ambient audio loops via ElevenLabs Sound Effects API.
 *
 * Usage: npx tsx scripts/generate-ambient.ts
 *        npx tsx scripts/generate-ambient.ts --dry-run
 *        npx tsx scripts/generate-ambient.ts --force   (overwrite existing)
 *
 * Reads ELEVENLABS_API_KEY from .env.local
 * Outputs MP3 files to public/audio/
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT_DIR = resolve(ROOT, 'public/audio');

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
if (!API_KEY) {
  console.error('ERROR: ELEVENLABS_API_KEY must be set in .env.local');
  process.exit(1);
}

// --- Ambient definitions ---
// Each prompt is crafted for the ElevenLabs Sound Effects v2 model.
// Duration: 22s (loops seamlessly, long enough for natural variation)

interface AmbientDef {
  filename: string;
  prompt: string;
  duration: number;
}

const AMBIENTS: AmbientDef[] = [
  {
    filename: 'ambient-apresentacao.mp3',
    prompt:
      'Deep mysterious drone, low resonant hum, sacred ritual atmosphere, ' +
      'subtle reverberant space, ancient oracle temple ambience, ' +
      'very quiet and meditative, dark warm tones, minimal and hypnotic',
    duration: 22,
  },
  {
    filename: 'ambient-inferno.mp3',
    prompt:
      'Dark underground cavern ambience, close echoing whispers, ' +
      'powerful deep rumbling bass drone, crackling fire embers, oppressive heavy atmosphere, ' +
      'Dante inferno inspired, intense and present, unsettling dark tension, ' +
      'strong low frequency pulsing, thick reverberant space',
    duration: 22,
  },
  {
    filename: 'ambient-purgatorio.mp3',
    prompt:
      'Contemplative wind ambience, gentle breeze through open space, ' +
      'distant ethereal chimes, sparse atmospheric texture, ' +
      'purgatory transition feeling, between dark and light, ' +
      'hopeful but melancholic, soft tonal drift, meditative calm',
    duration: 22,
  },
  {
    filename: 'ambient-paraiso.mp3',
    prompt:
      'Ethereal celestial harmonics, angelic soft overtones, ' +
      'warm luminous atmosphere, gentle shimmering high frequencies, ' +
      'paradise ambience, transcendent peace, subtle choir-like texture, ' +
      'golden light feeling, blissful and open, delicate sustained tones',
    duration: 22,
  },
];

// --- Call ElevenLabs Sound Effects API ---
async function generateSoundEffect(def: AmbientDef): Promise<Buffer> {
  const url = 'https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192';

  const body = {
    text: def.prompt,
    duration_seconds: def.duration,
    prompt_influence: 0.4,
    loop: true,
    model_id: 'eleven_text_to_sound_v2',
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
    throw new Error(`API error for ${def.filename}: ${response.status} - ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// --- Main ---
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('\n=== ElevenLabs Ambient Audio Generation ===');
  console.log(`Model: eleven_text_to_sound_v2`);
  console.log(`Loop: true (seamless)`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Tracks: ${AMBIENTS.length}\n`);

  if (dryRun) {
    console.log('DRY RUN — showing what would be generated:\n');
    for (const def of AMBIENTS) {
      const outputPath = resolve(OUTPUT_DIR, def.filename);
      const exists = existsSync(outputPath);
      console.log(`  ${exists ? 'SKIP' : 'GEN '} ${def.filename} (${def.duration}s)`);
      console.log(`        "${def.prompt.substring(0, 80)}..."\n`);
    }
    return;
  }

  let completed = 0;
  let skipped = 0;
  let failed = 0;

  for (const def of AMBIENTS) {
    const outputPath = resolve(OUTPUT_DIR, def.filename);

    if (existsSync(outputPath) && !force) {
      console.log(`  SKIP  ${def.filename} (already exists)`);
      skipped++;
      completed++;
      continue;
    }

    try {
      process.stdout.write(`  [${completed + 1}/${AMBIENTS.length}] ${def.filename} (${def.duration}s)...`);
      const audioBuffer = await generateSoundEffect(def);
      writeFileSync(outputPath, audioBuffer);
      const sizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(2);
      console.log(` OK (${sizeMB} MB)`);
      completed++;

      // Rate limit: 2s between requests
      if (completed < AMBIENTS.length) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (error: unknown) {
      console.log(` FAILED`);
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`    Error: ${msg}`);
      failed++;
      completed++;

      if (msg.includes('quota') || msg.includes('429') || msg.includes('insufficient')) {
        console.error('\n  Quota exceeded! Re-run to continue from where it stopped.\n');
        break;
      }
    }
  }

  console.log('\n=== Summary ===');
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
