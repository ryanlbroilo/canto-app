# Evidência Científica: Triagem de Apneia por Áudio de Celular
### Documento vivo nº 7 · Auditoria das fontes enviadas + a literatura que faltava

> **A pergunta.** "Com isso aqui não temos os estudos e papers suficientes?"
>
> **A resposta.** **Não — e por três motivos diferentes, sendo que o segundo é o que importa.**
> 1. A lista tem menos fontes distintas do que parece (§1).
> 2. **A revisão que você mandou conclui o *contrário* do que você espera dela** (§2). Se você a
>    apresentasse como prova a favor, quem lesse teria a impressão oposta.
> 3. A literatura que de fato sustenta a tese **não está na sua lista** — e ela é forte (§3).
>
> **E o reenquadramento:** você já passou do ponto em que ler mais paper muda alguma decisão. O
> gargalo do projeto nunca foi literatura — é **dado rotulado**. O achado mais valioso desta
> auditoria não é um paper, é um **dataset aberto de 212 polissonografias com áudio sincronizado**
> (§4).

---

## 1. Auditoria da lista enviada

| Fonte enviada | O que realmente é | Peso |
|---|---|---|
| `appspeter.pdf` | **Baptista et al., 2022** — "A systematic review of smartphone applications and devices for obstructive sleep apnea", *Brazilian Journal of Otorhinolaryngology*. Revisão sistemática | 🟢 Forte |
| `pmc.ncbi.nlm.nih.gov/PMC9801062` | **O mesmo paper acima** (versão PMC) | ➖ Duplicata |
| `scielo.br/j/bjorl/...` | BJORL — mesma revista; não consegui abrir (403), provavelmente a mesma revisão ou adjacente | ⚠️ Não verificado |
| `pmc.ncbi.nlm.nih.gov/PMC8157780` | **"Sleep apps: current limitations and challenges"** — outra revisão, também focada em **limitações** | 🟢 Forte, mas cautelosa |
| `sleepcycle.com/newsroom/press-release/...` | **Press release corporativo** anunciando estudo clínico e "mercado de bilhões" | 🔴 Marketing, não evidência |
| `hitlab.org/sleep-cycle-app-heuristic-study` | Estudo **heurístico de usabilidade** (UX), não acurácia clínica | 🟡 Fora do tema |
| `pulmonologyadvisor.com/features/...` | Matéria de revista de trade | 🟡 Secundária |

**Saldo real:** duas revisões (ambas cautelosas), um PR, um estudo de UX e uma matéria. Zero
estudos primários de acurácia acústica.

---

## 2. ⚠️ O problema sério: a revisão do Baptista aponta contra, não a favor

Li o PDF inteiro. O que ele efetivamente estabelece:

- De **300 apps** encontrados nas lojas, **256 avaliados a fundo**, apenas **10 tinham dados
  científicos publicados**. A categoria é quase toda alegação sem validação.
- **SnoreLab falhou.** Stippig et al. testaram a capacidade de distinguir ronco de ruído de fundo
  contra o ApneaLink Plus (validado). Resultado: não correspondeu — os autores concluem que
  *"reliability and accuracy are insufficient to replace common diagnostic standards"*.
- **Sleep Cycle falhou.** Patel et al. compararam com polissonografia em 25 crianças: nenhuma
  correlação significativa de tempo total de sono nem de latência. Conclusão: *"not yet accurate
  enough to be used for clinical purposes"*.
- **Sensibilidade e especificidade só são aceitáveis para doença moderada e grave** — desempenho
  ruim na apneia leve. E leve é a maioria dos casos não diagnosticados.
- *"Acceptable level 1 data is scarce. Many of the cited studies were run on healthy volunteers with
  neither SDB nor formal sleep lab controls."*
- Conclusão do abstract: *"today are not as accurate as other traditional options... still does not
  count with proper testing and their validation may be unreliable."*

> **Isso não mata a ideia — mas inverte o uso da fonte.** Este paper não é prova de que dá pra
> fazer; é prova de que **ninguém fez direito ainda**. O que é, na verdade, uma notícia melhor:
> confirma o whitespace. Só não confunda os dois, principalmente na frente de um médico ou de um
> investidor que vai ler o PDF.

### O bônus escondido: o Baptista te entrega o playbook regulatório de graça

Duas passagens que valem mais que o resto do paper para efeito de produto:

1. *"Most apps are exempt from formal regulatory review/approval and skirt this issue by not making
   strict medical claims. Language such as 'assists in' replaces 'diagnosis' or 'treatment of'."*
   → **É literalmente o texto que o seu app pode usar.**
2. A **AASM (2018)**: tecnologias de consumo **não podem** ser usadas para diagnóstico, **mas podem
   ser usadas para enriquecer a interação paciente-clínico** quando apresentadas dentro de uma
   avaliação clínica apropriada. → **É exatamente o posicionamento "topo de funil que encaminha"**
   que o doc nº 6 propôs com a Biologix como parceira de saída.
3. *"An ideal app that can monitor sleep and screen for OSA should be designed by a collaboration
   between app designers and doctors."* → arrume um médico do sono como consultor **desde o
   começo**, não depois.

---

## 3. A literatura que sustenta a tese — e que não estava na lista

### O paper que muda o jogo 🟢

**"Evaluating Prediction Models of Sleep Apnea From Smartphone-Recorded Sleep Breathing Sounds"** —
*JAMA Otolaryngology–Head & Neck Surgery* (PMC9011176).

Predição de AOS a partir de **som de respiração gravado por celular**:

| Limiar de AHI | ≥5 | ≥15 | ≥30 |
|---|---|---|---|
| **AUC** | **0,90** | **0,89** | **0,90** |
| Acurácia | 88,2% | 82,3% | 81,7% |
| Sensibilidade | 90,8% | 87,3% | 83,0% |
| **Especificidade** | **64,7%** | 70,6% | 80,3% |
| VPP | 95,8% | 89,3% | 82,0% |
| **VPN** | **44,0%** | 70,6% | 81,3% |

Os autores classificam o desempenho como **comparável a dispositivos portáteis de teste do sono
domiciliar**.

**A tradução prática — leia com atenção, isso define o produto inteiro:**

> O sinal **existe e é forte** no áudio de respiração captado por celular. AUC 0,90 encerra a
> dúvida técnica de fundo.
>
> **Mas especificidade de 64,7% e VPN de 44% no limiar ≥5 significam que seu app é bom para dizer
> "provavelmente tem" e péssimo para dizer "provavelmente não tem".** Um resultado negativo, nesse
> limiar, não vale quase nada.
>
> Logo: o produto é **triagem que encaminha, nunca que tranquiliza.** Você jamais pode exibir "está
> tudo bem". Só "isto merece investigação" ou "nada detectado nesta noite — o que não descarta
> nada". E, convenientemente, **é exatamente o produto que a regulação permite** (§2).

### Outras fontes que valem ler antes de escrever código
- **"Diagnostic value of smartphone in obstructive sleep apnea syndrome: a systematic review and
  meta-analysis"** — *PLOS One* (PMC9119483). Meta-análise com números agregados. ⚠️ Não consegui
  abrir (403) — **leia você e confirme os valores agregados antes de citar**.
- **"Contactless Sleep Apnea Detection on Smartphones"** (ApneaApp, Univ. de Washington) —
  abordagem **ativa** por sonar (o celular emite som inaudível e lê o eco do movimento torácico),
  em vez de passiva. Caminho alternativo importante: contorna o problema de "respiração silenciosa
  parece pausa".
- **"Proposition of a new, minimally-invasive, software smartphone device to predict sleep apnea and
  its severity"** — *Sleep and Breathing*, 2025. Evidência recente, pós-revisão do Baptista.
- **"Detection of sleep apnea using smartphone-embedded inertial measurement unit"** — *Scientific
  Reports*, 2025. Usa IMU em vez de áudio — vale como sinal complementar/fusão.

---

## 4. 🔑 O achado mais útil não é um paper — é um dataset

**PSG-Audio** — Korompili et al., *Scientific Data* (Nature), ago/2021.

- **212 polissonografias completas com áudio sincronizado**, pontuadas pela equipe médica do
  Sismanoglio–Amalia Fleming General Hospital de Atenas.
- Áudio de **microfone traqueal E microfone ambiente**. O ambiente é **literalmente o seu caso de
  uso** — celular na mesa de cabeceira.
- **Acesso aberto e gratuito.**

Isso resolve o problema que nenhum paper resolve: **de onde um dev sozinho tira áudio noturno com
verdade-terreno de PSG.** Sem isso, você passaria meses gravando as próprias noites sem rótulo
nenhum para validar contra.

### ⚠️ A armadilha do dataset, e ela é grave
**88,7% da amostra é do grupo "apneia grave" e casos normais não passam de 1,4%.**

Desbalanceamento extremo. Um modelo treinado cru nisso **vai superdiagnosticar** — e isso se soma
à especificidade já fraca reportada no JAMA (64,7%). É a armadilha nº 1 do projeto: você constrói
algo que acerta 90% dos doentes e assusta metade dos saudáveis.

**Mitigação obrigatória:** estratificar, reponderar classes, validar em população externa e
**reportar especificidade e VPN como métricas principais**, não acurácia. Acurácia num dataset
88,7% positivo é um número que mente.

---

## 5. "Papers suficientes" para quê? — o reenquadramento

| Pergunta | Já respondida? |
|---|---|
| O mercado existe? | ✅ **Sim, desde o doc nº 6** (EPISONO 32,9%, ~10% diagnosticado, 50M+ noites do SnoreLab) |
| O sinal existe no áudio? | ✅ **Sim, agora** — JAMA, AUC 0,90. Essa era a dúvida de fundo e está encerrada |
| Dá para construir o produto? | ❌ **Nenhum paper vai responder.** O gargalo é dado rotulado + engenharia, não leitura |
| Posso fazer alegação médica? | ❌ **Nunca por leitura** — exigiria estudo de validação próprio |

**Conclusão:** você já cruzou o ponto em que ler mais paper muda alguma decisão. Continuar
pesquisando agora é procrastinação disfarçada de diligência — e eu diria isso mesmo se você tivesse
mandado 30 papers em vez de 5.

### O próximo passo concreto (substitui o teste do doc nº 6)

O doc nº 6 propunha "grave 3 noites suas e olhe o sinal". **Com o PSG-Audio disponível, isso ficou
obsoleto** — gravar sem rótulo não valida nada. O teste novo:

1. **Baixe o PSG-Audio.** Use só o canal de **microfone ambiente** (o traqueal não é seu caso).
2. **Reproduza um baseline** de detecção de evento apneico com as features que você já tem no núcleo
   Rust (envelope de energia, RMS, tilt espectral, detecção de onset/silêncio).
3. **Meça AUC, especificidade e VPN** — nessa ordem de importância. Com estratificação, porque o
   dataset é 88,7% grave.
4. **Critério de morte:** se com o microfone ambiente você não passar de AUC ~0,75 num split
   honesto, o caminho passivo puro não fecha como side project. Aí a bifurcação é ir para o
   **sonar ativo** (linha do ApneaApp/UW) ou parar.

Isso é um fim de semana e responde mais do que 20 papers responderiam.

---

## Fontes

**Primárias 🟢**
- Baptista PM, Martin F, Ross H, O'Connor Reina C, Plaza G, Casale M. **"A systematic review of smartphone applications and devices for obstructive sleep apnea."** *Braz J Otorhinolaryngol*, 2022. [DOI 10.1016/j.bjorl.2022.01.004](https://doi.org/10.1016/j.bjorl.2022.01.004) · [PMC9801062](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9801062/)
- **"Evaluating Prediction Models of Sleep Apnea From Smartphone-Recorded Sleep Breathing Sounds."** *JAMA Otolaryngol Head Neck Surg.* [JAMA Network](https://jamanetwork.com/journals/jamaotolaryngology/fullarticle/2791067) · [PMC9011176](https://pmc.ncbi.nlm.nih.gov/articles/PMC9011176/)
- Korompili et al. **"PSG-Audio, a scored polysomnography dataset with simultaneous audio recordings for sleep apnea studies."** *Scientific Data*, 2021. [Nature](https://www.nature.com/articles/s41597-021-00977-w) · [PMC8333307](https://pmc.ncbi.nlm.nih.gov/articles/PMC8333307/) · [dataset no Figshare](https://springernature.figshare.com/articles/dataset/Metadata_record_for_PSG-Audio_a_scored_polysomnography_dataset_with_simultaneous_audio_recordings_for_sleep_apnea_studies_/14611581)
- **"Sleep apps: current limitations and challenges."** [PMC8157780](https://pmc.ncbi.nlm.nih.gov/articles/PMC8157780/)

**Para ler antes de codar**
- **"Diagnostic value of smartphone in obstructive sleep apnea syndrome: a systematic review and meta-analysis."** *PLOS One*. [Artigo](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0268585) · [PMC9119483](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9119483/) — ⚠️ não verificado por mim (403)
- Nandakumar et al. **"Contactless Sleep Apnea Detection on Smartphones"** (ApneaApp, UW). [PDF](https://apnea.cs.washington.edu/apneaapp.pdf)
- **"Proposition of a new, minimally-invasive, software smartphone device to predict sleep apnea and its severity."** *Sleep and Breathing*, 2025. [Springer](https://link.springer.com/article/10.1007/s11325-025-03441-w) · [preprint arXiv](https://arxiv.org/pdf/2406.16953)
- **"Detection of sleep apnea using smartphone-embedded inertial measurement unit."** *Sci Rep*, 2025. [Nature](https://www.nature.com/articles/s41598-025-99801-3.pdf)

**Marketing, não evidência 🔴**
- [Sleep Cycle — press release do estudo clínico de triagem de apneia](https://sleepcycle.com/newsroom/press-release/sleep-cycle-launches-clinical-study-for-ai-powered-sleep-apnea-screening-targeting-a-billion-dollar-market) (útil como sinal competitivo, não como prova)
