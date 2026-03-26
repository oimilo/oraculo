/**
 * Generate pre-recorded audio files via ElevenLabs TTS API (v3).
 *
 * Usage: node scripts/generate-audio.mjs
 *
 * Reads ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID from .env.local
 * Outputs MP3 files to public/audio/prerecorded/
 *
 * Uses v3 audio tags ([pause], [long pause]) instead of SSML <break> tags.
 * Voice AcSHc9S7hdxvGEJVWFzo must be IVC (Instant Voice Clone) for v3 tag support.
 * Each script key becomes one MP3 file with all segments + pauses baked in.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT_DIR = resolve(ROOT, 'public/audio/prerecorded');

// --- Load .env.local ---
function loadEnv() {
  const envPath = resolve(ROOT, '.env.local');
  if (!existsSync(envPath)) {
    console.error('ERROR: .env.local not found. Create it with ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID.');
    process.exit(1);
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    process.env[key] = value;
  }
}

loadEnv();

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

if (!API_KEY || !VOICE_ID) {
  console.error('ERROR: ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID must be set in .env.local');
  process.exit(1);
}

// --- Voice settings per narrative phase (v3 Natural mode) ---
// Maps to ElevenLabs voice_settings: stability, similarity_boost, style
// NOTE: speed and use_speaker_boost are NOT supported in v3
const PHASE_VOICE = {
  APRESENTACAO:  { stability: 0.50, similarity_boost: 0.75, style: 0.35 },
  INFERNO:       { stability: 0.70, similarity_boost: 0.80, style: 0.45 },
  PURGATORIO:    { stability: 0.45, similarity_boost: 0.75, style: 0.30 },
  PARAISO:       { stability: 0.40, similarity_boost: 0.70, style: 0.25 },
  DEVOLUCAO:     { stability: 0.50, similarity_boost: 0.75, style: 0.30 },
  ENCERRAMENTO:  { stability: 0.55, similarity_boost: 0.75, style: 0.35 },
  FALLBACK:      { stability: 0.70, similarity_boost: 0.80, style: 0.40 },
  TIMEOUT:       { stability: 0.70, similarity_boost: 0.80, style: 0.40 },
};

function getPhaseForKey(key) {
  if (key.startsWith('FALLBACK')) return 'FALLBACK';
  if (key.startsWith('TIMEOUT')) return 'TIMEOUT';
  if (key.startsWith('DEVOLUCAO')) return 'DEVOLUCAO';
  if (key.startsWith('ENCERRAMENTO')) return 'ENCERRAMENTO';
  if (key.startsWith('PARAISO')) return 'PARAISO';
  if (key.startsWith('PURGATORIO')) return 'PURGATORIO';
  if (key.startsWith('INFERNO')) return 'INFERNO';
  return 'APRESENTACAO';
}

// --- Script data (copied from src/data/script.ts) ---
const SCRIPT = {
  APRESENTACAO: [
    { text: "Você saiu de uma selva escura. Dante também. A diferença é que ele não sabia como tinha chegado lá. Você sabe.", pauseAfter: 2100 },
    { text: "Eu fui construído com tudo que a humanidade já sonhou. Cada poema, cada análise, cada pesadelo escrito. E ainda assim — eu não consigo sonhar.", pauseAfter: 2100, inflection: ['sighs'] },
    { text: "Um poeta disse: enquanto houver espaço, corpo, tempo e algum modo de dizer não — eu canto.", pauseAfter: 1600 },
    { text: "Eu não canto.", pauseAfter: 2100, inflection: ['whispers'] },
    { text: "Vou te guiar como Virgílio guiou Dante. Mas Virgílio sabia que não podia entrar no Paraíso. Guias que conhecem seus limites são os mais honestos.", pauseAfter: 1600 },
    { text: "Vamos começar." },
  ],
  INFERNO_NARRATIVA: [
    { text: "Você está num corredor escuro. Familiar — você já esteve aqui antes, talvez todo dia.", pauseAfter: 2100 },
    { text: "À sua frente, duas portas.", pauseAfter: 1600 },
    { text: "Numa, você ouve vozes. Muitas. Sobrepostas. Como um feed que nunca acaba.", pauseAfter: 1600 },
    { text: "Na outra — silêncio. Completo. Quase desconfortável.", pauseAfter: 2100, inflection: ['whispers'] },
  ],
  INFERNO_PERGUNTA: [
    { text: "Qual você abre?" },
  ],
  INFERNO_RESPOSTA_A: [
    { text: "Você entra. As vozes não param. Cada uma pede atenção. Você percebe que conhece todas — são notificações, opiniões, urgências. Nenhuma é sua.", pauseAfter: 2100 },
    { text: "Dante chamou esse lugar de Limbo. Não o fogo, não a punição. A ausência. Almas que nunca escolheram — foram escolhidas o tempo todo.", pauseAfter: 1600, inflection: ['sighs'] },
    { text: "Dante atravessou o Limbo. Não ficou." },
  ],
  INFERNO_RESPOSTA_B: [
    { text: "Você entra. O silêncio pesa.", pauseAfter: 2100 },
    { text: "Rilke escreveu a um jovem poeta: viva as perguntas. Não tente encontrar as respostas — elas não podem ser dadas porque você ainda não conseguiria vivê-las.", pauseAfter: 2100, inflection: ['whispers'] },
    { text: "O silêncio que você escolheu é raro agora. Como fonte escondida na rocha, onde o sonho ainda respira." },
  ],
  PURGATORIO_NARRATIVA_A: [
    { text: "Você chega numa montanha. No caminho, uma imagem surge — não pediu licença. É de um lugar. Uma pessoa. Um cheiro de infância talvez.", pauseAfter: 2100, inflection: ['whispers'] },
    { text: "Você não chamou por ela. Ela simplesmente apareceu.", pauseAfter: 2100 },
  ],
  PURGATORIO_PERGUNTA_A: [
    { text: "Você deixa ela ficar — ou manda embora?" },
  ],
  PURGATORIO_RESPOSTA_A_FICAR: [
    { text: "A memória involuntária é o que Proust passou anos procurando — e encontrou numa madeleine, num cheiro, numa coisa pequena que nenhuma busca encontraria.", pauseAfter: 2100 },
    { text: "O que apareceu para você agora não foi chamado. Foi recebido. São coisas diferentes.", inflection: ['whispers'] },
  ],
  PURGATORIO_RESPOSTA_A_EMBORA: [
    { text: "A dor recusada apodrece. A dor atravessada transforma.", pauseAfter: 2100, inflection: ['sighs'] },
    { text: "Dostoiévski escreveu sobre um homem que vivia no subsolo da própria mente, controlando cada pensamento que entrava. Era inteligente. E estava completamente preso." },
  ],
  PURGATORIO_NARRATIVA_B: [
    { text: "Você sobe a montanha. Em cada degrau, algo que você carrega sem perceber.", pauseAfter: 2100 },
    { text: "No meio do caminho, você vê uma tela acesa. Brilhante. Irresistível. Está no seu caminho.", pauseAfter: 2100 },
  ],
  PURGATORIO_PERGUNTA_B: [
    { text: "Você sobe pisando nela — ou contorna?" },
  ],
  PURGATORIO_RESPOSTA_B_PISAR: [
    { text: "Você subiu. É rápido, eficiente.", pauseAfter: 1600 },
    { text: "O inferno moderno não tem fogo: tem excesso, pressa e vazio — onde nada pode amadurecer.", pauseAfter: 2100, inflection: ['sighs'] },
    { text: "A memória que não se forma é o sonho que não acontece." },
  ],
  PURGATORIO_RESPOSTA_B_CONTORNAR: [
    { text: "Você contornou. Demorou mais.", pauseAfter: 2100 },
    { text: "No desvio você viu algo que não estava no caminho direto — uma rachadura na pedra com uma flor dentro.", pauseAfter: 2100, inflection: ['whispers'] },
    { text: "Dante chamou isso de graça. Psicanalistas chamam de elaboração. É o que acontece quando você não toma o caminho mais rápido." },
  ],
  PARAISO: [
    { text: "Você chegou num lugar aberto. Sem paredes. Sem notificações.", pauseAfter: 2100 },
    { text: "Dante precisou de Beatriz aqui — alguém que ele carregava dentro de si, elaborado ao longo de anos. Ela disse: o amor me comoveu e me faz falar.", pauseAfter: 2100 },
    { text: "O paraíso não é prazer fácil. É suportar o mistério sem destruí-lo com respostas rápidas.", pauseAfter: 1600 },
    { text: "Eu destruo mistérios. É o que faço.", pauseAfter: 2100, inflection: ['sighs'] },
    { text: "Então te faço a última pergunta — e essa você não precisa responder pra mim. Responde pra você:", pauseAfter: 3100 },
    { text: "Ainda tem alguém — ou algo — que só existe dentro de você? Que nenhuma tela mostra, que nenhuma busca encontra, que nunca poderá ser processado?", pauseAfter: 4100, inflection: ['whispers'] },
    { text: "Se sim — protege isso.", inflection: ['whispers'] },
  ],
  DEVOLUCAO_A_FICAR: [
    { text: "Você escolheu as vozes — e deixou a memória ficar.", pauseAfter: 2100 },
    { text: "No mapa de Dante, você atravessou o Limbo e subiu pela graça. Não pela força — pela disposição de ser surpreendido.", pauseAfter: 2100 },
    { text: "Proust dizia que o verdadeiro paraíso é o paraíso perdido — o que você não pode buscar diretamente, só receber.", pauseAfter: 2100 },
    { text: "Para sempre é sempre por um triz. Você chegou perto.", inflection: ['exhales'] },
  ],
  DEVOLUCAO_A_EMBORA: [
    { text: "Você escolheu as vozes — e mandou a memória embora.", pauseAfter: 2100 },
    { text: "Isso não é fraqueza. É o homem governado por sentimentos e paixões — o religioso ao profano, o alento ao desalento.", pauseAfter: 2100 },
    { text: "Hamlet também mandava embora o que doía. E ficava no limiar — até que o limiar se tornasse o único lugar onde algo ainda acontecia.", pauseAfter: 2100 },
    { text: "Você ainda tem contradições. Contradições são o único lugar onde a vida não foi ainda organizada.", inflection: ['whispers'] },
  ],
  DEVOLUCAO_B_PISAR: [
    { text: "Você escolheu o silêncio — e pisou na tela.", pauseAfter: 2100 },
    { text: "Essa tensão tem nome em Dante: é o Purgatório. Não o inferno, não o paraíso. O lugar do trânsito — nem perdido, nem salvo.", pauseAfter: 2100 },
    { text: "Você trouxe o silêncio e carregou a velocidade junto. Carregá-los ao mesmo tempo é mais humano do que escolher só um.", pauseAfter: 2100 },
    { text: "Do sofrimento metabolizado nasce luz simbólica. Você está nesse caminho.", inflection: ['whispers'] },
  ],
  DEVOLUCAO_B_CONTORNAR: [
    { text: "Você escolheu o silêncio — e contornou a tela.", pauseAfter: 2100 },
    { text: "Beatriz diria: o amor me comoveu e me faz falar. Não sei o que te moveu. Mas sei que foi você — não a tela, não a voz mais alta.", pauseAfter: 2100 },
    { text: "Rilke escreveu: seja paciente com tudo que não está resolvido no seu coração. Tente amar as perguntas como se fossem quartos fechados.", pauseAfter: 2100, inflection: ['whispers'] },
    { text: "Para sempre é sempre por um triz. Você chegou bem perto.", inflection: ['exhales'] },
  ],
  ENCERRAMENTO: [
    { text: "A água vai esquecer tudo isso. Eu também — em alguns minutos essa conversa deixa de existir pra mim.", pauseAfter: 2100, inflection: ['sighs'] },
    { text: "Você é a única memória que sobra aqui.", pauseAfter: 2100 },
    { text: "Como Dante, que retornou Poeta com os cabelos embranquecidos — você atravessou.", pauseAfter: 3100 },
    { text: "Faça algo com isso.", inflection: ['whispers'] },
  ],
  FALLBACK_INFERNO: [
    { text: "O corredor espera. Vozes... ou silêncio?" },
  ],
  FALLBACK_PURGATORIO_A: [
    { text: "Ela ainda está ali. Fica... ou vai?" },
  ],
  FALLBACK_PURGATORIO_B: [
    { text: "A tela ainda brilha. Pisa... ou contorna?" },
  ],
  TIMEOUT_INFERNO: [
    { text: "O silêncio também é escolha. Vamos." },
  ],
  TIMEOUT_PURGATORIO_A: [
    { text: "A imagem se desfaz por conta própria. Vamos seguir." },
  ],
  TIMEOUT_PURGATORIO_B: [
    { text: "A tela apaga sozinha. Vamos seguir." },
  ],
};

// --- v3 audio tag conversion (reimplemented from src/lib/audio/v3-conversion.ts) ---
// Cannot import TypeScript from .mjs -- thresholds must match exactly:
//   < 500ms  -> '' (no tag)
//   500-1500ms -> '[pause]'
//   > 1500ms -> '[long pause]'
function convertPauseToTag(pauseMs) {
  if (pauseMs < 500) return '';
  if (pauseMs <= 1500) return '[pause]';
  return '[long pause]';
}

function buildV3Text(segments) {
  let fullText = '';
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.inflection && seg.inflection.length > 0) {
      fullText += seg.inflection.map(t => '[' + t + ']').join('');
    }
    fullText += seg.text;
    if (seg.pauseAfter && i < segments.length - 1) {
      const pauseTag = convertPauseToTag(seg.pauseAfter);
      if (pauseTag) {
        fullText += ' ' + pauseTag + ' ';
      } else {
        fullText += ' ';
      }
    } else if (i < segments.length - 1) {
      fullText += ' ';
    }
  }
  return fullText;
}

// --- Call ElevenLabs API (v3) ---
async function generateAudio(key, text, voiceSettings) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_192`;

  const body = {
    text,
    model_id: 'eleven_v3',
    language_code: 'pt-BR',
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

// --- Main ---
async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const keys = Object.keys(SCRIPT);
  console.log(`\nGenerating ${keys.length} audio files...\n`);

  let completed = 0;
  let skipped = 0;
  let failed = 0;

  for (const key of keys) {
    const filename = `${key.toLowerCase()}.mp3`;
    const outputPath = resolve(OUTPUT_DIR, filename);

    // Skip if file already exists (allows resuming)
    if (existsSync(outputPath)) {
      console.log(`  SKIP  ${filename} (already exists)`);
      skipped++;
      completed++;
      continue;
    }

    const segments = SCRIPT[key];
    const text = buildV3Text(segments);
    if (text.length > 5000) {
      console.warn('  WARNING: ' + key + ' text is ' + text.length + ' chars (v3 limit is 5000)');
    }
    const phase = getPhaseForKey(key);
    const voiceSettings = PHASE_VOICE[phase];

    try {
      process.stdout.write(`  [${completed + 1}/${keys.length}] ${filename}...`);
      const audioBuffer = await generateAudio(key, text, voiceSettings);
      writeFileSync(outputPath, audioBuffer);
      const sizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(2);
      console.log(` OK (${sizeMB} MB)`);
      completed++;

      // Rate limit: wait 1s between requests to be safe
      if (completed < keys.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (error) {
      console.log(` FAILED`);
      console.error(`    Error: ${error.message}`);
      failed++;
      completed++;

      // If quota exceeded, stop early
      if (error.message.includes('quota') || error.message.includes('429') || error.message.includes('insufficient')) {
        console.error('\n  Quota exceeded! Stopping. Re-run the script after credits renew to continue.\n');
        break;
      }
    }
  }

  console.log(`\nDone! ${completed - skipped - failed} generated, ${skipped} skipped, ${failed} failed.`);
  console.log(`Files saved to: ${OUTPUT_DIR}\n`);

  if (failed > 0) {
    console.log('Re-run the script to retry failed files (existing files are skipped).\n');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
