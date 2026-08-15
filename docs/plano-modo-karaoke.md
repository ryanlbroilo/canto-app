# Plano — Modo Karaokê com diagnóstico de fundamentos

> Pacote de implementação. Autocontido: dá para entregar isto a um modelo barato,
> em outro painel, sem contexto adicional.

## 0. O que é

Você põe um mp3/flac local, canta junto, e no fim o app não te dá uma nota de 0 a 100 —
ele te diz **qual fundamento está falhando**, **em que condição ele falha**, e se o
problema é você ou é a música estar fora do seu alcance.

Decisões já tomadas:

- **Só arquivo local.** Spotify e Apple Music entregam áudio por EME/DRM; o buffer chega
  opaco e não pluga em `AnalyserNode`. A API `audio-analysis` do Spotify foi descontinuada
  em nov/2024. Não há contorno — não gaste tempo tentando.
- **Separação de voz roda em CLI local**, uma vez por música. Sem upload, sem endpoint novo,
  sem ONNX pesado no browser. O app consome um `.canto.json` já pronto.
- **Karaokê completo direto**, sem fase intermediária. O diagnóstico nasce com as duas
  camadas juntas: erro contra a referência **e** análise da voz sozinha.

## 1. Por que este desenho e não outro

O app já tem mais do que parece:

| Peça existente | Papel no karaokê |
|---|---|
| `src/audio/PitchEngine.ts` | captação; `PitchFrame` já traz `centroid`, `tilt`, `h1h2`, `register`, `noteState`, `steadiness`, `dynamics`, `snr` |
| `src/audio/swiftf0-worker.ts` | F0 neural (ONNX) — **o mesmo modelo roda na CLI**, na voz isolada |
| `src/audio/perception.ts` | máquina de estado `silent/onset/sustain/release` por nota cantada |
| `src/audio/register.ts` | `peito/mix/cabeça/falsete` + evento de quebra |
| `src/audio/vibrato.ts` | taxa e extensão de vibrato a partir do contorno de F0 |
| `src/audio/songRoll.ts` | piano-roll de karaokê já desenhado, consome `TimedNote[]` |
| `src/data/adaptive.ts` | `recommendNext()` já escolhe exercício a partir de `FeatureReport` |
| `src/data/types.ts` | `SkillId` (7 skills) e `FeatureReport` já são o vocabulário do sistema |

**A única peça faltando é a fonte de referência.** Extrair melodia direto da mixagem é ruim
(transcreve guitarra e baixo junto com a voz). O caminho certo é separar a voz e rodar
**o SwiftF0 que já existe** nela: mesmo detector no cantor e na referência ⇒ mesmas unidades,
mesmos vieses, mesmos erros. A comparação fica honesta. Qualquer outro extrator introduz um
viés sistemático que você vai confundir com erro do cantor.

**Restrição de compatibilidade que amarra tudo:** a saída da CLI tem que produzir `TimedNote[]`
(`{ index, midi, startSec, endSec, lyric }`, de `src/data/songs.ts`). Com isso, `drawSongRoll`
funciona sem tocar numa linha.

## 2. Peça 1 — `scripts/import-song.mjs` (CLI)

```bash
node scripts/import-song.mjs "D:/musicas/cazuza-exagerado.mp3" --lyrics
```

Pipeline:

1. **Separar** — `demucs --two-stems=vocals -o .cache/demucs <arquivo>` → `vocals.wav`.
   Python + `pip install demucs`. Modelo `htdemucs` (padrão). ~1–3× tempo real em CPU.
   Cachear por hash do arquivo: reimportar não re-separa.
2. **Decodificar** `vocals.wav` → mono Float32 **16 kHz** (é a taxa que o SwiftF0 espera;
   veja `src/audio/Resampler16k`).
3. **F0 neural** — `onnxruntime-node` com **o mesmo `.onnx` e o mesmo pré-processamento de
   `src/audio/swiftf0-worker.ts`**. Extrair esse pré-processamento para um módulo compartilhado
   em vez de duplicar; se divergir, o karaokê inteiro mente. Saída: `midi[]` e `conf[]` a 100 fps.
4. **Limpar** — descartar frames com `conf < 0.5`; mediana de 3 (mata octave glitch);
   remover ilhas de voz < 60 ms.
5. **Segmentar em notas** — histerese sobre uma mediana **centrada** de ~200 ms (o "espinho").
   Quantizar frame a frame para o inteiro mais próximo é o caminho errado: uma nota
   sustentada com vibrato de ±80 cents em cima de 60,5 alterna entre 60 e 61 e vira sopa de
   notas. Mediana centrada (não-causal — dá para olhar o futuro, isto é offline) remove o
   vibrato e, por ser mediana, **preserva o degrau no frame exato** em que ele está, sem o
   deslocamento de meia janela que uma média móvel introduziria. Custo conhecido: notas abaixo
   de ~100 ms são absorvidas, ou seja, melisma acima de ~10 notas/s não é segmentado.
6. **Agrupar em frases** — silêncio ≥ 350 ms fecha frase.
7. **Letra (opcional, `--lyrics`)** — `faster-whisper` com `word_timestamps=True` **na voz
   isolada** (não na mixagem — a acurácia despenca). Casar cada palavra com a nota cujo
   intervalo tem maior sobreposição. Sem a flag, `lyric: ''`.
8. **Perfil de exigência** — calcular `SongDemand` (§4) aqui, é função pura das notas.
9. **Emitir** `<slug>.canto.json` em `public/karaoke/` (ou pasta que o app leia).

### Formato de saída

```ts
// src/domain/karaoke/track.ts
export interface KaraokeTrack {
  schema: 1
  id: string
  title: string
  artist: string
  /** SHA-256 do arquivo de áudio; o app recusa tocar se não bater */
  audioSha256: string
  audioFileName: string
  durationSec: number
  /** contorno contínuo da referência — necessário p/ vibrato e drift, NaN = unvoiced */
  refF0: { fps: number; midi: number[]; conf: number[] }
  /** mesma forma de TimedNote — alimenta drawSongRoll sem alteração */
  notes: TimedNote[]
  phrases: { index: number; startSec: number; endSec: number; noteIdx: number[] }[]
  demand: SongDemand
}
```

Guardar **os dois**: contorno contínuo *e* notas quantizadas. O contorno é para drift e
vibrato; as notas quantizadas são para acerto/erro. Usar o contorno para acerto/erro é um erro
clássico — cantor profissional faz bend estilístico, e você contaria ornamento como desafinação.

## 3. Peça 2 — as armadilhas (é aqui que a implementação ingênua morre)

Documentadas em ordem de quanto estragam o resultado.

### 3.1 Vazamento do playback no microfone — **fatal**
Se a música toca no alto-falante, o mic capta o disco e o F0 detecta a cantora, não você.
- **Fone de ouvido é gate duro**, não recomendação. Tela bloqueia o início sem confirmação.
- **Detecção automática:** durante os primeiros 3 s de playback com você em silêncio, medir
  correlação entre o sinal do mic e o envelope do playback. Correlação alta ⇒ abortar com
  mensagem clara. Repetir a checagem em qualquer trecho longo sem voz.
- Ligar `echoCancellation: false, noiseSuppression: false, autoGainControl: false` no
  `getUserMedia` — AGC destrói a medição de dinâmica, e o AEC do browser distorce o F0.

### 3.2 Latência — sem calibrar, todo veredito de tempo é ficção
Latência de saída + de entrada somam 40–200 ms. Sem compensar, o app vai dizer "você atrasa
sempre" e estará medindo o Windows.
- **Ritual de calibração, uma vez por dispositivo:** tocar 5 cliques, gravar pelo mic
  (com fone, o vazamento acústico basta; se não captar, pedir para bater palma no clique),
  correlacionar, obter `roundTripMs`. Persistir por `deviceId`.
- Usar `AudioContext.outputLatency` como palpite inicial, **nunca** como verdade final.
- Se a calibração não rodou: exibir métricas de afinação normalmente e **suprimir todo
  julgamento de tempo**. Melhor calar que mentir.

### 3.3 Os primeiros ~120 ms de cada nota
Todo cantor entra por baixo e sobe (*scoop*). Incluir esse trecho na média de cents faz
**toda** nota parecer baixa.
- `centsDev` da nota = mediana dos frames **a partir de 120 ms** do onset.
- O scoop vira métrica própria: `onsetCents` = mediana dos primeiros 80 ms; `settleMs` = tempo
  até entrar em ±25 cents. Isso é sinal de **afinacao/audiação**, não de sustentação.

### 3.4 Oitava
Você vai cantar uma oitava abaixo de voz feminina. Comparar em MIDI absoluto marca a música
inteira como erro.
- Acerto compara **classe de nota** (`Δ mod 12`, escolhendo o menor desvio) e o app registra
  `octaveOffset` da frase separadamente.
- Mas: se o offset **variar** entre frases, isso é erro real (perda de referência). Reportar.

### 3.5 A referência também é estimada
O SwiftF0 erra na voz separada, principalmente onde a separação deixou resíduo instrumental.
- Não pontuar notas cujo trecho de referência tenha `conf` mediana < 0.6.
- Marcar essas notas como `skipped` no relatório e mostrar a cobertura
  ("82% da música foi avaliada"). Cobertura baixa é um problema da importação, não seu.

### 3.6 O viés do detector depende da ALTURA — medido, não suposto
`npm run test:swiftf0` mede o erro do SwiftF0 contra frequências exatas. O resultado:

| D3 | A3 | E4 | A4 | E5 |
|---|---|---|---|---|
| +6,4 c | +0,5 c | −5,4 c | −9,6 c | −15,6 c |

São ~22 cents de deriva monotônica ao longo do range. Duas consequências:

- **Isto valida usar o mesmo `model.onnx` nos dois lados.** Um extrator *melhor* porém
  diferente introduziria um viés que **não** cancela na subtração. Aqui, cantor e referência
  na mesma altura cancelam exatamente.
- **Mas o viés é função da altura, não constante** — então ele *não* cancela quando você canta
  uma oitava abaixo da gravação (caso comum: voz feminina na referência). Sobram ~10 cents
  sistemáticos. Fica **abaixo** da guarda de efeito mínimo de 15 cents da §4.3, então o sistema
  já absorve. Não corrija isso com uma curva ajustada em tom sintético: o viés medido em tom
  harmônico não é o viés em voz real, e a "correção" pioraria.

### 3.7 Consoantes
Frames não-vozeados no meio de uma nota não são desafinação.
- Só entram na conta frames com `clarity` acima do limiar e `noteState !== 'silent'`.

### 3.8 Alinhamento por frase
Mesmo com latência corrigida, cantor legitimamente frasea adiantado ou atrasado.
- Por frase: correlação cruzada entre o contorno cantado e o de referência, janela ±300 ms
  ⇒ `phraseOffsetMs`.
- Erro de tempo **por nota** é medido depois de remover o offset da própria frase. Sem isso,
  uma entrada atrasada envenena a frase inteira.
- `phraseOffsetMs` consistentemente positivo em muitas frases é ele mesmo um achado
  (condução rítmica) — reportar separado.

## 4. Peça 3 — o diagnóstico (o núcleo do produto)

Nota de 0 a 100 é pedagogicamente inútil. O que importa é **em que condição o erro se concentra**.

### 4.1 Vetor por nota

Para cada nota `i` da referência, montar:

```ts
interface SungNote {
  index: number
  refMidi: number
  startSec: number; durSec: number
  // medições
  centsDev: number | null      // mediana pós-120ms, comparação mod 12
  onsetCents: number | null    // primeiros 80ms
  settleMs: number | null
  driftCentsPerSec: number|null// ajuste linear ao longo da nota (só se dur > 0.6s)
  timingMs: number | null      // pós-remoção do offset da frase
  voicedPct: number
  steadinessAvg: number        // de PitchFrame.steadiness
  dynamicsAvg: number          // de PitchFrame.dynamics
  h1h2Avg: number | null       // sopro/aperto
  centroidAvg: number | null
  register: RegisterZone | null
  skipped: boolean             // referência não confiável (§3.5)
  // condições (features da MÚSICA, não do cantor)
  posInPhrase: number          // 0..1
  phraseElapsedSec: number     // segundos desde o início da frase
  leapFromPrev: number         // semitons
  localNoteRate: number        // notas/s na janela de 2s
  relHeight: number            // 0..1 dentro do range da música
}
```

### 4.2 Tabela de atribuição

Cada linha é um predicado sobre as **condições**, medindo concentração de erro. `baseline` =
mediana de `|centsDev|` do cantor em notas sem condição especial (dur 0.4–1.0 s, sem salto,
meio da frase, meio do range).

| SkillId | Condição | Sinal que confirma |
|---|---|---|
| `sustentacao` | `durSec > 1.2` | `driftCentsPerSec < -8` (afinação **caindo** ao longo da nota) |
| `respiracao` | `posInPhrase > 0.66` **e** `phraseElapsedSec > 6` | `dynamicsAvg` cai vs. início da frase **e** `|centsDev|` sobe |
| `passaggio` | erro agrupado numa faixa de 3–4 semitons | flip de `register` ou salto de `h1h2` na mesma faixa |
| `extensao` | `relHeight > 0.85` **ou** `< 0.15`, e fora do range conhecido dele | `voicedPct` baixo ou `steadinessAvg` baixo |
| `afinacao` | `leapFromPrev >= 5` | `onsetCents` grande com `settleMs > 250` (procura a nota) |
| `vibrato` | `durSec > 1.5` | vibrato ausente, ou `rateHz` fora de 4.5–6.5, ou `extentCents > 120` |
| `ressonancia` | qualquer nota com erro | `h1h2Avg` alto (soproso) ou `centroidAvg` fora da faixa dele |

Também sem referência (valem sempre, mesmo em trecho `skipped`): quebra de registro,
colapso de dinâmica no fim da frase, distribuição das pausas de respiração.

### 4.3 Guarda de honestidade — **não negociável**

Um achado só é reportado se **todas** valerem:

1. `n >= 5` notas satisfazem a condição (e não `skipped`);
2. o efeito é `>= 15 cents` acima do `baseline` do próprio cantor;
3. a condição cobre `<= 60%` das notas da música — se cobre tudo, não é condição, é o baseline.

Sem essas três, isto vira leitura de tarot com números. Achado que não passa fica em
"sinal fraco", nunca em veredito. Preferir dizer menos.

#### O que a implementação precisou refinar (feito em `attribute.ts`)

1. **A cláusula 2 virou "efeito ≥ limiar da própria regra".** Duas das sete não são
   mensuráveis em cents e ficariam inalcançáveis: vibrato torto **não desafina** a nota (a
   mediana da oscilação continua no lugar), e a condição de `ressonancia` já é "onde houve
   erro", então cobrar dela um efeito em cents seria uma tautologia que passa na guarda por
   construção. Cada regra declara unidade e limiar; `vibrato` mede fração de notas defeituosas
   (≥ 0,6) e `ressonancia` mede excesso de H1-H2 em dB (≥ 3). As cláusulas 1 e 3 valem iguais
   para todas.
2. **Nova causa de rejeição: `sem-baseline`.** Sem notas comuns suficientes (≥ 5) não existe "o
   normal dele", e nenhuma regra em cents pode ser reportada. Era um buraco da §4.3 original.
3. **Nova causa de rejeição: `sem-sinal`.** H1-H2 e centróide só existem no backend WASM. Uma
   regra que dependa deles devolve explicitamente "não sei" em vez de sumir — se sumisse, o
   relatório num aparelho sem WASM diria "está tudo bem" sobre algo que nunca foi medido.
4. **`register` não entrou no `SungNote`.** O `passaggio` confirma por salto de H1-H2. Motivo: o
   `register` também é exclusivo do WASM, e a regra já degrada de forma honesta pelo item 3.
5. **`vibrato` por nota entrou no `measure.ts`** (`VIBRATO_MIN_SEC = 1.5`), medido no corpo da
   nota — o ataque fica de fora de propósito, porque um scoop é uma rampa e entra na
   autocorrelação como meio ciclo de vibrato lentíssimo. Nota curta devolve `null`, que é
   diferente de `{ present: false }`; confundir os dois transformaria toda nota curta em "sem
   vibrato".
6. **Bug achado pelos testes:** a varredura de faixas do `passaggio` parava em `hi - largura` e
   nunca examinava as notas mais agudas da música — justamente onde uma passagem costuma estar.
7. **`extensao` usa a extensão ABSOLUTA do baseline** (`lowMidi`/`highMidi`), não a tessitura
   confortável. É a escolha conservadora: nota dentro do alcance já medido nunca vira achado.
8. **Não implementado:** "distribuição das pausas de respiração" (§4.2, último parágrafo). O app
   não detecta respiração — os silêncios da referência são o fraseado da MÚSICA, não as
   inspirações do cantor. Ficaram os outros dois sinais sem referência (mudez nos extremos e
   colapso de dinâmica no fim das frases).
9. **Deixado na mesa de propósito:** o baseline já guarda `passaggioMidi` medido por sirene.
   Usá-lo como confirmação alternativa do `passaggio` seria um sinal melhor que o H1-H2 — mas
   afrouxa a guarda, e afrouxar guarda sem teste dedicado é como esta seção inteira deixa de
   valer.

### 4.4 Perfil de exigência da música

Calculado na CLI, função pura das notas. Cada campo em 0..1:

```ts
interface SongDemand {
  extensao: number      // semitons de range vs. 12 (típico) → normalizado
  sustentacao: number   // fração de notas com dur > 1.2s
  respiracao: number    // duração mediana das frases vs. 6s
  afinacao: number      // densidade de saltos >= 5 semitons
  passaggio: number     // fração de notas cruzando a zona de passagem do TIPO VOCAL dele
  vibrato: number       // fração de notas > 1.5s com vibrato na referência
  ressonancia: number   // proxy: tessitura alta sustentada
  tessituraMidi: { lo: number; hi: number; medianaSec: number }
}
```

### 4.5 Veredito — "é você ou é a música?"

Este é o passo que separa diagnóstico de ladainha.

```
para cada skill com achado significativo:
  demand     = track.demand[skill]
  capability = estimateCapability(skill, histórico de sessões)   // 0..1

  se demand > capability + 0.2:
    → "A música exige <skill> acima do que você treinou. Não é erro seu."
    → ação: transpor (se extensao/passaggio) OU sugerir música mais leve
  senão:
    → déficit real
    → recommendNext({ lastReport, focusSkill: skill })
    → se |efeito| > 40 cents: forçar level abaixo do atual → "volta pro básico"
```

Sem esta bifurcação, o app vai te acusar de desafinar numa música que está simplesmente
três semitons fora do seu alcance — e você vai parar de usar.

#### O que a implementação precisou refinar

1. **O pseudocódigo acima erra o caso que ele existe para pegar.** `demand.extensao` normaliza a
   LARGURA da melodia, não a altura dela. Uma música de dez semitons inteiramente três semitons
   acima do seu agudo tem `demand.extensao ≈ 0.1` — baixíssima — e a comparação `demand >
   capability + 0.2` concluiria "é você" exatamente na situação em que não é. O encaixe absoluto
   virou uma pergunta separada e ANTERIOR (`rangeFit`), sobre alturas em MIDI, não sobre 0..1.
2. **O encaixe SUSPENDE a bifurcação, não participa dela.** Quando a música não cabe, todo eixo
   fica `indefinido / fora-do-alcance`: espremido no teto da própria extensão qualquer um
   desafina, perde ar e aperta a ressonância. Listar cinco déficits ali seria inventar cinco
   causas para um efeito só. A única saída acionável é a transposição — e ela sai do mesmo
   cálculo, por varredura de ±12 semitons minimizando o estouro, com `residual > 0` denunciando
   quando a música é mais larga que a voz e transpor não resolve.
3. **`estimateCapability()` não usa `SkillProgress.level`.** Aquele nível vem de `levelForXp` e é
   ilimitado: mede VOLUME de prática, não dificuldade. Duas mil repetições de um exercício de
   iniciante o levam às alturas sem provar nada. A capacidade usa o `TrackLevel` (a dificuldade
   em que o acerto recente foi conseguido) via `TRACK_DIFFICULTY`, mais `last5Avg` como peso.
4. **`desconhecido` é estado de primeira classe, nunca zero.** Sem baseline medido não há
   extensão; com menos de três sessões não há histórico. Nos dois casos o veredito se cala em vez
   de chutar — um zero disfarçado acusaria todo usuário novo de tudo.
5. **`passaggio` e `ressonancia` não têm veredito.** Não existe eixo de exigência calculável a
   partir da música sozinha para eles (dependem do tipo vocal), então saem sempre como
   `indefinido / sem-eixo` em vez de receberem um lado inventado.
6. **"Voltar pro básico" não é disparado pelo tamanho do efeito.** O gatilho é falhar num eixo que
   a música QUASE NÃO COBRA (`demand < 0.35` com a conta caindo do lado do cantor) — que é
   exatamente a pergunta original: se eu erro onde a música nem exige, o degrau é meu.
7. **A corrida devolve UMA tarefa.** Os achados já vêm ordenados por força; o primeiro que
   sobrevive ao veredito vira exercício e os outros ficam como leitura. Sair de uma música com
   cinco deveres é sair sem nenhum.

## 5. Peça 4 — telas

Três, nessa ordem:

1. **Importar / escolher música** — lista os `.canto.json` disponíveis; seletor do arquivo de
   áudio local (`<input type="file">` + `URL.createObjectURL`), validando o `audioSha256`.
   Gate de fone de ouvido + estado da calibração de latência.
2. **`KaraokePlayer.tsx`** — reusa `drawSongRoll` sem alteração, com playback do `<audio>` como
   relógio-mestre (`currentTime`, não `performance.now()`). Letra sílaba-a-sílaba se importada.
   Ao vivo, mostrar **pouco**: nota atual, desvio, e a linha. Diagnóstico é no fim, não durante —
   feedback de erro em tempo real durante o canto piora a performance.
3. **Relatório** — o veredito em cima ("é você / é a música"), depois no máximo **3** achados
   com a condição em português claro ("sua afinação cai 22 cents em notas acima de 1,2 s"),
   um gráfico por achado, e um botão levando ao exercício que `recommendNext()` devolveu.

Ao implementar qualquer uma delas: **carregar a skill `impeccable` antes**, e checar `ui-kits`
antes de escrever gráfico do zero.

## 6. Persistência

- `VocalSession` já tem `kind`, `exerciseId`, `notesHitPct`, `avgCentsDev`, `featureReport`.
  Karaokê entra como `kind: 'karaoke'`, `exerciseId: <trackId>`.
- `FeatureReport` ganha um bloco opcional `karaoke` com `{ coveragePct, phraseOffsetMs,
  octaveOffset, findings: Finding[], demand, verdict }`. Opcional ⇒ não quebra nada existente.
- **A invariante fica de pé:** nenhum áudio sai do cliente. A separação roda na sua máquina,
  o app manda só números, e a EVA continua recebendo apenas o JSON de features.
- Migration Prisma: só se `kind` for enum restrito. Se for `String`, nada a fazer.

## 7. Ordem de execução

| # | Entrega | Depende de | Peso | Estado |
|---|---|---|---|---|
| 1 | Núcleo compartilhado SwiftF0 (`src/audio/swiftf0-core.ts`) + worker consumindo ele | — | baixo | **feito** |
| 2 | `scripts/import-song.ts` emitindo `notes[]` + `refContour` | 1 | **alto** | **feito** (falta rodar com demucs numa música real) |
| 3 | Calibração de latência + detector de vazamento (lógica) | — | médio | **feito**, com a UI de calibração e o gate de fone em `/karaoke`. O `BleedDetector` continua **sem ligação** — ver a nota abaixo |
| 4 | `KaraokePlayer.tsx` tocando e desenhando o roll (sem diagnóstico) | 2, 3 | médio | **feito** — `/karaoke` (preparo em 4 passos) e `/karaoke/:id` (palco), reusando `drawSongRoll` sem tocar nele |
| 5 | Alinhamento por frase + `SungNote[]` | 4 | **alto** | **feito** — o núcleo é puro e não dependia do player |
| 6 | `SongDemand` na CLI + `estimateCapability()` | 2 | médio | **feito** — `src/domain/karaoke/capability.ts` + ponte `src/data/karaoke-capability.ts`, 16 testes em `npm run test:capability` |
| 7 | Tabela de atribuição + guarda de honestidade | 5 | **alto** | **feito** — `src/domain/karaoke/attribute.ts`, 26 testes em `npm run test:attribution` |
| 8 | Veredito + ponte para a biblioteca de exercícios | 6, 7 | médio | **feito** — `src/domain/karaoke/verdict.ts` + `src/data/karaoke-next.ts`, 22 testes em `npm run test:verdict`. **Não** passa por `recommendNext()` — ver a nota abaixo |
| 9 | Tela de relatório | 8 | médio | a fazer |
| 10 | Letra via faster-whisper (`--lyrics`) | 2 | baixo | a fazer |

**Nota sobre o `BleedDetector` (item 3).** Ele está escrito e testado, mas não ligado ao player.
Ligar exige uma derivação do áudio CRU do microfone, e o `PitchEngine` só expõe frames já
analisados — o envelope do lado do mic não existe na API atual. Meio-ligado seria pior do que
desligado: com menos de 100 pontos o detector devolve `bleeding: false`, que significa "ainda não
sei" e seria lido na tela como "está limpo". Enquanto isso, o gate de fone do passo 4 é a única
defesa contra vazamento, e ela depende de o cantor não mentir para si mesmo.

**Nota sobre a ponte do item 8.** O plano previa `recommendNext({ lastReport, focusSkill })`, mas
`RecommendArgs` não tem `focusSkill`, e acrescentar um seria distorcer o roteador: `recommendNext`
é a cascata de prioridades do treino GERAL — ele decide sozinho o que importa hoje. No karaokê a
skill já foi decidida pela música; o que falta é escolher o exercício. Então `karaoke-next.ts`
chama `pickExercise({ skills, level })` direto e monta o motivo com a evidência da corrida ("nas
notas longas: 19 cents pior que o seu normal"), que é justamente o que uma frase genérica do
roteador não conseguiria dizer. `trackLevelForCompleted()` foi exportado de `adaptive.ts` para os
dois lados usarem a mesma régua de nível.

Os itens 5 e 7 são os caros que sobraram — não delegue esses dois para modelo barato sem
revisão. 3, 4, 6, 9 e 10 são especificados o bastante para ir direto.

### O que já dá para rodar

```bash
npm run test:karaoke     # 15 testes das funções puras (segmentação, frases, exigência)
npm run test:swiftf0     # extrator de referência contra frequências exatas + viés medido
npm run test:align       # 15 testes de alinhamento de frase, medição por nota e vibrato
npm run test:latency     # 7 testes de calibração de latência e detector de vazamento
npm run test:attribution # 26 testes da tabela de atribuição e da guarda de honestidade
npm run test:capability  # 16 testes da capacidade do cantor e da ponte com o histórico
npm run test:verdict     # 22 testes do veredito "é você ou é a música" e da transposição
npm run import:song -- "caminho/musica.mp3" --title "T" --artist "A"
```

`import:song` exige `demucs` no PATH (`pip install -U demucs`, Python 3.8+, baixa ~300 MB de
modelo na primeira vez). A separação é cacheada por hash em `.cache/karaoke/`, então reimportar
não re-separa. As faixas importadas e o cache estão no `.gitignore`: um `.canto.json` é a
transcrição da melodia de uma gravação comercial, e uso próprio é uma coisa — publicar num repo
é outra.

## 8. Extra que muda muito e custa pouco

**Transposição do playback (±3 semitons).** `soundtouchjs` ou `rubberband-wasm` num
`AudioWorklet`, deslocando o pitch sem mexer no andamento; as notas de referência deslocam pelo
mesmo Δ. Você passa a cantar a música no *seu* tom em vez de forçar o tom da gravação — que é a
causa nº 1 de "erro" que não é erro. Se for fazer só uma coisa além do núcleo, faça esta.
