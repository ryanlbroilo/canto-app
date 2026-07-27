# Side Project: Quais Frentes Sobrevivem ao Teste
### Documento vivo nº 6 · Complementa os docs nº 4 (canto) e nº 5 (nichos)

> **Contexto novo.** O canto vira uso pessoal — decisão tomada, encerrada. A pergunta agora é outra:
> **qual app vale montar como side project**, tocando sozinho, em paralelo à Evoris, sem enlouquecer.
>
> **Isso muda os critérios inteiros.** Tudo que eu recomendei no doc nº 5 pressupunha construção de
> empresa. Metade daquilo é **péssimo** como side project — a começar pela minha recomendação
> principal de lá.
>
> **A resposta curta:**
> 1. **"Nicho brasileiro enorme e não atacado" é, em grande parte, mito.** Testei sete. Cinco já
>    têm dono, e um tem o governo distribuindo de graça. O mapa do que matei está no §2 — vale mais
>    que a recomendação, porque te economiza meses de perseguir fantasma.
> 2. A oportunidade real não está onde ninguém pensou. Está onde **a barreira é técnica** — porque
>    é o único tipo de barreira que um engenheiro sozinho consegue erguer e um marqueteiro não
>    consegue pular.
> 3. **A melhor frente pra você é áudio do sono (ronco → triagem de apneia).** Ela inverte
>    exatamente o defeito que matou o canto: a sessão acontece **enquanto o usuário dorme**. Zero
>    fricção de hábito, e 100% do seu núcleo de DSP reaproveitado.

---

## 1. Side project muda tudo — inclusive o que eu te recomendei antes

Os critérios do doc nº 5 eram de quem monta empresa. Como side project, os pesos viram outros:

| Critério de side project | Por quê |
|---|---|
| **Construível sozinho, em noites e fins de semana** | Sem time, sem ops, sem fábrica de conteúdo. |
| **Distribuição self-serve** | ASO e orgânico. Se precisa de vendedor ou verba de mídia, morreu. |
| **Carga operacional baixa** | Nada de marketplace de dois lados, suporte 24/7 ou moderação. |
| **O moat é engenharia** | ⭐ Se o diferencial for conteúdo ou marketing, você perde pra quem faz TikTok em tempo integral. Você não tem tempo integral. |
| **Risco regulatório administrável** | Você não tem jurídico. |
| **Te dá energia em vez de tirar** | É o ponto do exercício. Se virar segunda Evoris, falhou. |

### Correção do doc nº 5
Naquele documento eu classifiquei **alfabetização/leitura em voz alta (modelo Amira) como a maior
oportunidade da lista.** Continua verdade — **e é uma péssima ideia de side project.** Venda B2G tem
ciclo de 6 a 18 meses, licitação e política. Você abriria o app pra ver zero usuários por um ano.
**Descartada aqui**, não por deixar de ser boa, mas por ser incompatível com o formato.

Pelo mesmo motivo cai a **fonoaudiologia B2B2C**: depende de ligar pra fonoaudiólogas e fechar
contas na unha. Bom negócio, trabalho de vendedor. Fica no banco de reserva.

---

## 2. O mapa do que eu matei (leia antes de se apaixonar por alguma ideia)

Testei sete nichos "óbvios e enormes" do Brasil. **Cinco já têm dono.** Este mapa é o item mais
útil deste documento.

| Nicho | O que parecia | O que os dados mostram | Veredito |
|---|---|---|---|
| **Entender exame de sangue com IA** | Ansiedade recorrente + resposta objetiva = o modelo PictureThis | Já existem **Sano AI, Laborito, AI Doutor & Resultados Lab, ExamesIA, Dr IA, CalcLab, aidiagme** — todos em PT-BR, todos recentes. É corrida de wrapper de LLM: qualquer um constrói num fim de semana | ☠️ **Saturado, moat zero** |
| **Correção de redação ENEM por IA** | 5,05M de inscritos no ENEM 2026 (+5% a/a), dor aguda, correção é mensurável | O **MEC lançou o app "MEC Enem" de graça** — foto da redação manuscrita, transcrição + correção por IA com nota estimada em até 60s. Buscas pelo app subiram até 800% | ☠️ **Concorrer com o governo de graça** |
| **Gestão de igreja / escala de louvor** | 87,5k–124k igrejas no Brasil, e você já tem contato com o meio | A **inChurch atende mais de 45.000 igrejas**; Igreja Digital, Igreja Conectada e outros dividem o resto. Mercado já penetrado, e é CRM — carga operacional alta | ☠️ **Dono definido** |
| **Identificação de praga/doença na lavoura** | Brasil é potência agrícola, dor = prejuízo em dinheiro | Plantix (500k global, ~80k BR), **ADAMA Alvo**, apps da Embrapa. Pior: o app da ADAMA é **grátis porque é canal de marketing de quem vende defensivo**. Você não cobra contra isso | ☠️ **Economia estruturalmente contra** |
| **Futebol de várzea / peladeiro** | Cultura nacional, zero tecnologia aparente | **APP Esportivo** (500+ organizadores), **VarzeaFut**, **iFut** já operam. E peladeiro não paga assinatura | ⚠️ **Ocupado e sem carteira** |
| **Simulado CNH / concursos** | Volume gigantesco de busca | Uso único (passou, desinstalou) e guerra de mídia contra Gran/Qconcursos — ver doc nº 5 §5 | ☠️ **Demanda sem negócio** |
| **Adestramento de cães** | 62M de cães, R$75,4bi de mercado pet | O app não consegue **medir** se o cão obedeceu. Sem sinal, não há moat — ver doc nº 5 §3 | ☠️ **Jogo de conteúdo, não seu** |

> **A lição:** onde há volume óbvio e a construção é fácil, **já tem cinco.** A janela de um
> engenheiro sozinho não está no nicho que ninguém pensou — está no nicho que **os outros não
> conseguem construir.** Barreira técnica é a única que protege quem trabalha à noite.

---

## 3. 🏆 A frente forte: áudio do sono — ronco e triagem de apneia

### Por que essa ideia é o oposto exato do canto

O canto morreu porque a prática exige barulho, privacidade e coragem — três fricções que nenhuma
tecnologia resolve. **Aqui a sessão acontece enquanto o usuário dorme.** Ele não precisa praticar,
não precisa lembrar, não precisa querer. Deixa o celular na mesa de cabeceira e pronto.

> É o único formato de app em que a **retenção é o estado padrão** em vez de uma guerra diária.
> Pra quem acabou de perder um projeto justamente por fricção de hábito, isso não é detalhe.

### Os números 🟢

- **EPISONO** (Tufik et al., estudo epidemiológico revisado por pares): **32,9% de prevalência de
  apneia obstrutiva do sono na população adulta de São Paulo** — um terço dos adultos.
- Estimativas nacionais falam em **30 milhões+ de brasileiros** afetados (algumas fontes chegam a
  70M) 🟡, com **cerca de 10% diagnosticados**. É uma das condições mais subdiagnosticadas que
  existem.
- ~30% dos adultos brasileiros roncam habitualmente.
- **SnoreLab: mais de 50 milhões de noites monitoradas.** Existe até estudo piloto avaliando o
  Snore Score contra apneia moderada-a-grave.
- **Sleep Cycle** (listada na Nasdaq Stockholm): ~200k downloads e **~US$900k de receita no último
  mês** 🟡, 3 bilhões de noites analisadas, receita B2B **+42%** no 1º tri de 2026 — e um **estudo
  clínico de triagem de apneia com conclusão prevista para setembro**.

### O scorecard

| Critério | Nota | Por quê |
|---|:--:|---|
| Sessão sem fricção | ✅✅ | **Acontece dormindo.** Não existe melhor que isso. |
| Dor aguda | ✅✅ | Cônjuge reclamando (casais dormem em quartos separados por isso), exaustão diurna, e o medo real de AVC/infarto. |
| TAM | ✅✅ | 30M+ no Brasil, ~1 bilhão no mundo. |
| Mercado pago offline | ✅✅ | Polissonografia e CPAP custam caro. Ninguém duvida que se paga por isso. |
| **Mensurável** | ✅✅ | **É puro DSP de áudio.** Detecção de evento, energia, envelope, classificação espectral. Literalmente o que você acabou de construir. |
| Self-serve | ✅✅ | ASO puro. Zero venda. |
| Moat de engenharia | ✅ | Separar ronco simples de evento apneico no áudio é problema difícil de verdade — é exatamente a barreira que segura os concorrentes de fim de semana. |

### Por que **você** especificamente

Olhe o que já está no repo e o que essa ideia precisa:

| Você já tem | Serve pra quê aqui |
|---|---|
| Núcleo DSP em Rust→WASM (RMS, envelope, centróide, tilt espectral) | Detecção e classificação de eventos respiratórios |
| AudioWorklet + ring buffer lock-free + captura contínua | Gravar 8 horas sem travar nem estourar bateria |
| Camada de percepção (onset, sustain, release, piso de ruído adaptativo) | Segmentar evento de ronco contra ruído do quarto — **é o mesmo problema** |
| Contrato "DSP mede → LLM interpreta" e disciplina de não extrapolar o dado | Relatório da noite sem virar laudo médico |
| Arquitetura portável pra nativo via UniFFI | Aqui o nativo é **obrigatório** (rodar a noite toda), e você já projetou pra isso |

**E o Brasil está aberto no consumidor.** A **Biologix** (brasileira) faz exame do sono domiciliar
com sensor + app, mas é **dispositivo médico via clínica e laudo profissional** — outro andar do
mercado. Não existe um bom app de consumo de ronco em PT-BR. E, melhor: eles são **parceiro natural
de saída**, não concorrente. Seu app é o topo do funil ("seu padrão respiratório merece
investigação"), o exame deles é o degrau seguinte.

### Os riscos — sem maquiagem

1. **Você entra como challenger, não em terreno vazio.** SnoreLab e Sleep Cycle são fortes, e a
   Sleep Cycle está indo para triagem de apneia **agora** (estudo clínico terminando em setembro).
   O espaço PT-BR está aberto; o espaço global não está.
2. **A ciência é mais dura do que parece.** Evento apneico no áudio é um *silêncio* seguido de
   retomada ruidosa. Detectável, mas com taxa de falso positivo alta — respiração silenciosa normal
   parece pausa. Isso é P&D de verdade, não configuração de threshold.
3. **Regulatório: você não pode diagnosticar nada.** O enquadramento tem que ser triagem e
   encaminhamento, sempre. **Mas essa é exatamente a disciplina que você já demonstrou no
   `register.ts`** — tratar estimativa como estimativa em vez de laudo. Você é uma das poucas
   pessoas que já provou saber fazer isso.
4. **PT-BR não é diferencial** — ronco não tem idioma. O que na verdade **resolve** o problema de
   ARPU brasileiro do doc nº 4: o jogo já nasce global, com preço em dólar.
5. **Bateria e permissão de microfone a noite toda** são problemas reais de engenharia mobile, e
   iOS é chato com áudio em background. Resolvível, mas é onde o cronograma vai escorregar.

---

## 4. Vice-campeãs (se a de cima não te animar)

**A. Triagem auditiva / audiometria por celular.** A **Mimi** já fez **4 milhões de testes** com
validação clínica publicada (sensibilidade 100%, especificidade 80,2% para perda moderada), usando
audiometria de Békésy. Mesmo terreno de sinal, população idosa brasileira enorme e desassistida.
**Contra:** o modelo da Mimi é licenciamento B2B (TVs, fones) — não é self-serve; exige calibração
de fone de ouvido; e é área regulada. Mais difícil de monetizar sozinho que sono.

**B. Voz falada profissional.** Já detalhada no doc nº 4: Vocal Image com US$12M ARR e ARPPU de
US$240/ano. **É o teste mais barato que existe pra você** — dá pra validar reaproveitando o app web
atual, trocando exercícios e cobrando em dólar. Como side project é legítimo; só não é tão
empolgante tecnicamente quanto sono, e o Vocal Image está bem à frente.

**C. Fonoaudiologia infantil.** Melhor negócio dos três, pior formato de side project (depende de
venda consultiva). Fica no banco de reserva caso você um dia queira sócio comercial.

---

## 5. Como decidir, e o primeiro teste

**Antes de escrever qualquer app**, faça o experimento de 1 fim de semana — o mesmo tipo de teste
que o doc nº 4 propôs pro canto, agora barato de verdade:

1. **Grave 3 noites suas** com o celular e o núcleo DSP que você já tem (roda em web mesmo, só pra
   coletar). Você tem AudioWorklet, ring buffer e as features prontas.
2. **Olhe o sinal.** Ronco aparece limpo no envelope? Dá pra separar de ventilador, trânsito, chuva,
   parceiro se mexendo? Pausas respiratórias são visíveis?
3. **Critério de morte:** se depois de 3 noites você não conseguir distinguir ronco de ruído
   ambiente com regra simples, o problema é mais duro que o cronograma de um side project. **Pare
   e vá pra vice-campeã B.**

Se o sinal estiver lá — e a literatura diz que está — aí sim vale o app nativo. E note a diferença
para o canto: **aqui o nativo não é aposta em demanda, é requisito técnico** (gravar 8 horas em
background), com a demanda já provada por 50 milhões de noites do SnoreLab.

**Uma última coisa.** Você disse que quer isso pra não enlouquecer com a Evoris. Então o critério
que não está em nenhuma tabela: **essa é a única ideia da lista que é tecnicamente divertida.** As
outras são CRUD com camada de IA. Essa é um problema de sinal de verdade, do tipo que te faz abrir
o notebook às 23h por vontade própria. Pra um side project, isso não é o critério menos importante —
é provavelmente o mais importante.

---

## Fontes

**Alta confiança 🟢**
- [EPISONO — prevalência de 32,9% de AOS em São Paulo (SciELO / J Bras Pneumol)](http://www.scielo.br/j/jbpneu/a/dTF8PvF36ZvskD6tHnQ8Qjp/?lang=pt) · [Distúrbios do sono no Brasil (Jornal da USP)](https://jornal.usp.br/noticias/a-maioria-dos-brasileiros-sofre-com-algum-disturbio-do-sono/) · [Apneia obstrutiva e ronco primário: diagnóstico (Braz J Otorhinolaryngol)](https://www.scielo.br/j/bjorl/a/NCtcfxVR7yPG9dnK9sTzwHr/?format=html&lang=pt) · [Subdiagnóstico no Brasil (Biologix)](https://www.biologix.com.br/en/2021/07/16/brasil-e-seus-milhoes-de-apneicos-diagnostico/)
- [SnoreLab — 50M+ noites monitoradas](https://www.snorelab.com/insights/is-it-snoring-or-sleep-apnea) · [Estudo piloto SnoreLab x AOS (ResearchGate)](https://www.researchgate.net/publication/381311397_SnoreLab_Application_in_the_Assessment_of_Obstructive_Sleep_Apnea_Syndrome_A_Pilot_Study)
- [Sleep Cycle — resultados e estudo clínico de apneia (RI)](https://investors.sleepcycle.com/) · [Sleep Cycle — relatório anual](https://sleepcycle.com/newsroom/press-release/sleep-cycle-year-end-report-a-year-of-deliberate-choices)
- [Mimi — validação clínica da audiometria móvel (PubMed)](https://pubmed.ncbi.nlm.nih.gov/38942612/) · [Validação de apps de audiometria remota (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12445279/) · [Mimi — 4M de testes](https://mimi.io/products/mimi-hearing-test)
- [Biologix — exame do sono domiciliar](https://www.biologix.com.br/en/exame-do-sono/)
- [inChurch — 45.000+ igrejas](https://inchurch.com.br/inchurch-3/) · [IBGE/Ipea — igrejas e templos no Brasil (Nexo)](https://pp.nexojornal.com.br/opiniao/2024/02/21/quantos-estabelecimentos-religiosos-existem-no-brasil-religiao-censo-ibge) · [87,5 mil igrejas evangélicas (Ipea)](https://www.ibahia.com/comportamento/religiao/brasil-tem-mais-de-87-mil-igrejas-evangelicas-aponta-pesquisa-310602)
- [MEC Enem — app gratuito com correção de redação por IA (Money Times)](https://www.moneytimes.com.br/mec-enem-app-gratuito-usa-inteligencia-artificial-para-corrigir-redacoes-e-montar-planos-de-estudo-personalizados-isbl/) · [ENEM 2026 — 5.055.818 inscritos](https://paraibabusiness.com.br/enem-2026-passa-de-5-milhoes-e-aquece-setor-educacional/) · [EnemIA — correção de redação com IA (SciELO)](https://www.scielo.br/j/tl/a/xzBKry3YHNpTNwTjkXqSsks/?format=html&lang=pt)

**Concorrência verificada nos nichos descartados**
- Exames com IA: [Sano AI](https://apps.apple.com/br/app/sano-ai-an%C3%A1lise-laudos-lab/id6751110925) · [Laborito](https://play.google.com/store/apps/details?id=com.maestria.laborito&hl=pt) · [AI Doutor & Resultados Lab](https://apps.apple.com/br/app/ai-doutor-resultados-lab/id6738892999) · [ExamesIA](https://www.examesia.com/) · [CalcLab](https://calclab.com.br/en)
- Agro: [ADAMA Alvo](https://www.adama.com/brasil/pt/adama-alvo) · [Plantix — 500k usuários, 80k no Brasil (Gazeta do Povo)](https://www.gazetadopovo.com.br/agronegocio/ferramentas/que-praga-e-essa-tire-uma-foto-e-o-aplicativo-reconhece-o-problema-da-planta-cauanhsfj2a6hju4hcz5dtz57/) · [Apps da Embrapa](https://www.embrapa.br/en/agencia-de-noticias-embrapa/busca-de-noticias/-/noticia/31597890/aplicativo-auxilia-na-identificacao-de-inimigos-naturais-de-pragas-agricolas)
- Várzea: [APP Esportivo](https://appesportivo.com.br/sobre.html) · [VarzeaFut](https://www.varzeafut.com.br/) · [iFut](https://www.ifut.com.br/)
- Igreja: [Igreja Digital](https://igreja.digital/) · [Igreja Conectada](https://www.igrejaconectada.com/)

**Média confiança 🟡** — estimativas de terceiros
- [Sleep Cycle — downloads e receita (Sensor Tower)](https://app.sensortower.com/overview/320606217?country=US)
