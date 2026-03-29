/** Segment of speech with optional pause after */
export interface SpeechSegment {
  text: string;
  pauseAfter?: number; // milliseconds
  inflection?: string[]; // v3 audio tags, e.g. ["thoughtful"], ["whispers", "sad"]
}

/** Narrative phases matching Dante's journey */
export type NarrativePhase =
  | 'APRESENTACAO'
  | 'INFERNO'
  | 'PURGATORIO'
  | 'PARAISO'
  | 'DEVOLUCAO'
  | 'ENCERRAMENTO';

/** Binary choice for any question */
export type ChoiceAB = 'A' | 'B' | null;

/** Complete path through experience — array of 6-10 choices (variable due to branching) */
export type ChoicePattern = ChoiceAB[];

/** Devolução archetype derived from pattern analysis */
export type DevolucaoArchetype =
  | 'SEEKER'          // mostly toward + movement
  | 'GUARDIAN'        // mostly away + stillness
  | 'CONTRADICTED'    // mixed pattern
  | 'PIVOT_EARLY'     // switches direction in first half
  | 'PIVOT_LATE'      // switches direction in second half
  | 'DEPTH_SEEKER'    // chose "deeper" option consistently
  | 'SURFACE_KEEPER'  // chose "safer" option consistently
  | 'MIRROR';         // alternating pattern — perfect balance

// Legacy types kept for backward compatibility during transition
/** @deprecated Use ChoiceAB instead */
export type Choice1 = 'A' | 'B' | null;
/** @deprecated Use ChoiceAB instead */
export type Choice2 = 'FICAR' | 'EMBORA' | 'PISAR' | 'CONTORNAR' | null;
/** @deprecated Use DevolucaoArchetype instead */
export type ExperiencePath = 'A_FICAR' | 'A_EMBORA' | 'B_PISAR' | 'B_CONTORNAR';

/** Voice direction per phase for SpeechSynthesis approximation (per CONTEXT.md) */
export interface VoiceDirection {
  rate: number;   // SpeechSynthesis rate (0.1-10, default 1)
  pitch: number;  // SpeechSynthesis pitch (0-2, default 1)
  description: string;
}

/** Phase background colors per CONTEXT.md locked decision */
export const PHASE_COLORS: Record<NarrativePhase, string> = {
  APRESENTACAO: '#000000',     // Black
  INFERNO: '#4a0e0e',         // Bordo (dark red)
  PURGATORIO: '#3d4f5c',     // Azul acinzentado (slate blue)
  PARAISO: '#5c4a2a',        // Dourado/ambar (golden brown)
  DEVOLUCAO: '#5c4a2a',      // Continue Paraiso color
  ENCERRAMENTO: '#000000',    // Black
};

/** Voice direction per phase -- SpeechSynthesis approximation of PRD Section 5.1 ElevenLabs settings */
export const VOICE_DIRECTIONS: Record<NarrativePhase, VoiceDirection> = {
  APRESENTACAO: { rate: 0.9, pitch: 1.0, description: 'Calmo, pausado' },
  INFERNO: { rate: 0.8, pitch: 0.8, description: 'Mais grave, mais lento' },
  PURGATORIO: { rate: 0.9, pitch: 0.9, description: 'Intimo, confessional' },
  PARAISO: { rate: 0.85, pitch: 1.1, description: 'Suave, quase sussurro' },
  DEVOLUCAO: { rate: 0.85, pitch: 1.0, description: 'Espelho, voz se dissolve' },
  ENCERRAMENTO: { rate: 0.9, pitch: 1.0, description: 'Retorno ao tom inicial, definitivo' },
};

/**
 * Question metadata for NLU classification.
 * Maps question number to context and option labels.
 */
export interface QuestionMeta {
  questionContext: string;
  optionA: string;
  optionB: string;
  /** Keywords that map directly to A (accent/case insensitive) */
  keywordsA: string[];
  /** Keywords that map directly to B (accent/case insensitive) */
  keywordsB: string[];
  /** Default choice on timeout */
  defaultOnTimeout: 'A' | 'B';
}

/** NLU metadata for all questions (6 base + 2 branch) */
export const QUESTION_META: Record<number, QuestionMeta> = {
  1: {
    questionContext: 'Visitante numa sala confortável, escolhendo entre ficar no conforto ou procurar a porta de saída',
    optionA: 'Ficar',
    optionB: 'Procurar a porta',
    keywordsA: ['ficar', 'fico', 'aqui', 'conforto', 'confortável', 'fica', 'permanecer', 'sim'],
    keywordsB: ['porta', 'sair', 'saída', 'procurar', 'ir', 'embora', 'abrir', 'não'],
    defaultOnTimeout: 'A',
  },
  2: {
    questionContext: 'Visitante vê algo no chão que causa repulsa, escolhendo entre recuar ou ficar parado olhando',
    optionA: 'Recuar',
    optionB: 'Ficar olhando',
    keywordsA: ['recuar', 'recuo', 'afastar', 'sair', 'embora', 'fugir', 'não', 'nojo'],
    keywordsB: ['ficar', 'olhar', 'olhando', 'parar', 'fico', 'ver', 'sim', 'perto'],
    defaultOnTimeout: 'A',
  },
  3: {
    questionContext: 'Visitante diante de um jardim que vai queimar, escolhendo entre entrar na beleza ou dar as costas',
    optionA: 'Entrar',
    optionB: 'Dar as costas',
    keywordsA: ['entrar', 'entro', 'ir', 'dentro', 'jardim', 'sim', 'beleza', 'bonito'],
    keywordsB: ['costas', 'embora', 'sair', 'não', 'ir embora', 'voltar', 'recuar', 'virar', 'tchau', 'adeus'],
    defaultOnTimeout: 'A',
  },
  4: {
    questionContext: 'Visitante diante de duas águas, escolhendo entre lembrar de tudo ou esquecer de tudo',
    optionA: 'Lembrar',
    optionB: 'Esquecer',
    keywordsA: ['lembrar', 'lembro', 'memória', 'memórias', 'memoria', 'recordar', 'tudo', 'sim', 'carregar', 'carrego', 'escura', 'quente'],
    keywordsB: ['esquecer', 'esqueço', 'esquece', 'apagar', 'apago', 'não', 'nada', 'limpar', 'clara', 'gelada', 'limpo'],
    defaultOnTimeout: 'A',
  },
  5: {
    questionContext: 'Visitante com uma pergunta sem resposta, escolhendo entre carregar a pergunta ou deixar dissolver',
    optionA: 'Carregar',
    optionB: 'Deixar dissolver',
    keywordsA: ['carregar', 'carrego', 'levar', 'sim', 'levo', 'segurar', 'guardar', 'ficar'],
    keywordsB: ['dissolver', 'soltar', 'largar', 'deixar', 'ir', 'não', 'liberar'],
    defaultOnTimeout: 'A',
  },
  6: {
    questionContext: 'Visitante no fim do jogo, escolhendo entre ouvir o que o Oraculo viu nele ou confiar no que já sabe',
    optionA: 'Ouvir',
    optionB: 'Já sei',
    keywordsA: ['ouvir', 'ouvido', 'escutar', 'quero', 'sim', 'fala', 'diz', 'conta', 'mostrar', 'ver', 'espelho', 'pedir'],
    keywordsB: ['sei', 'já sei', 'não', 'confio', 'saber', 'conheço', 'dispenso'],
    defaultOnTimeout: 'B',
  },
  // Branch questions — conditional, only appear for specific choice patterns
  7: {
    questionContext: 'Visitante que ficou na sala E recuou da coisa no chao agora encontra uma segunda coisa pulsando no corredor, escolhendo entre tocar ou passar reto',
    optionA: 'Tocar',
    optionB: 'Passar reto',
    keywordsA: ['tocar', 'toco', 'pegar', 'encostar', 'mao', 'sim', 'quero'],
    keywordsB: ['passar', 'reto', 'seguir', 'nao', 'embora', 'ir', 'andar', 'ignorar'],
    defaultOnTimeout: 'A',
  },
  8: {
    questionContext: 'Visitante que entrou no jardim E escolheu lembrar agora encontra uma memoria especifica que insiste em voltar, escolhendo entre reviver ou arquivar',
    optionA: 'Reviver',
    optionB: 'Arquivar',
    keywordsA: ['reviver', 'revivo', 'voltar', 'lembrar', 'sim', 'quero', 'abrir', 'ver'],
    keywordsB: ['arquivar', 'guardar', 'fechar', 'nao', 'esquecer', 'passar', 'deixar'],
    defaultOnTimeout: 'A',
  },
};
