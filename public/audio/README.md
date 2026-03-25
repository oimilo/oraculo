# Ambient Audio Assets

Place ambient soundscape files here. The AmbientPlayer expects:

| File | Phase | Description | Duration |
|------|-------|-------------|----------|
| ambient-inferno.mp3 | INFERNO | Echo, whispers, dark atmosphere | 30-60s loop |
| ambient-purgatorio.mp3 | PURGATORIO | Wind, footsteps, contemplative | 30-60s loop |
| ambient-paraiso.mp3 | PARAISO | Ethereal harmonics, light | 30-60s loop |

## Format Requirements

- **Format:** MP3 (universally supported) or WebM/OGG
- **Looping:** Files should loop seamlessly (crossfade start/end during production)
- **Duration:** 30-60 seconds recommended (shorter = smaller download, Web Audio loops handle repetition)
- **Sample rate:** 44.1kHz or 48kHz
- **Channels:** Stereo preferred, mono acceptable
- **Volume:** Normalize to -6dB to leave headroom for TTS voice

## Phases Without Ambient

- APRESENTACAO: No ambient (clean start)
- DEVOLUCAO: Continues previous phase's ambient
- ENCERRAMENTO: Ambient fades out during final speech

## Placeholder

Until real audio assets are created, the AmbientPlayer will silently skip loading for missing files.
The experience works without ambient audio -- it enhances but is not required.
