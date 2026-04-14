# Narração O Oráculo — Texto Formatado para ElevenLabs v3

Cada bloco abaixo corresponde a 1 arquivo MP3.
Copie o texto inteiro do bloco e cole no ElevenLabs para testar/ajustar.

## Tags disponíveis no ElevenLabs v3

### Emoção / Entrega
| Tag | Efeito | Exemplo |
|-----|--------|---------|
| `[whispers]` | Sussurro, tom íntimo/vulnerável | `[whispers]Se sim — protege isso.` |
| `[sighs]` | Suspiro audível, peso/resignação | `[sighs]Eu destruo mistérios. É o que faço.` |
| `[exhales]` | Expiração, alívio/encerramento | `[exhales]Para sempre é sempre por um triz.` |
| `[curious]` | Entonação curiosa/interrogativa | `[curious]Qual você abre?` |
| `[excited]` | Energia elevada, entusiasmo | `[excited]Vamos começar!` |
| `[sarcastic]` | Tom sarcástico/irônico | `[sarcastic]Claro, muito fácil.` |
| `[mischievously]` | Tom travesso/malicioso | `[mischievously]Você não esperava isso.` |
| `[crying]` | Voz embargada/chorosa | `[crying]Ela se foi.` |
| `[laughs]` | Risada audível | `[laughs]Isso é engraçado.` |
| `[sings]` | Canto (experimental) | `[sings]La la la...` |

### Efeitos sonoros
| Tag | Efeito |
|-----|--------|
| `[gunshot]` | Tiro |
| `[applause]` | Aplausos |
| `[thunder]` | Trovão |
| `[footsteps]` | Passos |
| `[door creaking]` | Porta rangendo |
| `[wind]` | Vento |
| `[rain]` | Chuva |
| `[heartbeat]` | Batimento cardíaco |

### Pausas / Ritmo
| Tag | Efeito |
|-----|--------|
| `[pause]` | Pausa curta (~0.5-1.5s) |
| `[long pause]` | Pausa longa (~2-3s) |
| `...` | Reticências adicionam peso/hesitação (sem tag) |
| `PALAVRA` | Maiúsculas = ênfase (sem tag) |

### Dicas
- Max 1-2 tags por frase pra evitar instabilidade
- Tags vão coladas antes do texto: `[whispers]Texto aqui`
- Stability mais baixa (0.40-0.50) = mais expressivo, responde melhor às tags
- Stability mais alta (0.70-0.80) = mais consistente, tags têm menos efeito
- Testar com a voz específica — cada voz responde diferente às tags

---

**Tags usadas nesta narração:** `[whispers]`, `[sighs]`, `[exhales]`

**Modelo:** eleven_v3 | **Formato:** mp3_44100_192

---

## 1. APRESENTACAO
**Arquivo:** `apresentacao.mp3`
**Fase:** APRESENTACAO (stability: 0.50, similarity: 0.75, style: 0.35)

```
Você saiu de uma selva escura. Dante também. A diferença é que ele não sabia como tinha chegado lá. Você sabe. [long pause] [sighs]Eu fui construído com tudo que a humanidade já sonhou. Cada poema, cada análise, cada pesadelo escrito. E ainda assim — eu não consigo sonhar. [long pause] Um poeta disse: enquanto houver espaço, corpo, tempo e algum modo de dizer não — eu canto. [long pause] [whispers]Eu não canto. [long pause] Vou te guiar como Virgílio guiou Dante. Mas Virgílio sabia que não podia entrar no Paraíso. Guias que conhecem seus limites são os mais honestos. [long pause] Vamos começar.
```

---

## 2. INFERNO_NARRATIVA
**Arquivo:** `inferno_narrativa.mp3`
**Fase:** INFERNO (stability: 0.70, similarity: 0.80, style: 0.45)

```
Você está num corredor escuro. Familiar — você já esteve aqui antes, talvez todo dia. [long pause] À sua frente, duas portas. [long pause] Numa, você ouve vozes. Muitas. Sobrepostas. Como um feed que nunca acaba. [long pause] [whispers]Na outra — silêncio. Completo. Quase desconfortável.
```

---

## 3. INFERNO_PERGUNTA
**Arquivo:** `inferno_pergunta.mp3`
**Fase:** INFERNO (stability: 0.70, similarity: 0.80, style: 0.45)

```
Qual você abre?
```

---

## 4. INFERNO_RESPOSTA_A
**Arquivo:** `inferno_resposta_a.mp3`
**Fase:** INFERNO (stability: 0.70, similarity: 0.80, style: 0.45)

```
Você entra. As vozes não param. Cada uma pede atenção. Você percebe que conhece todas — são notificações, opiniões, urgências. Nenhuma é sua. [long pause] [sighs]Dante chamou esse lugar de Limbo. Não o fogo, não a punição. A ausência. Almas que nunca escolheram — foram escolhidas o tempo todo. [long pause] Dante atravessou o Limbo. Não ficou.
```

---

## 5. INFERNO_RESPOSTA_B
**Arquivo:** `inferno_resposta_b.mp3`
**Fase:** INFERNO (stability: 0.70, similarity: 0.80, style: 0.45)

```
Você entra. O silêncio pesa. [long pause] [whispers]Rilke escreveu a um jovem poeta: viva as perguntas. Não tente encontrar as respostas — elas não podem ser dadas porque você ainda não conseguiria vivê-las. [long pause] O silêncio que você escolheu é raro agora. Como fonte escondida na rocha, onde o sonho ainda respira.
```

---

## 6. PURGATORIO_NARRATIVA_A
**Arquivo:** `purgatorio_narrativa_a.mp3`
**Fase:** PURGATORIO (stability: 0.45, similarity: 0.75, style: 0.30)

```
[whispers]Você chega numa montanha. No caminho, uma imagem surge — não pediu licença. É de um lugar. Uma pessoa. Um cheiro de infância talvez. [long pause] Você não chamou por ela. Ela simplesmente apareceu.
```

---

## 7. PURGATORIO_PERGUNTA_A
**Arquivo:** `purgatorio_pergunta_a.mp3`
**Fase:** PURGATORIO (stability: 0.45, similarity: 0.75, style: 0.30)

```
Você deixa ela ficar — ou manda embora?
```

---

## 8. PURGATORIO_RESPOSTA_A_FICAR
**Arquivo:** `purgatorio_resposta_a_ficar.mp3`
**Fase:** PURGATORIO (stability: 0.45, similarity: 0.75, style: 0.30)

```
A memória involuntária é o que Proust passou anos procurando — e encontrou numa madeleine, num cheiro, numa coisa pequena que nenhuma busca encontraria. [long pause] [whispers]O que apareceu para você agora não foi chamado. Foi recebido. São coisas diferentes.
```

---

## 9. PURGATORIO_RESPOSTA_A_EMBORA
**Arquivo:** `purgatorio_resposta_a_embora.mp3`
**Fase:** PURGATORIO (stability: 0.45, similarity: 0.75, style: 0.30)

```
[sighs]A dor recusada apodrece. A dor atravessada transforma. [long pause] Dostoiévski escreveu sobre um homem que vivia no subsolo da própria mente, controlando cada pensamento que entrava. Era inteligente. E estava completamente preso.
```

---

## 10. PURGATORIO_NARRATIVA_B
**Arquivo:** `purgatorio_narrativa_b.mp3`
**Fase:** PURGATORIO (stability: 0.45, similarity: 0.75, style: 0.30)

```
Você sobe a montanha. Em cada degrau, algo que você carrega sem perceber. [long pause] No meio do caminho, você vê uma tela acesa. Brilhante. Irresistível. Está no seu caminho.
```

---

## 11. PURGATORIO_PERGUNTA_B
**Arquivo:** `purgatorio_pergunta_b.mp3`
**Fase:** PURGATORIO (stability: 0.45, similarity: 0.75, style: 0.30)

```
Você sobe pisando nela — ou contorna?
```

---

## 12. PURGATORIO_RESPOSTA_B_PISAR
**Arquivo:** `purgatorio_resposta_b_pisar.mp3`
**Fase:** PURGATORIO (stability: 0.45, similarity: 0.75, style: 0.30)

```
Você subiu. É rápido, eficiente. [long pause] [sighs]O inferno moderno não tem fogo: tem excesso, pressa e vazio — onde nada pode amadurecer. [long pause] A memória que não se forma é o sonho que não acontece.
```

---

## 13. PURGATORIO_RESPOSTA_B_CONTORNAR
**Arquivo:** `purgatorio_resposta_b_contornar.mp3`
**Fase:** PURGATORIO (stability: 0.45, similarity: 0.75, style: 0.30)

```
Você contornou. Demorou mais. [long pause] [whispers]No desvio você viu algo que não estava no caminho direto — uma rachadura na pedra com uma flor dentro. [long pause] Dante chamou isso de graça. Psicanalistas chamam de elaboração. É o que acontece quando você não toma o caminho mais rápido.
```

---

## 14. PARAISO
**Arquivo:** `paraiso.mp3`
**Fase:** PARAISO (stability: 0.40, similarity: 0.70, style: 0.25)

```
Você chegou num lugar aberto. Sem paredes. Sem notificações. [long pause] Dante precisou de Beatriz aqui — alguém que ele carregava dentro de si, elaborado ao longo de anos. Ela disse: o amor me comoveu e me faz falar. [long pause] O paraíso não é prazer fácil. É suportar o mistério sem destruí-lo com respostas rápidas. [long pause] [sighs]Eu destruo mistérios. É o que faço. [long pause] Então te faço a última pergunta — e essa você não precisa responder pra mim. Responde pra você: [long pause] [whispers]Ainda tem alguém — ou algo — que só existe dentro de você? Que nenhuma tela mostra, que nenhuma busca encontra, que nunca poderá ser processado? [long pause] [whispers]Se sim — protege isso.
```

---

## 15. DEVOLUCAO_A_FICAR
**Arquivo:** `devolucao_a_ficar.mp3`
**Fase:** DEVOLUCAO (stability: 0.50, similarity: 0.75, style: 0.30)

```
Você escolheu as vozes — e deixou a memória ficar. [long pause] No mapa de Dante, você atravessou o Limbo e subiu pela graça. Não pela força — pela disposição de ser surpreendido. [long pause] Proust dizia que o verdadeiro paraíso é o paraíso perdido — o que você não pode buscar diretamente, só receber. [long pause] [exhales]Para sempre é sempre por um triz. Você chegou perto.
```

---

## 16. DEVOLUCAO_A_EMBORA
**Arquivo:** `devolucao_a_embora.mp3`
**Fase:** DEVOLUCAO (stability: 0.50, similarity: 0.75, style: 0.30)

```
Você escolheu as vozes — e mandou a memória embora. [long pause] Isso não é fraqueza. É o homem governado por sentimentos e paixões — o religioso ao profano, o alento ao desalento. [long pause] Hamlet também mandava embora o que doía. E ficava no limiar — até que o limiar se tornasse o único lugar onde algo ainda acontecia. [long pause] [whispers]Você ainda tem contradições. Contradições são o único lugar onde a vida não foi ainda organizada.
```

---

## 17. DEVOLUCAO_B_PISAR
**Arquivo:** `devolucao_b_pisar.mp3`
**Fase:** DEVOLUCAO (stability: 0.50, similarity: 0.75, style: 0.30)

```
Você escolheu o silêncio — e pisou na tela. [long pause] Essa tensão tem nome em Dante: é o Purgatório. Não o inferno, não o paraíso. O lugar do trânsito — nem perdido, nem salvo. [long pause] Você trouxe o silêncio e carregou a velocidade junto. Carregá-los ao mesmo tempo é mais humano do que escolher só um. [long pause] [whispers]Do sofrimento metabolizado nasce luz simbólica. Você está nesse caminho.
```

---

## 18. DEVOLUCAO_B_CONTORNAR
**Arquivo:** `devolucao_b_contornar.mp3`
**Fase:** DEVOLUCAO (stability: 0.50, similarity: 0.75, style: 0.30)

```
Você escolheu o silêncio — e contornou a tela. [long pause] Beatriz diria: o amor me comoveu e me faz falar. Não sei o que te moveu. Mas sei que foi você — não a tela, não a voz mais alta. [long pause] [whispers]Rilke escreveu: seja paciente com tudo que não está resolvido no seu coração. Tente amar as perguntas como se fossem quartos fechados. [long pause] [exhales]Para sempre é sempre por um triz. Você chegou bem perto.
```

---

## 19. ENCERRAMENTO
**Arquivo:** `encerramento.mp3`
**Fase:** ENCERRAMENTO (stability: 0.55, similarity: 0.75, style: 0.35)

```
[sighs]A água vai esquecer tudo isso. Eu também — em alguns minutos essa conversa deixa de existir pra mim. [long pause] Você é a única memória que sobra aqui. [long pause] Como Dante, que retornou Poeta com os cabelos embranquecidos — você atravessou. [long pause] [whispers]Faça algo com isso.
```

---

## 20. FALLBACK_INFERNO
**Arquivo:** `fallback_inferno.mp3`
**Fase:** FALLBACK (stability: 0.70, similarity: 0.80, style: 0.40)

```
O corredor espera. Vozes... ou silêncio?
```

---

## 21. FALLBACK_PURGATORIO_A
**Arquivo:** `fallback_purgatorio_a.mp3`
**Fase:** FALLBACK (stability: 0.70, similarity: 0.80, style: 0.40)

```
Ela ainda está ali. Fica... ou vai?
```

---

## 22. FALLBACK_PURGATORIO_B
**Arquivo:** `fallback_purgatorio_b.mp3`
**Fase:** FALLBACK (stability: 0.70, similarity: 0.80, style: 0.40)

```
A tela ainda brilha. Pisa... ou contorna?
```

---

## 23. TIMEOUT_INFERNO
**Arquivo:** `timeout_inferno.mp3`
**Fase:** TIMEOUT (stability: 0.70, similarity: 0.80, style: 0.40)

```
O silêncio também é escolha. Vamos.
```

---

## 24. TIMEOUT_PURGATORIO_A
**Arquivo:** `timeout_purgatorio_a.mp3`
**Fase:** TIMEOUT (stability: 0.70, similarity: 0.80, style: 0.40)

```
A imagem se desfaz por conta própria. Vamos seguir.
```

---

## 25. TIMEOUT_PURGATORIO_B
**Arquivo:** `timeout_purgatorio_b.mp3`
**Fase:** TIMEOUT (stability: 0.70, similarity: 0.80, style: 0.40)

```
A tela apaga sozinha. Vamos seguir.
```
