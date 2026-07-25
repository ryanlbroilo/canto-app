# Análise de Mercado e Decisão Go/No-Go — 25/07/2026
### Documento vivo nº 4 · A pergunta: vale a pena, ou cancela?

> **O que é isto.** Uma análise adversarial — feita para *tentar matar* o projeto, não para vendê-lo.
> A pergunta do fundador foi literal: *"o gap é real? vale ser o Duolingo do canto? ou teremos
> problemas insolucionáveis de tecnologia? se sim, começo o nativo mobile. se não, cancelo."*
>
> **Resposta curta, sem rodeio:**
> 1. O gap de **produto** é real. O gap de **mercado** é bem menor do que os docs anteriores sugerem.
> 2. A tecnologia **não é o problema** — os riscos técnicos são solucionáveis e você já retirou a
>    maior parte deles (o núcleo DSP existe e funciona).
> 3. **"Duolingo do canto que explode nas lojas" é a premissa errada e vai falhar.** Não por
>    execução ruim — por uma restrição física do canto que nenhuma tecnologia resolve.
> 4. **Não cancele o projeto. Cancele *essa versão* do projeto.** Há um caminho com evidência
>    a favor, e ele é validável em 8 semanas sem escrever uma linha de código nativo.

---

## 1. O que os números dizem (e o que eles não dizem)

### 1.1 O cemitério da categoria

Nenhum app de **aprender a cantar** jamais explodiu. Isso não é opinião — é o padrão de todos os
comparáveis que consegui verificar:

| App | Escala real | Leitura |
|---|---|---|
| **Riyaz** (Índia, MusicMuni Labs) | 2,7M downloads · **150k MAU** · **25k pagantes** · US$1,33M levantados em 3 rodadas ao longo de ~7 anos | O comparável mais importante do documento. Ver §1.2. |
| **Vanido** | Ainda na versão **0.3.0** em mai/2026, ~8 anos após o lançamento | Estagnado. Citado no PRD como concorrente; é um app zumbi. |
| **Vocaberry** | ~100k+ downloads, nota 3,7 | Um dos "líderes" da categoria. 100k downloads é *nada*. |
| **Yousician** (todos os instrumentos) | ~100k downloads/mês e ~US$600k/mês (estimativa Sensor Tower, fev/2026); 20M+ MAU somados com o GuitarTuna | Canto é prato secundário. O dinheiro deles é violão. |
| **Vocal Image** (voz **falada**) | **US$12M ARR** (ago/2025) · 4M downloads · 50k pagantes · **ARPPU ~US$240/ano** · seed de US$3,6M liderada pela Educapital | O contraste que importa. Ver §1.3. |

### 1.2 Riyaz é o experimento que já foi feito — e o resultado foi morno

Riyaz é a versão indiana exata da sua tese: mercado emergente enorme, cultura em que cantar é
central, repertório local (carnático, hindustani, devocional, Bollywood), tecnologia de pitch
própria, preço local (₹499–1.999). A palavra *riyaz* significa literalmente "prática diária" — o
hábito que o Duolingo precisa criar já é parte da cultura ali.

Resultado depois de ~7 anos: **150k MAU e 25k pagantes.** Levantaram US$1,33M no total, o que
significa que nenhum fundo viu ali um foguete.

Note que os *ratios* deles são **bons**: MAU → pagante ≈ 16%, o que é excelente para freemium. O
problema não é o funil. **O problema é o topo do funil.** A categoria simplesmente não tem gente
suficiente disposta a instalar e voltar.

> Se o melhor caso possível (país com cultura de prática vocal diária, produto bom, 7 anos de
> execução) dá 150k MAU, o seu caso-base no Brasil não é maior. É menor.

### 1.3 Dentro de "voz", o dinheiro está na FALA, não no canto

Riyaz e Vocal Image têm ordem de grandeza parecida de downloads (2,7M vs 4M). A receita difere em
mais de **10×**. A diferença não é qualidade de produto nem DSP — é *para que serve a voz*:

- **Voz falada** = carreira, liderança, sotaque, feminização/masculinização vocal, recuperação
  pós-AVC. Isso é **identidade e trabalho**. Gente paga US$240/ano por isso sem piscar.
- **Canto** = hobby. Discricionário. Primeiro item a ser cortado da fatura.

Isso não é um argumento para pivotar (§5.3), mas é o fato mais importante desta análise: **seu
núcleo de DSP vale mais do que o app de canto que você planejou construir em cima dele.**

### 1.4 O Brasil piora a matemática, não melhora

- Brasil está entre os mercados de **maior volume de download e menor ARPU** do mundo — junto com
  Índia e Indonésia. Alto volume de instalação, receita por usuário baixa e imprevisível.
- O e-learning latino-americano vai a US$16B até 2026 (Brasil ~US$4,5B em 2023) — **mas isso é
  mercado de *curso*, não de *app de assinatura*.** O brasileiro paga R$297 parcelado num curso da
  Hotmart com promessa de transformação; ele não paga R$29/mês recorrente por um app de hobby.
  São comportamentos de compra diferentes, e o segundo é muito mais raro aqui.

A matemática crua do caminho consumidor-BR, com números otimistas:

```
100.000 downloads (isso já é um sucesso enorme na categoria)
  ×  5%  → 5.000 MAU        (taxa do Riyaz)
  × 10%  → 500 pagantes     (acima do Riyaz, sendo generoso)
  × R$29 → R$14.500/mês bruto
  − 15-25% loja, − infra, − impostos  → ~R$10k/mês líquido
```

**R$10k/mês depois de anos de trabalho e 100k downloads.** Isso é uma renda extra, não uma empresa.
E esse é o cenário *bom*.

---

## 2. Por que "Duolingo do canto" é a analogia errada

Esta é a parte que mais importa, e nenhum dos documentos anteriores enfrenta.

O Duolingo funciona por quatro razões — e **o canto viola as quatro**:

| Duolingo | Canto |
|---|---|
| **Utilidade quase obrigatória** (escola, emprego, imigração, viagem) | Hobby puro. Zero pressão externa. |
| **TAM de bilhões** de pessoas que *precisam* de um idioma | Nicho de quem quer cantar melhor *e* acha que precisa de ajuda |
| **Meta extrínseca e verificável** (fluência, prova, entrevista) | Nenhum diploma, nenhuma prova, nenhum empregador cobrando |
| **A sessão é SILENCIosa e portátil** — metrô, cama, fila do banco, 3 minutos | **A sessão exige fazer barulho alto, sozinho, num lugar quieto** |

A quarta linha é a assassina, e é **física, não de produto**. Nenhuma tecnologia resolve.

Os 52,7 milhões de DAU do Duolingo (Q4/2025, +36% a/a) existem porque a sessão cabe em qualquer
buraco de 3 minutos do dia de qualquer pessoa. Uma sessão de canto exige:

1. Um lugar onde você possa **fazer barulho** (elimina metrô, escritório, ônibus, apartamento às 23h,
   casa compartilhada, casa com bebê dormindo);
2. Um lugar **silencioso o bastante para o microfone** (mesma restrição, agora pelo lado técnico);
3. **Vulnerabilidade** — a maioria das pessoas tem vergonha de se ouvir cantando mal, mesmo sozinha.

**Consequência direta para o produto:** o motor de streak/hábito diário — que é o coração do modelo
Duolingo e está no MVP do PRD (§5.1, item 6) — está lutando contra a física. O teto realista de
frequência não é diário. É 2 a 4 vezes por semana, em janelas específicas. Projete para sessões
semanais profundas com ritual, não para o micro-hábito diário. Um streak diário que o usuário
*estruturalmente não consegue cumprir* gera culpa e churn, não retenção.

**E ainda tem isto:** o Duolingo colocou Música como um dos motores de crescimento declarados para
2026, rumo a 100M DAU. Música e matemática ainda não geram receita material para eles (FY2025), mas
continuam em fase de investimento e a validação do Chess provou a estratégia "ensinar tudo". Se
canto virar um mercado grande, eles adicionam canto com uma distribuição que você não tem como
enfrentar. **Chamar-se "o Duolingo do canto" é escolher voluntariamente a comparação que você perde.**

---

## 3. O gap de produto: real, mas mais estreito do que o PRD afirma

### 3.1 O que se confirma
- Ninguém classifica **registro/passaggio ao vivo, durante a nota**. Esse whitespace específico
  continua de pé (consistente com o doc nº 3).
- O padrão da categoria segue sendo **placar sem professor** — mede e pontua, não explica o porquê.

### 3.2 O que mudou desde o doc nº 3 (e enfraquece o gap)
- **Singing Carrots lançou um AI singing coach em nov/2025** e já publicou dados de eficácia:
  1.382 usuários, 4 meses, +6,1 p.p. de acurácia de afinação, +2,7 semitons de extensão, e 2,95×
  mais prática que usuários auto-guiados. A plataforma alega 300k+ cantores. **"Coach de IA para
  canto" não é mais terreno vago.** Eles chegaram primeiro na narrativa e já têm prova de eficácia
  publicada — que era exatamente o ativo de marketing que você planejava construir.
- **Yousician** teria expandido o AI Vocal Coach com feedback de pitch **e timbre** em 2025-26.
  ⚠️ **Confiança baixa nessa afirmação:** ela aparece só em blogs de SEO (incluindo conteúdo
  aparentemente gerado por IA), e eu **não consegui verificar no site oficial** (yousician.com
  retorna 403). Trate como sinal de intenção, não como fato. Mas a direção é clara e o Yousician
  tem 20M+ MAU para empurrar.

### 3.3 A conclusão desconfortável
**Gap de produto ≠ demanda.** Todos os gaps do PRD §1.1 são reais. Nenhum deles é a razão pela qual
as pessoas não usam apps de canto. As pessoas não usam apps de canto porque **cantar exige barulho,
tempo, privacidade e coragem** — não porque o feedback do concorrente chega 200ms tarde demais.

Resolver o feedback tardio é uma melhoria genuína para quem **já está praticando**. Não é o que
converte quem não pratica. O PRD trata o gap técnico como se fosse o gargalo do mercado. Não é.

---

## 4. Tecnologia: não há bloqueio insolúvel — e você já matou o risco maior

Esta é a boa notícia, e ela é sólida.

### 4.1 O que já está resolvido e verificado
- **F0 está resolvido.** SwiftF0 (arXiv:2508.18440, ago/2025, licença MIT) — 95.842 parâmetros,
  **~42× mais rápido que o CREPE em CPU**, **91,80% de média harmônica a 10 dB SNR** (>12 p.p.
  acima do CREPE), faixa **G1–C7 (46,9–2093,75 Hz)**, com **demo oficial rodando 100% client-side
  em WASM + ONNX**. Confirmado na fonte primária. Isso valida a decisão do doc nº 3.
- **Você já construiu o núcleo.** O repositório tem: núcleo DSP em Rust→WASM (~27 KB) com F0/MPM +
  clarity + RMS + centróide + tilt; worker do SwiftF0 rodando em paralelo com **veto de erro de
  oitava**; ring buffer com SharedArrayBuffer; camada de percepção; `register.ts` com estimativa de
  zona + detecção de evento de quebra; ~10,7k linhas e um backend multi-tenant. **O risco técnico
  central do projeto já foi retirado.**
- **`register.ts` está escrito com honestidade científica** — trata registro como *estimativa de
  zona com confiança* + *detecção de evento*, não como laudo fisiológico. Isso está correto e é
  raro. Mantenha essa disciplina no **marketing**, não só no código (§4.3).

### 4.2 Nativo mobile é mais FÁCIL que web, não mais difícil
Se você for para o nativo, os problemas técnicos **diminuem**:
- AVAudioEngine (iOS) e Oboe (Android) dão latência menor e mais previsível que a Web Audio API;
- Some o inferno de COOP/COEP, SharedArrayBuffer e isolamento cross-origin;
- Somem os quirks do Safari iOS (AudioContext suspenso, drift de 44,1 vs 48 kHz);
- Seu núcleo em Rust compila para lib nativa (via UniFFI). **A migração é a camada de I/O, não a
  matemática.** Isso foi uma decisão de arquitetura muito boa e ela vai pagar.

### 4.3 Os riscos técnicos que continuam de pé (subestimados nos docs)

1. **Seu teste de DSP é com senoides sintéticas.** O README diz "10/10 notas de E2 a A5 com ~0
   cents". Isso valida a matemática, não o produto. Voz real tem vibrato, soprosidade, ruído de
   fundo, reverb de quarto e AGC de celular barato. **Nada está validado até rodar em 20 pessoas
   reais, em quartos reais, com celulares reais.** Esse é o teste que falta e é barato de fazer.
2. **Android de entrada é o inimigo.** O processamento de voz embutido do Android (AGC, supressão
   de ruído, cancelamento de eco) pode destruir justamente as features espectrais (tilt, H1-H2) de
   que a estimativa de registro depende. Precisa desabilitar explicitamente e testar em aparelho
   barato — que é exatamente o público gospel/sertanejo que o PRD quer.
3. **Registro como rótulo fisiológico continua não-mensurável por microfone.** O padrão-ouro é EGG;
   a correlação H1–H2 ↔ quociente aberto é fraca (r≈0,5). O código já respeita isso. **O risco é de
   marketing:** se a landing prometer "diagnóstico de registro", um professor de canto com
   audiência te destrói publicamente em uma semana — e ele estará tecnicamente certo.
4. **Sycophancy do LLM** (já mapeado no doc nº 3 §5) — segue sendo o risco nº 1 da camada de coach.

**Veredito técnico: não existe problema insolúvel. A tecnologia não é o motivo para cancelar.**

---

## 5. Então o que fazer

### 5.1 O que morre
❌ **"O Duolingo do canto que explode na App Store e Play Store."**
Essa versão do projeto tem evidência forte contra: categoria com teto comprovado (§1.1), analogia
estruturalmente inválida (§2), mercado-alvo de ARPU baixo (§1.4) e um concorrente que já plantou a
bandeira do "AI coach" (§3.2). Se o critério de sucesso for esse, **cancele agora e economize um
ano.** Não vai acontecer, e não seria culpa da sua execução.

### 5.2 O que sobrevive — e tem evidência a favor

**Caminho A — B2B2C: professor e igreja pagam. (maior convicção)**

É o caminho com melhor razão evidência/esforço, e **você já começou a construí-lo** — os commits
`feat(saas): sistema de convites/times (B2B2C)` e o acompanhamento de membro já estão lá.

Por que funciona onde o consumidor falha:
- **ARPU 20–50× maior.** Um professor com 30 alunos ou uma igreja com um coral de 40 vozes é uma
  conta, não um usuário.
- **Resolve a aquisição.** O professor/regente traz os usuários. Você não paga CAC numa categoria
  de LTV baixo — que é matematicamente o erro fatal do caminho consumidor.
- **Resolve a retenção.** A frequência deixa de depender de força de vontade individual e passa a
  ser socialmente imposta (tem aula na terça, tem ensaio no sábado). Isso **contorna a restrição
  física do §2** — o aluno pratica porque o professor vai olhar.
- **O produto certo já é o que você tem.** O que o professor compra não é o app do aluno: é o
  *painel* que mostra o que aconteceu entre as aulas. Você já tem detalhe de membro com
  nível/XP/skills/foco/sessões.
- **Web serve.** Professor abre no notebook. A objeção "web ninguém usa" vale para app de hábito de
  consumo — não vale para ferramenta de trabalho.

**Caminho B — Preço global, não preço Brasil.**
Se for consumidor, o produto precisa nascer bilíngue e cobrar em dólar/euro (US$10–15/mês), onde a
disposição a pagar é 5–10× maior. O Brasil vira mercado de teste barato e segundo mercado — não o
alvo. Fazer PT-BR-first com preço BR é escolher o pior ARPU do mundo de propósito.

**Caminho C — reconheça o valor do núcleo (não é pivô, é opção).**
A lição do Vocal Image (§1.3): o mesmo motor DSP serve voz falada — apresentação, liderança,
sotaque, voz trans — com ARPU ~US$240/ano em vez de R$29/mês. Não estou recomendando pivotar hoje.
Estou registrando que, se o canto não pagar, **o ativo que você construiu tem uma segunda vida com
economia 10× melhor**, e isso reduz muito o custo de estar errado.

### 5.3 O nome (só depois)
Quando chegar a hora: **evite latim e evite "canto".** `Canto` é palavra genérica em PT/IT/ES —
péssima para ASO e frágil para marca registrada. Vox/Cantus/Vocalis estão todos ocupados há anos.
O que funciona: palavra curta, inventada, foneticamente limpa, escrevível depois de ouvir uma vez,
com .com e handle livres nas duas lojas. **Mas isso é o último problema a resolver, não o primeiro.**
Batize depois de ter 50 pessoas que amam o produto.

---

## 6. O teste que decide — 8 semanas, zero código nativo

Não escreva o app nativo para descobrir se há demanda. Escreva o app nativo para **escalar demanda
já provada.** Nativo custa 3–6 meses da sua vida; esse teste custa 8 semanas e usa o que já existe.

**Semanas 1–2 — Validar o sinal no mundo real.**
Levar o app web atual a **20 pessoas reais**, em quartos reais, em celulares reais (incluindo pelo
menos 5 Android de entrada). Medir: o F0 aguenta? o tilt/H1-H2 sobrevive ao AGC do Android? a
detecção de quebra dispara falso positivo com vibrato?
*Falha aqui = problema de engenharia conhecido, não de tese. Conserte e siga.*

**Semanas 3–6 — Validar o comprador (o teste que importa de verdade).**
Colocar na frente de **5 professores de canto + 2 regentes/ministros de louvor** e **cobrar**.
Não pesquisa, não "adorei a ideia" — boleto, Pix, cartão.
Preço a testar: **R$150–300/mês por turma.**

**Semanas 3–8 — Validar a física do hábito.**
Instrumentar o app: **mediana de sessões por semana** dos 20 usuários reais e a razão declarada da
falta ("não tive onde cantar" vs "esqueci" vs "não gostei"). Isso testa diretamente a hipótese do §2.

### Critérios de morte (defina agora, cumpra depois)

Ao fim das 8 semanas, **cancele** se qualquer um destes for verdade:
- ❌ **Menos de 3 dos 7** professores/igrejas pagaram de verdade.
- ❌ **Mediana abaixo de 2 sessões/semana** entre os 20 usuários reais, com "não tenho onde cantar"
  como razão dominante — isso confirma que a restrição física domina e o modelo de hábito morre.
- ❌ O DSP não sobrevive a Android de entrada em quarto normal e o conserto não aparece em 2 semanas.

**Prossiga para o nativo** se: ≥3 contas B2B pagantes **e** mediana ≥2 sessões/semana. Aí o nativo
deixa de ser aposta e passa a ser alavanca — e a decisão de arquitetura Rust→WASM/UniFFI que você já
tomou faz a portabilidade valer o investimento.

---

## 7. Resposta às três perguntas, em uma linha cada

**O gap é real?** O de produto sim; o de mercado é bem menor do que os docs assumem — e o gap real
não é técnico, é físico e cultural.

**Vale ser o Duolingo do canto?** Não. A analogia quebra na restrição de que cantar exige barulho,
privacidade e coragem — e o próprio Duolingo está entrando em música com distribuição que você não
tem. Explosão nas lojas não vai acontecer; a categoria nunca produziu uma.

**Teremos problemas insolúveis de tecnologia?** Não. F0 está resolvido e verificado, você já
construiu o núcleo, e o nativo torna o áudio mais fácil, não mais difícil. O único limite real
(registro como rótulo fisiológico) já está tratado com honestidade no código — só precisa ser
tratado com a mesma honestidade no marketing.

**Cancelar?** Não — mas mate a premissa de consumo em massa no Brasil hoje, e submeta o projeto ao
teste de 8 semanas do §6 antes de gastar um único mês em app nativo.

---

## Fontes

- [Riyaz — 1M+ downloads e assinantes pagos (YourStory)](https://yourstory.com/2019/12/startup-bangalore-riyaz-music-teaching-app-1-million-downloads) · [Riyaz — perfil e funding (Tracxn)](https://tracxn.com/d/companies/riyaz/__HQGZOHPVVE2gN_KdMYgJxi9JGdDulC1_4w0XwtXbq2A) · [Riyaz na App Store](https://apps.apple.com/us/app/riyaz-learn-to-sing/id1341595277)
- [Vocal Image — receita e métricas (Sacra)](https://sacra.com/c/vocal-image/) · [Vocal Image — funding (Tracxn)](https://tracxn.com/d/companies/vocal-image/__5mcXE9HDSMglZFnifWVzJ4AshX2CdZmRom8ZH-nmIRE)
- [Yousician — rankings e estimativas de receita (Sensor Tower)](https://app.sensortower.com/overview/959883039?country=US) · [Yousician — funding (Crunchbase)](https://www.crunchbase.com/organization/yousician) · [Yousician — preços 2026](https://subger.com/en/service/yousician)
- [Vanido — reviews e status do app](https://justuseapp.com/en/app/1130249200/vanido-learn-to-sing/reviews) · [Vocaberry na App Store](https://apps.apple.com/us/app/learn-to-sing-with-vocaberry/id1333485458) · [Vocaberry (MWM)](https://mwm.ai/apps/learn-to-sing-with-vocaberry/1333485458)
- [Singing Carrots — resultados do AI Singing Coach, 4 meses](https://blog.singingcarrots.com/ai-singing-coach-results-4-months-data/) · [Comparativo de AI vocal coaches 2026](https://singingcarrots.com/blog/top-7-ai-vocal-coaches/)
- [Duolingo — estratégia 2026 e 100M DAU (Class Central)](https://www.classcentral.com/report/duolingo-2026-strategy/) · [Duolingo — estatísticas 2026](https://sqmagazine.co.uk/duolingo-statistics/) · [Duolingo — Q1 e crescimento de usuários](https://finance.yahoo.com/markets/stocks/articles/duolingo-q1-earnings-beat-estimates-144800167.html)
- [SwiftF0 — paper (arXiv:2508.18440)](https://arxiv.org/abs/2508.18440) · [SwiftF0 — código e demo client-side](https://github.com/lars76/swift-f0) · [Benchmark de detectores de pitch](https://github.com/lars76/pitch-benchmark)
- [ARPU por país — mercados de alto volume e baixa receita](https://games.gg/news/mobile-game-arpu-by-country-insights-for-ua-strategy-and-growth/) · [Mercado mobile brasileiro 2025 (Adjust/MobileTime)](https://www.mobiletime.com.br/noticias/04/11/2025/adjust-relatorio-brasil/) · [E-learning na América Latina — US$16B até 2026](https://www.ecommercebrasil.com.br/noticias/e-learning-america-latina-deve-alcancar-us-16-bilhoes-ate-2026-estudo-pagseguro)
- [Mercado de apps de aprendizado musical — projeções](https://www.datainsightsreports.com/reports/apuri-101563)
