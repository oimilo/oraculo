# Phase 36: Dual-Voice Data Layer - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish voice classification metadata and configuration foundation for V2 dual-voice system. This phase adds: (1) voice type classification for every SCRIPT key (VOZ_PERGUNTA vs VOZ_NARRATIVA), (2) new env var ELEVENLABS_VOICE_ID_V2, (3) version context types (V1 vs V2) that can be passed through the component tree and persist during session.

This phase does NOT implement service-layer routing (Phase 37), UI selector (Phase 38), or audio generation (Phase 39).

</domain>

<decisions>
## Implementation Decisions

### Voice Classification Strategy
- **D-01:** Voice classification is DERIVED from the script key name — no changes to SCRIPT object or SpeechSegment type. A pure function `getVoiceType(key: string): VoiceType` determines which voice to use.
- **D-02:** Classification rule: VOZ_PERGUNTA (Voice 1) for keys matching `_PERGUNTA`, `FALLBACK_*`, `TIMEOUT_*`, `APRESENTACAO`, or `ENCERRAMENTO`. Everything else is VOZ_NARRATIVA (Voice 2).
- **D-03:** FALLBACK and TIMEOUT keys use Voice 1 (same as questions) because they are re-engagement with the visitor, not narrative.
- **D-04:** APRESENTACAO and ENCERRAMENTO bookends use Voice 1 because they are direct contact with the visitor. The somber voice (Voice 2) only enters during the journey itself (INTRO, SETUP, RESPOSTA, DEVOLUCAO).

### Voice Classification Breakdown (82 keys)
- **VOZ_PERGUNTA (~35 keys):** 11 `*_PERGUNTA` + 11 `FALLBACK_*` + 11 `TIMEOUT_*` + `APRESENTACAO` + `ENCERRAMENTO`
- **VOZ_NARRATIVA (~47 keys):** 3 `*_INTRO` + 11 `*_SETUP` + 22 `*_RESPOSTA_*` + 11 `DEVOLUCAO_*`

### Claude's Discretion
- Version context mechanism (React Context vs prop drilling vs OracleContextV4 field) — follow existing codebase patterns. React Context is the natural fit given the component tree structure.
- Env var `ELEVENLABS_VOICE_ID_V2` — server-side only, same pattern as existing `ELEVENLABS_VOICE_ID`. Follow the established env configuration pattern in `.env.example`.
- VoiceType union type definition and export location — place alongside existing types in `src/types/index.ts`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Script & Types
- `src/data/script.ts` — ScriptDataV4 interface (82 keys) and SCRIPT constant. Voice classification derives from these key names.
- `src/types/index.ts` — SpeechSegment, NarrativePhase, DevolucaoArchetype, QUESTION_META. New VoiceType goes here.
- `src/machines/oracleMachine.types.ts` — OracleContextV4, QuestionId. Version context type may extend or parallel this.

### Services (downstream phases, but patterns matter)
- `src/services/tts/index.ts` — TTSService interface, VoiceSettings, createTTSService factory. Phase 37 will extend this.
- `src/services/tts/fallback.ts` — FallbackTTSService with PRERECORDED_URLS derived from SCRIPT keys. Phase 37 will modify URL routing.

### Configuration
- `.env.example` — Current env vars. New ELEVENLABS_VOICE_ID_V2 goes here.
- `src/components/experience/OracleExperience.tsx` — The orchestrator. Version context will flow through here (Phase 38).

### Requirements
- `.planning/REQUIREMENTS.md` — VOZ-01, VOZ-02, VER-02 are Phase 36 requirements.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ScriptDataV4` interface: All 82 key names are typed — `getVoiceType()` can use `keyof ScriptDataV4` for type safety.
- `Object.keys(SCRIPT)` pattern in `FallbackTTSService`: Already iterates all keys to build PRERECORDED_URLS. Same pattern can validate voice classification coverage.
- `OracleContextV4` in `oracleMachine.types.ts`: Established context pattern with `INITIAL_CONTEXT_V4`. Version context follows same structure.

### Established Patterns
- **Service pattern:** interface + factory + mock in each service directory. Version context is data-layer, not a service.
- **Constants:** UPPER_SNAKE_CASE (SCRIPT, PHASE_COLORS, QUESTION_META). New VOICE_CLASSIFICATION or VoiceType follows same convention.
- **Types:** Union types over enums. `VoiceType = 'VOZ_PERGUNTA' | 'VOZ_NARRATIVA'` fits existing style.
- **Env vars:** `NEXT_PUBLIC_` prefix for client-side, plain for server-side. ELEVENLABS_VOICE_ID_V2 is server-side only (no prefix).

### Integration Points
- `getVoiceType(key)` will be consumed by Phase 37's TTS service layer to determine which voice ID to use.
- Version context type will be consumed by Phase 38's OracleExperience to route audio requests.
- `.env.example` update enables Phase 39's audio generation script to read V2 voice ID.

</code_context>

<specifics>
## Specific Ideas

- Voice classification function should be simple pattern matching on the key name string — no lookup tables or external config needed.
- The classification rule has a clear hierarchy: check explicit names first (APRESENTACAO, ENCERRAMENTO), then prefixes (FALLBACK_, TIMEOUT_), then suffix (_PERGUNTA), default to VOZ_NARRATIVA.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 36-Dual-Voice Data Layer*
*Context gathered: 2026-05-08*
