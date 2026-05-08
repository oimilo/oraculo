# Phase 36: Dual-Voice Data Layer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-08
**Phase:** 36-dual-voice-data-layer
**Areas discussed:** Voice classification

---

## Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Classificacao de voz | Como classificar cada script key como VOZ_PERGUNTA ou VOZ_NARRATIVA? Inline no SCRIPT object, mapeamento separado, ou derivado do nome da chave? Qual criterio para FALLBACK/TIMEOUT? | Y |
| Contexto de versao | Como passar V1/V2 pelo component tree? React Context, prop drilling, ou campo no OracleContextV4? | |
| Escopo de 'narrativa' | Quais chaves exatamente sao VOZ_NARRATIVA? Fronteira clara ou caso a caso? | |
| Env configuration | ELEVENLABS_VOICE_ID_V2 como env var. Server-side only? | |

**User's choice:** Discuss voice classification only; close with Claude's discretion on the rest.

---

## Voice Classification Storage

| Option | Description | Selected |
|--------|-------------|----------|
| Mapeamento derivado do nome | Funcao getVoiceType(key) que retorna VOZ_PERGUNTA se key contem '_PERGUNTA', senao VOZ_NARRATIVA. Zero mudanca no SCRIPT object. | Y |
| Record<string, VoiceType> separado | Constante VOICE_CLASSIFICATION exportada com mapeamento explicito por chave. Mais flexivel mas requer sync. | |
| Campo inline no SpeechSegment | Adicionar voiceType ao type SpeechSegment. Maxima granularidade mas toca 82 entries. | |

**User's choice:** Derived from key name — zero changes to SCRIPT object.

---

## FALLBACK/TIMEOUT Voice Assignment

| Option | Description | Selected |
|--------|-------------|----------|
| Voz 1 (mesma das perguntas) | FALLBACK/TIMEOUT sao re-engajamento com o visitante — tem carater de pergunta. | Y |
| Voz 2 (soturna) | FALLBACK/TIMEOUT sao narrativa do Oraculo redirecionando. | |
| Depende do contexto | FALLBACK = Voz 1, TIMEOUT = Voz 2. Tratamento diferenciado. | |

**User's choice:** Voice 1 for both — they are re-engagement with the visitor.

---

## Bookends (APRESENTACAO/ENCERRAMENTO) Voice Assignment

| Option | Description | Selected |
|--------|-------------|----------|
| Voz 2 para ambos | Bookends sao narrativa — seguem regra geral. | |
| Voz 1 para APRESENTACAO, Voz 2 para ENCERRAMENTO | APRESENTACAO fala diretamente com visitante = Voz 1. ENCERRAMENTO e narrativa = Voz 2. | |
| Voz 1 para ambos | Bookends sao contato direto com o visitante. Voz soturna so entra na jornada. | Y |

**User's choice:** Voice 1 for both — bookends are direct contact with the visitor.

---

## Claude's Discretion

- Version context mechanism: React Context (follows codebase patterns)
- Env var pattern: server-side only, same as existing ELEVENLABS_VOICE_ID
- VoiceType type location: alongside existing types in src/types/index.ts

## Deferred Ideas

None.
