# Fundamentação Acadêmica & Estado da Arte
### Base de P&D para `[NOME_PLATAFORMA]` — Plataforma de Treino Vocal com IA

> Documento complementar ao PRD. Objetivo: fechar o P&D com base na literatura científica, para construir sobre fundamento validado e não sobre achismo. Compila a pesquisa de campo acadêmica, o framework conceitual da área, os achados que embasam decisões de produto, os gaps onde há espaço para inovar, e a análise jurídica de repertório. Todas as decisões de produto no PRD que puderem ser rastreadas até aqui estão mais seguras.

---

## 1. O framework que define a arquitetura: ASA vs SIP

A referência central é o survey de **dos Santos, A. N. & Masiero, B. S. (2026), "A Survey on 30+ Years of Automatic Singing Assessment and Singing Information Processing"** (UNICAMP, arXiv:2601.12153) — a revisão mais completa e recente da área, feita no Brasil. Ele organiza 30+ anos de pesquisa em dois paradigmas:

**ASA — Automatic Singing Assessment.** Avalia a performance via análise baseada em *metadados*: extrai e compara valores de pitch (F0) contra referências. Não processa o sinal vocal bruto nem isola a voz. É a abordagem da maioria dos apps comerciais (Vanido, Yousician, Singing Carrots). Leve, roda no cliente, tecnologia madura.

**SIP — Singing Information Processing.** Paradigm shift proposto por Goto et al. (2010): trata o canto como *dado*, analisando o sinal vocal real e comparando o sinal preditor (voz do usuário) diretamente com um sinal alvo de referência (ex.: vocais isolados de uma gravação comercial). Introduz o desafio pesado da **separação de fonte** (isolar a voz do usuário do ruído E isolar vocais de músicas comerciais do instrumental).

### Implicação direta para o produto
- **O MVP é ASA:** pitch do usuário vs. melodia-guia. Resolvido, viável, client-side.
- **Comparar com a gravação comercial original (o "sonho Spotify") é SIP**, e depende de separação de fonte — listado pelos autores como problema em aberto. É a fase 3, não o MVP.
- Marcos históricos que valem conhecer: **SINGAD** (1988, primeiro sistema ASA, feedback visual de pitch), **ALBERT** (adicionou closed quotient laríngeo, SPL, jitter, shimmer), **WinSINGAD** (suite completa de displays), **MiruSinger** (2007, inaugurou SIP comparando F0 do usuário com F0 de CD comercial).

---

## 2. A ciência do biofeedback visual (por que a abordagem funciona)

A eficácia do feedback visual em tempo real (VFB) é das coisas mais bem estabelecidas da área. Referências-chave:

- **Welch, G. F., Howard, D. M. & Rush, C. (1989)**, "Real-time visual feedback in the development of vocal pitch accuracy in singing", *Psychology of Music* 17(2). O estudo seminal. Estabeleceu que VFB melhora precisão de pitch.
- **SINGAD (Welch et al., 1988):** alunos usando o sistema, *mesmo sem supervisão adulta*, melhoraram mais do que via ensino tradicional professor-aluno. **Valida diretamente o caso de uso "autodidata com app".**
- **Wilson, P. H. et al. (2008)**, "Learning to sing in tune: does real-time visual feedback help?": grupos experimentais (grid-based e keyboard-style) melhoraram precisão significativamente em cents; grupo de controle não teve progresso mensurável.
- **Paney, A. S. & Kay, A. C. (2015)** e **Paney & Tharp:** feedback concorrente em jogo de computador melhora pitch-matching.

### Por que o feedback visual é necessário (a base fisiológica)
O cantor **não consegue se ouvir com precisão** enquanto canta. O som chega aos ouvidos por dois caminhos: condução aérea e condução óssea, e a condução óssea age como filtro passa-baixa, amplificando graves (Reinfeldt et al., 2010). Por isso a voz soa "mais cheia" dentro da cabeça do que na gravação — o fenômeno da *voice confrontation* (Holzman & Rousey, 1966). O VFB resolve isso dando um dado objetivo que contorna os ouvidos que enganam.

### Nota motivacional relevante ao produto
Menos de **5% da população** tem amusia clínica ("desafinação" real de nascença) — Peretz & Vuvan (2017). Os outros 95% que "acham que não sabem cantar" só têm uma conexão não treinada entre ouvido e laringe (Hutchins & Peretz, 2012; Pfordresher & Brown, "poor-pitch singing in the absence of tone deafness"). **Canto é habilidade motora treinável, não dom.** Isso é copy de marketing E verdade científica.

---

## 3. Dois achados que viram requisitos de design (não ignorar)

**(a) Feedback precisa de "Knowledge of Results" (KR), não só um traço visual.**
Welch demonstrou que VFB *sem* KR (sem comunicar certo/errado) **não melhora** o pitch-matching. E há um efeito contraintuitivo: a performance às vezes *piora enquanto* o usuário olha a tela (porque exige atenção visual), mas *melhora em testes de retenção*. 
→ **Requisito:** o pitch display não pode ser só uma linha bonita seguindo a voz. Precisa comunicar acerto/erro de forma inequívoca (cor, zona-alvo). E o objetivo final é a **transferência** — cantar afinado *sem* a tela. KPI real: o usuário consegue afinar de olhos fechados depois de treinar?

**(b) Pitch certo com mecanismo errado é a armadilha do placar.**
Um cantor pode acertar o pitch enquanto força o pescoço, levanta a laringe e usa timbre nasal. Um tracker de pitch simples dá "check verde", reforçando má técnica. Este é o gap que separa app de placar de app de coach — e a justificativa científica direta para a feature de **diagnóstico de registro** (peito/mix/cabeça/falsete). O sistema ALBERT já media closed quotient laríngeo e spectral ratio justamente porque pitch sozinho é insuficiente para avaliar qualidade vocal.

---

## 4. Algoritmos e features (o toolkit técnico validado)

### Detecção de pitch (F0)
Ordem de sofisticação, com uso documentado na literatura de apps de canto:
- **YIN** (de Cheveigné & Kawahara, 2002): usado no Cantus e em sistemas de karaoke scoring. Bom baseline para voz monofônica.
- **Autocorrelação / McLeod (MPM):** clássicos, rodam em JS, compiláveis para WASM.
- **CREPE** (Kim et al., 2018): deep learning via TensorFlow.js. Usado no TuneIn (Rosenzweig et al., 2020) para pitch em tempo real com piano roll. Melhor precisão nos extremos (>C5 e graves), onde autocorrelação sofre. Custo computacional maior.
- **Detecção de onset/offset** (Faghih et al., 2022): delays de 46–230ms em tempo real — referência para latência aceitável.

### Features além do pitch (o caminho para o diferencial)
O survey aponta que os apps atuais usam quase só features de baixo nível (pitch, ritmo, dinâmica, vibrato). Para capturar qualidade e expressividade, a literatura de MIR sugere incorporar:
- **Representações harmônicas:** chromagramas.
- **Espectrais auditivas:** espectrogramas Bark, Mel, Gammatone.
- **Cepstrais:** MFCC, BFCC, GTCC.
- **Estabilidade:** jitter, shimmer, Noise-to-Harmonic Ratio (medidos pelo ALBERT desde os anos 90).
- **Para registro (peito/mix/cabeça/falsete):** análise de formantes e razão harmônica — não só F0. É P&D de verdade, tratar como moat de longo prazo.

### Expressividade via AI (fronteira)
- **ASR** (wav2vec 2.0, Baevski et al., 2020) para avaliar precisão lírica.
- **SER — Song Emotion Recognition** para quantificar expressividade emocional.
- **Deep metric learning** (Zhang et al., 2021, "Learn by referencing"): triplet network que mapeia performance boa perto de uma referência — abordagem promissora para "quão perto do ideal você chegou".

---

## 5. A fronteira generativa (features futuras, com ressalva)

O paper **Nachmani & Wolf, "Unsupervised Singing Voice Conversion"** (Facebook AI / Tel Aviv) demonstra conversão de voz cantada sem supervisão (sem letra, sem notas, sem samples paralelos), com 5–30 min de áudio por cantor, atingindo MOS de naturalidade ~4.0. Abre portas para features como "ouça como você soaria com a técnica X" ou conversão de timbre.

**Ressalva técnica honesta:** o paper é de 2019 e usa WaveNet. O estado da arte hoje (RVC, so-vits-svc, modelos de difusão) é muito superior. Use-o como *prova de conceito* de que conversão vocal neural funciona, não como base de implementação. E cuidado com o uso: conversão de voz tem implicações éticas/legais (deepfake vocal) — manter estritamente no domínio de "sua própria voz melhorada", nunca imitar terceiros.

O paper **Zhang, B. (2026), Música Hodie** (que testou ChatGPT, LANDR, DeepSinger, VOCALOID para treino vocal) reforça o argumento central: ChatGPT teve o pior desempenho (84.8) porque lida só com teoria, enquanto ferramentas que geram/processam áudio (VOCALOID 97.3, DeepSinger 95.0) desenvolveram melhor as habilidades práticas. **Conclusão que valida a arquitetura do PRD:** LLM sozinha não ensina a cantar. O valor da IA está em interpretar o que o DSP mede e personalizar — não em "ouvir" o áudio.

> Nota crítica sobre o paper da Música Hodie: o rigor metodológico é questionável (survey de 1 dia via WeChat, amostra de 15–17 anos, estatísticas que não fecham — "65% advanced + 45% above-average" soma 110%). Vale como *sinal* e para citar a validação dos gaps, mas não como evidência forte. Tratar com ceticismo saudável.

---

## 6. Os gaps de pesquisa = mapa do diferencial

Os autores do survey da UNICAMP listam explicitamente onde a área ainda é fraca. Cada gap é uma oportunidade:

1. **Separação de sinal (preditor e alvo).** Mitigar ruído convolutivo (reverberação), aditivo (música de fundo) e competitivo (plateia). E, para SIP, isolar vocais de gravações comerciais. Fronteira: "Machine Hearing" com Wave-U-Net e 2D deep U-Net (Jansson et al., 2017). **É o pré-requisito técnico do "sonho Spotify".**
2. **Frameworks de avaliação padronizados** — não existem. Espaço para definir métricas próprias.
3. **Features de MIR subutilizadas** — quase ninguém usa o espectro completo (chroma, Bark/Mel/Gammatone, cepstrais).
4. **Expressividade artística via AI** — ASR para letra, SER para emoção. Praticamente inexplorado em produtos.
5. **Diagnóstico de registro** (inferência do documento, reforçado por ALBERT) — ninguém no mercado consumer faz. O maior diferencial defensável.

---

## 7. Análise jurídica: repertório e áudio de referência

### O que NÃO fazer (zona vermelha, não cinza)
**Spotify:** os Developer Terms proíbem explicitamente (a) usar conteúdo do Spotify para treinar/alimentar modelos de ML/IA, (b) ripping ou captura de conteúdo transmitido (com obrigação de cooperar na perseguição de violações), (c) criar derivative works e reverse-engineering. Streaming só para Premium, e ainda assim como stream protegido por DRM — **sem acesso ao PCM, logo impossível rodar pitch detection sobre ele.** Em nov/2024 deprecaram audio-features, audio-analysis e preview URLs de 30s para apps novos; Extended Quota Mode exige org com 250k MAU. **Conclusão: inviável legal e tecnicamente. Não construir sobre isso.**

**YouTube:** baixar áudio viola o ToS. A IFrame API dá playback, não o buffer de áudio (mesma limitação técnica do Spotify).

### A distinção jurídica que salva o projeto
Uma música tem **dois direitos autorais separados**: (a) a **composição** (melodia + letra — do compositor/editora) e (b) a **gravação master** (a performance gravada específica — da gravadora). Yousician, Smule e Simply Sing licenciam/recriam a *composição* e usam seus *próprios* backing tracks. Nunca o master do Spotify.

### Caminho recomendado (em ordem de viabilidade)
1. **Melodia-guia (MIDI ou sintetizada)** da composição — é ASA, é o que o Singing Carrots faz, é o caminho do MVP. Fontes: MIDIs de domínio público, geração procedural a partir de cifra (o Brasil tem o Cifra Club como fonte massiva de cifras).
2. **Áudio que o usuário sobe** (que ele possui) — responsabilidade dele, mas atenção ao risco de virar vetor de pirataria.
3. **Backing tracks próprios ou composição licenciada** (fase futura) — criar/licenciar o instrumental, nunca o master.
4. **SIP com gravação comercial** (o "sonho") — só faz sentido no longo prazo, e exige resolver separação de fonte + licenciamento. Topo da montanha.

---

## 8. Tradução para decisões de produto (o resumo executivo)

| Achado científico | Decisão de produto |
|---|---|
| VFB funciona mesmo sem professor (SINGAD) | O produto autodidata é cientificamente válido |
| VFB sem KR não melhora pitch | Pitch display precisa comunicar acerto/erro, não só um traço |
| Objetivo é transferência (cantar sem a tela) | KPI = afinar de olhos fechados; não criar dependência da tela |
| Pitch certo ≠ técnica certa | Diagnóstico de registro é o diferencial, não firula |
| Respiração melhora pitch em 21% (Piao & Xia) | Respiração é módulo central, não preliminar chato |
| <5% é amusia real | Copy: "canto é treinável, não dom" (verdade + marketing) |
| LLM só faz teoria (Música Hodie) | EVA interpreta o DSP, não "ouve" o áudio |
| SIP exige separação de fonte (gap aberto) | Comparar com música comercial = fase 3, não MVP |
| Spotify proíbe ML + ripping + DRM sem PCM | Repertório via melodia-guia/MIDI, nunca master do Spotify |

---

## 9. Bibliografia essencial

**Survey central (ler primeiro):**
- dos Santos, A. N. & Masiero, B. S. (2026). A Survey on 30+ Years of Automatic Singing Assessment and Singing Information Processing. arXiv:2601.12153.

**Biofeedback e pedagogia:**
- Welch, G. F., Howard, D. M. & Rush, C. (1989). Real-time visual feedback in the development of vocal pitch accuracy in singing. *Psychology of Music* 17(2), 146–157.
- Wilson, P. H., Lee, K., Callaghan, J. & Thorpe, C. W. (2008). Learning to sing in tune: does real-time visual feedback help? *Journal of Interdisciplinary Music Studies* 2.
- Hoppe, D., Sadakata, M. & Desain, P. (2006). Development of real-time visual feedback assistance in singing training: a review. *Journal of Computer Assisted Learning* 22(4).
- Lã, F. M. & Fiuza, M. B. (2022). Real-time visual feedback in singing pedagogy: current trends and future directions. *Applied Sciences* 12(21).
- Paney, A. S. & Kay, A. C. (2015). *Update: Applications of Research in Music Education* 34(1).

**Fisiologia e percepção:**
- Reinfeldt, S. et al. (2010). Hearing one's own voice during phonation. *JASA* 128(2).
- Peretz, I. & Vuvan, D. T. (2017). Prevalence of congenital amusia. *European Journal of Human Genetics* 25(5).
- Hutchins, S. & Peretz, I. (2012). A frog in your throat or in your ear? *J. Exp. Psychology: General* 141(1).

**Algoritmos e processamento:**
- de Cheveigné, A. & Kawahara, H. (2002). YIN, a fundamental frequency estimator for speech and music. *JASA* 111(4).
- Kim, J. W. et al. (2018). CREPE: a convolutional representation for pitch estimation. arXiv:1802.06182.
- Faghih, B. et al. (2022). A new method for detecting onset and offset for singing in real-time and offline environments. *Applied Sciences* 12(15).
- Jansson, A. et al. (2017). Singing voice separation with deep U-net convolutional networks. ISMIR.
- Piao, Z. & Xia, G. (2022). Sensing the breath: a multimodal singing tutoring interface with breath guidance. NIME.

**Avaliação avançada e generativo:**
- Zhang, H. et al. (2021). Learn by referencing: towards deep metric learning for singing assessment. ISMIR.
- Bonada, J., Loscos, A. & Mayor, O. (2006). The singing tutor: expression categorization and segmentation. AES Convention 121.
- Nachmani, E. & Wolf, L. (2019). Unsupervised Singing Voice Conversion.
- Zhang, B. (2026). Exploring the generative AI art technologies in vocal training. *Música Hodie* 26 (usar com ceticismo metodológico).

**Jurídico:**
- Spotify Developer Terms & Developer Policy (developer.spotify.com/terms, /policy) — proibição de ML training, ripping, derivative works.

---

*Documento vivo. Conforme o P&D avança, atualizar especialmente as seções 4 (algoritmos, à medida que se testa YIN vs CREPE em WASM) e 6 (gaps, à medida que se decide qual atacar primeiro como moat).*
