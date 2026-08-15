# Canto v2 — "Duolingo de verdade, cor do Canto"

> **Sistema de Design v2.** Este documento é a nova fonte única da linguagem visual, da mascote EVA, do logo, do feedback sonoro, da linguagem simples e do onboarding do Canto — o app de treino vocal com IA para cantores gospel/worship brasileiros iniciantes.
>
> **Relação com o v1** (`docs/design/canto-design-experiencia.md`): o v1 continua valendo como documento mestre de **estratégia, mecânicas, pedagogia e segurança psicológica**. O v2 **substitui** as decisões de linguagem visual, tipografia e forma da mascote. Onde os dois divergirem em estética, **vale o v2**. Onde o v1 fala de *por que* (retenção, SDT, MPA, aversão à perda deliberada), continua sendo a lei.
>
> **A virada em uma frase:** o Canto adota a **mecânica visual da Duolingo** — rounded-bold chunky, botões 3D com lábio sólido, cantos muito arredondados, cor flat-vívida sobre fundo neutro e celebração "juicy" — mas com a **paleta quente do Canto**, **âmbar como acento onipresente** e **EVA virando uma mascote-personagem** (uma brasa-cantante). Divertido de verdade, quente como nenhum outro, e ainda seguro para o adulto que se acha "desafinado".

---

## Sumário

1. [A Virada — o que muda vs. v1](#1-a-virada--o-que-muda-vs-v1)
2. [Sistema Visual](#2-sistema-visual)
3. [EVA — a Mascote (brief de construção SVG)](#3-eva--a-mascote-brief-de-construção-svg)
4. [Logo (wordmark + ícone do app)](#4-logo-wordmark--ícone-do-app)
5. [Feedback Sonoro (sobre o TonePlayer)](#5-feedback-sonoro-sobre-o-toneplayer)
6. [Linguagem Simples (anti-jargão)](#6-linguagem-simples-anti-jargão)
7. [Onboarding Consertado](#7-onboarding-consertado)
8. [Ordem de Implementação Sugerida](#8-ordem-de-implementação-sugerida)

---

## 1. A Virada — o que muda vs. v1

O v1 acertou a **alma** (calor, segurança psicológica, âmbar como diferencial, fundo neutro, mecânicas com guardrails) mas escolheu uma **roupa errada para o público**: serifa editorial e uma EVA abstrata "ser-de-som". Para o beachhead — adultos iniciantes gospel que nunca tiveram aula, muitos em Android mid-range — a linguagem que **funciona** é a da Duolingo: chunky, tátil, celebradora, com um personagem para amar. O v2 mantém a alma e troca a roupa.

### 1.1 O que CARREGA do v1 (não muda)

- **Fundo neutro + âmbar como acento.** O app **não** é âmbar por toda parte. Fundo branco (claro) ou cinza escuro (escuro), escolha do usuário; âmbar aparece em CTAs, XP, progresso, glow da EVA — **nunca como parede**.
- **Gradiente "Amanhecer"** (ameixa → brasa → dourado) como assinatura de herói/celebração/glow da mascote.
- **Todas as mecânicas** do v1 §5 (ofensiva com freeze, XP, trilha-como-home, Aferição/portão de maestria, metas semanais, economia mole que nunca bloqueia prática).
- **Segurança psicológica / MPA-safe** (v1 §1, §4.5, §9): nenhum estado de erro é vermelho-buzina; nenhum som é veredito; nada de "desafinado/errado"; foco externo de atenção; fading de feedback; aversão à perda só na ofensiva.
- **Acessibilidade AA:** estado nunca comunicado só por cor — sempre pareado com ícone. `prefers-reduced-motion` respeitado.
- **Paleta quente do Canto** (âmbar, brasa, ameixa, teal-afinado, ferrugem) — os hex são refinados abaixo, mas a família é a mesma.

### 1.2 O que o v2 SUPERSEDE (muda de verdade)

| Tema | v1 (sai) | v2 (entra) |
|---|---|---|
| **Tipografia display** | Fraunces (serifa editorial) | **Baloo 2** (rounded-bold, sem serifa). Fraunces **sai** por completo. |
| **Tipografia corpo/UI** | Figtree | **Nunito** (rounded, papel do DIN Next Rounded). Figtree vira só fallback. |
| **Forma da EVA** | Ser-de-som abstrato (fita de waveform, sem rosto fixo) | **Mascote-personagem**: uma **brasa-cantante** (chama fofa) com olhos enormes, no estilo gramatical da Duolingo. |
| **Botões** | 3D contido, "crescido" | **3D chunky** com lábio sólido `0 4px 0` e press-down completo — afordância tátil sem timidez. |
| **Celebração** | Glow + escala 1.06, "sem explosão de confete" | **Flat-playful juicy**: confete, bounce com overshoot, tally de XP contando, wash do gradiente Amanhecer, reação da mascote. (Ainda MPA-safe: sem punição, respeita reduced-motion.) |
| **Cantos** | 16–20px, "não pills completas" | Cantos **muito arredondados** + pills 999px liberadas para chips/badges. Geometria mais lúdica. |
| **Ação primária** | Brasa (CTA) | **Teal-afinado** ocupa o "slot do verde" da Duo (melhor contraste + "em tom = seguir"). Ver [decisão em aberto](#25-decisão-em-aberto-primário-teal-vs-âmbar). |

### 1.3 A gramática que estamos adotando (e onde divergimos)

O Canto e a Duolingo compartilham a **gramática visual**: flat geométrico, olhos enormes, sem contorno preto, uma emoção forte por pose da mascote, botões 3D com lábio sólido, tipografia rounded-bold. Divergimos na **espécie** (brasa-cantante vs. coruja), na **paleta** (quente vs. verde-limão) e no **fundo** (neutro alternável vs. branco frio). É "Duolingo de verdade, cor do Canto".

> **Aviso de fonte.** `design.duolingo.com` é uma SPA em JS e não renderiza via fetch. As specs abaixo foram reconstruídas de fontes secundárias verificadas (brandpalettes para os hex oficiais Feather Green #58CC02 etc.; fontsinuse/madegooddesigns para Feather Bold + DIN Next Rounded; tutoriais do método `box-shadow 0 4px 0` que a própria Duo usa; análises de motion) mais convenções conhecidas do design system (Eel/Wolf/Hare/Swan/Polar/Snow; extended palette #1CB0F6/#FF4B4B/#FFC800/#FF9600/#CE82FF). Os hex do Canto e o mapa semântico são **originais** desta proposta. **Antes do build final, validar o contraste real de cada par no WebAIM — o ponto de risco é o âmbar.**

---

## 2. Sistema Visual

### 2.1 Tipografia (rounded-bold, fontes livres, PT-BR completo)

Só **duas famílias**, ambas OFL no Google Fonts, uso comercial livre, com diacríticos PT-BR completos (ã õ ç á é í ó ú â ê ô). Um dev solo mantém isso fácil.

| Papel | Fonte | Pesos | Substitui |
|---|---|---|---|
| **Display / Hero** | **Baloo 2** | 600, 700, 800 | Feather Bold (proprietária) — e Fraunces do v1 |
| **Corpo / UI / Botões** | **Nunito** | 400, 600, 700, 800, 900 | DIN Next Rounded (proprietária) — e Figtree do v1 |

- **Botões:** Nunito 800, UPPERCASE, `letter-spacing: .04em`.
- **Numerais de XP/streak:** Baloo 2 700, `font-variant-numeric: tabular-nums`.
- **Alternativas display:** Fredoka (mais geométrica) ou Nunito 900 (menos "gorda"). **Alternativa corpo:** Figtree (mais neutra). **Evitar:** Varela Round (peso único), Quicksand (fino demais para UI densa).
- **Stack:** `font-display: 'Baloo 2','Fredoka',system-ui,sans-serif;` · `font-body: 'Nunito',system-ui,sans-serif;`

**Escala tipográfica** (base 16px / 1rem):

| Nível | Fonte / peso | Tamanho / line-height |
|---|---|---|
| Display XL (celebração/splash) | Baloo 2 700 | 48px / 1.1 |
| H1 (título de lição) | Baloo 2 700 | 28px / 1.15 |
| H2 (seção) | Baloo 2 600 | 22px / 1.2 |
| H3 (título de card) | Nunito 800 | 18px / 1.25 |
| Corpo | Nunito 600 | 16px / 1.5 |
| Corpo forte | Nunito 700 | 16px |
| Label / caption | Nunito 700 | 13px / 1.3, `letter-spacing .02em` |
| Botão | Nunito 800, UPPERCASE | 17px, `letter-spacing .04em` |
| Numeral XP/streak | Baloo 2 700, tabular-nums | contextual |

### 2.2 Paleta e tokens (CSS vars)

```css
:root {
  /* Ação primária / correto / afinado (slot do verde da Duo) */
  --teal-afinado: #1F8A76;   /* fill primário + "correto" */
  --teal-edge:    #15705E;   /* lábio 3D do botão teal */
  --teal-tint:    #E7F3EF;   /* fundo de acerto */
  --teal-ink:     #14705E;   /* texto/link sobre claro */

  /* Erro / desafinado (nunca vermelho-buzina) */
  --ferrugem:      #C4462C;
  --ferrugem-edge: #9C3620;
  --ferrugem-tint: #FBEAE6;

  /* XP / ouro / progresso + ACENTO DE MARCA onipresente */
  --ambar:      #F2A83B;     /* texto SEMPRE escuro sobre ele, nunca branco */
  --ambar-edge: #CF8622;

  /* Ofensiva / chama / energia */
  --brasa:      #E4572E;
  --brasa-edge: #BF4020;

  /* Premium / EVA / especial */
  --ameixa:      #7A3E93;     /* texto branco OK */
  --ameixa-edge: #5D2E70;

  /* Gradiente assinatura */
  --grad-amanhecer: linear-gradient(135deg,#7A3E93 0%,#E4572E 55%,#F2A83B 100%);

  /* Ramp neutro (texto / bordas / superfícies) */
  --carvao: #2E2A26;   /* texto primário */
  --lobo:   #6E6660;   /* texto secundário */
  --lebre:  #A8A29C;   /* desabilitado / placeholder */
  --cisne:  #E6E1DB;   /* bordas / edges neutros */
  --polar:  #F5F2EE;   /* cinza quente alternável */
  --neve:   #FFFFFF;   /* fundo base claro */
}

/* Dark mode (fundo neutro escuro, âmbar vira luminoso) */
:root[data-theme="dark"] {
  --bg:      #17130F;
  --surface: #221C16;
  --text:    #F5F2EE;
}
```

**Mapa semântico (estilo Duolingo, traduzido):**

| Estado | Cor | Detalhe |
|---|---|---|
| Correto / afinado | Teal `#1F8A76` fill · tint `#E7F3EF` · texto `#14705E` | + ícone check |
| Erro / desafinado | Ferrugem `#C4462C` fill · tint `#FBEAE6` · texto `#9C3620` | + ícone X + shake (nunca buzina) |
| XP / ouro / recompensa | Âmbar `#F2A83B` | **texto escuro `#2E2A26` sempre** |
| Ofensiva / streak / energia | Brasa `#E4572E` | + ícone chama |
| Premium / EVA / especial | Ameixa `#7A3E93` | texto branco OK |
| Info / link neutro | Teal escuro `#14705E` | — |
| Herói / celebração / halo EVA | Gradiente Amanhecer | splash, header de celebração |

> **Regra de ouro do âmbar:** `#F2A83B` sobre branco dá ≈1.9:1 (reprova AA). Usar âmbar só em **formas, fills, badges e display grande** — **nunca em texto de corpo**. Texto quente sobre claro = ferrugem `#C4462C` (≈4.7:1, passa AA). Texto padrão = carvão `#2E2A26`. Estado nunca só por cor: sempre pareado com ícone (check / X / chama / cadeado).

### 2.3 Botão 3D chunky — spec exata

O gesto tátil da marca. Lábio sólido (sem blur) + press-down que colapsa o lábio exatamente na sua altura.

```css
.btn {
  border-radius: 16px;
  min-height: 52px;
  padding: 14px 24px;
  background: var(--teal-afinado);
  color: #FFF;
  font: 800 17px/1 'Nunito', sans-serif;
  text-transform: uppercase;
  letter-spacing: .04em;
  box-shadow: 0 4px 0 0 var(--teal-edge);  /* lábio ~20% mais escuro, SEM blur */
  transition: transform .07s ease, box-shadow .07s ease;
  cursor: pointer;
}
.btn:hover        { filter: brightness(1.04); }
.btn:active       { transform: translateY(4px); box-shadow: 0 0 0 0 var(--teal-edge); }
.btn:focus-visible{ outline: 3px solid var(--ambar); outline-offset: 3px; }
.btn:disabled     { background: var(--cisne); box-shadow: 0 4px 0 0 #CFC8BF; color: var(--lebre); }

/* Tamanho L (CTA de tela cheia) */
.btn--lg          { min-height: 60px; box-shadow: 0 6px 0 0 var(--teal-edge); }
.btn--lg:active   { transform: translateY(6px); box-shadow: 0 0 0 0 var(--teal-edge); }
```

**Variantes** (todas com o mesmo `:active translateY(edge)`):

| Variante | Face | Lábio | Texto |
|---|---|---|---|
| Primário | `#1F8A76` | `#15705E` | branco |
| Secundário / tonal | `#FFFFFF` + `border 2px #E6E1DB` | `#E6E1DB` | teal `#1F8A76` |
| Texto / ghost | transparente, sem lábio | — | teal `#1F8A76` |
| Acento âmbar (Assinar/Super) | `#F2A83B` | `#CF8622` | **escuro `#2E2A26`** |
| Perigo (raro, deletar) | `#C4462C` | `#9C3620` | branco |

### 2.4 Componentes

**Cantos, spacing e tap targets.** Raios: chips/pills/badges = **999px**; botões/inputs/tiles = **16px**; cards = **20px**; container de ícone = **16px**; bottom sheet/modal = **28px** (topo); tags pequenas = **12px**. Spacing scale 4pt: `4,8,12,16,20,24,32,40,48,64`. Gutter de tela 16–20px; padding de card 20px; padding de botão 14×24. **Tap target mínimo 48×48px** (botões 52–60px de altura).

**Card.** bg Neve, radius 20px, padding 20px. Duas profundidades: (a) **chunky/tátil** = `box-shadow: 0 2px 0 0 #E6E1DB` (mini-lábio, combina com os botões); (b) **flat** = `border: 2px solid #E6E1DB`. Título Nunito 800 18px, corpo Nunito 600 16px. Hover web: `translateY(-2px)` + brilho leve.

**Badge / pill / chip.** radius 999px, altura 28–32px, padding 6×12, Nunito 800 13px. XP = âmbar + texto `#2E2A26` + ícone raio/nota. Streak = brasa + texto branco + ícone chama + número. Afinado = tint `#E7F3EF` + texto teal `#14705E`. Premium = ameixa + texto branco.

**Nó da trilha (path node).** Círculo 72px, botão 3D com fill da cor de estado + `box-shadow: 0 6px 0 [edge]`, ícone branco centralizado. Estados:
- **Bloqueado:** fill `#E6E1DB`, ícone cadeado `#A8A29C`, lábio `#CFC8BF`.
- **Atual:** fill teal `#1F8A76` + anel âmbar pulsante (2px → halo) + balão "COMEÇAR".
- **Concluído:** fill âmbar `#F2A83B` com check escuro (nó dourado).
- **Lendário/gilded:** fill com gradiente Amanhecer.
- Layout **zig-zag vertical**, conectores tracejados 4px `#E6E1DB`. Bounce no tap (scale 1 → 0.94 → 1).

**Header de lição.** Barra sticky, altura 56–64px, bg Neve, borda inferior 1px `#E6E1DB`. Esquerda: X de fechar (`#6E6660`, tap 44px). Centro: barra de progresso. Direita: contadores (corações/vidas em ferrugem, streak em brasa com chama, XP em âmbar). Padding lateral 16px.

**Barra de progresso.** Track `#E6E1DB`, altura 16px, radius 999px. Fill teal `#1F8A76` (ou âmbar em contexto de XP), cantos arredondados + highlight interno `inset 0 2px 0 rgba(255,255,255,.35)` (brilho glossy). Animação de width `cubic-bezier(.22,1,.36,1)` em 300ms. Opcional: shimmer ao completar.

**Tile de resposta (exercício).** radius 16px, border 2px `#E6E1DB`, `box-shadow: 0 2px 0 #E6E1DB`, padding 16px, min-height 56px. Selecionado: border teal + bg tint + lábio teal. Correto pós-check: border/lábio teal + check. Errado: border/lábio ferrugem + shake.

### 2.5 Motion e celebração juicy

**Tokens base.** Easings: pop/bounce = `cubic-bezier(.34,1.56,.64,1)` (overshoot); entrada = `cubic-bezier(.22,1,.36,1)`; saída = `cubic-bezier(.4,0,1,1)`. Durações: press de botão 60–90ms; micro-UI 120ms; transição de tela 220–260ms; celebração 400–700ms; confete 900–1400ms. Idle da mascote: "respiração" scale 1 ↔ 1.02 em 3s ease-in-out infinita.

**Celebração juicy:**
- **CORRETO:** flood teal + scale-pop 1 → 1.08 → 1 (260ms bounce) + som de acerto.
- **ERRADO:** shake horizontal `translateX ±6px` por 4 ciclos (320ms) + flash ferrugem + haptic suave. **Não punitivo.**
- **TALLY DE XP:** número conta pra cima via `requestAnimationFrame` 600–800ms ease-out, cada incremento com micro scale-bump + faísca âmbar; pill "+10 XP" sobe e quica.
- **LIÇÃO COMPLETA:** wash de tela com gradiente Amanhecer, EVA pula (scale + wiggle ±6°), confete estoura do centro-baixo (40–80 partículas nas cores da paleta, gravidade + rotação, 1000–1400ms, fade), revelações escalonadas (título 0ms, stats 150/300ms, botão 500ms).

**Acessibilidade de motion.** `@media (prefers-reduced-motion: reduce)`: trocar transforms por fade de opacidade, **sem shake, sem confete** (ou só um flash estático de sucesso). Confete via `canvas-confetti` (lib minúscula) com as cores da paleta Canto.

### 2.5 Decisão em aberto (primário: teal vs. âmbar)

Recomendação: **ação primária = TEAL** (melhor contraste + o sentido literal "afinado = seguir em frente"). Alternativa, se o fundador quiser botão primário **quente**: âmbar `#F2A83B` + texto escuro `#2E2A26` + lábio `#CF8622` — **mas** então o XP precisa migrar para outra cor (ex.: brasa), porque a Duo mantém deliberadamente **primário ≠ recompensa** (não usar a mesma cor no botão e no prêmio). Documentar a escolha antes do build.

---

## 3. EVA — a Mascote (brief de construção SVG)

EVA vira **personagem**: uma **brasa-cantante** — uma criatura-chama fofa e arredondada, construída de primitivas geométricas simples. O corpo é o próprio gradiente Amanhecer: âmbar que esquenta pra brasa na base e clareia pra dourado na ponta. Escolhemos a chama (e não faísca/gota/nota) porque resolve três coisas de uma vez, como a Duo resolve tudo sendo "corpo + asas": (1) é literalmente um **ser-de-som quente** — a voz é calor que irradia, e ela acende mais forte quando você canta bem; (2) reduz a **uma silhueta forte** (teardrop/chama) legível a 16px; (3) mapeia **uma emoção forte por pose** (princípio central da Duo).

> **Alternativa registrada:** um **sabiá** estilizado (pássaro cantor nacional, culturalmente ressonante no beachhead gospel) — corpo cápsula âmbar, bico sempre aberto cantando, crista/topete com o gradiente Amanhecer. As duas direções compartilham a gramática; a **chama** é a recomendação primária por reduzir melhor a 16px. O brief detalhado abaixo é o da chama; o esqueleto do sabiá está em [§4.4](#44-alternativa-sabiá-esqueleto-svg).

### 3.1 Sistema de coordenadas

`viewBox 0 0 240 240`, origem topo-esquerda, y pra baixo. Mascote ocupa x:48–192 (144 largura) e y:34–224 (190 altura). Aspecto ~1:1.30 (mais alta que larga = voz sobe). Simetria em **x=120**. Sem pescoço: cabeça e corpo são um só bulbo. **Nunca contorno preto** (mata o calor); se precisar de borda em fundo branco a 200px+, usar brasa `#C4462C` 1.5px só na aresta inferior. **Nunca girar a chama** — a ponta é sempre pra cima.

### 3.2 Ordem de camadas (de trás pra frente)

1. **(opcional)** ondas teal / faíscas por trás.
2. **Corpo-chama:**
   ```html
   <path d="M120 34 C158 66 192 108 192 148 A72 72 0 1 1 48 148 C48 108 82 66 120 34 Z"
         fill="url(#amanhecer)"/>
   ```
   `defs`: `linearGradient` vertical id=`amanhecer`, stops: 0% (topo) `#F7C948`, 45% `#F2A83B`, 100% `#E4572E`. **Versão flat/ícone:** `fill="#F2A83B"`.
3. **Brilho dourado (upper-left):** `<ellipse cx="100" cy="104" rx="40" ry="52" fill="#F7C948" opacity=".35"/>` com clip no corpo.
4. **Bochechas:** `<ellipse cx="78" cy="178" rx="10" ry="8" fill="#E4572E" opacity=".22"/>` + espelho em cx=162.
5. **Olhos brancos:** `<circle cx="100" cy="150" r="27" fill="#fff"/>` + `<circle cx="140" cy="150" r="27" fill="#fff"/>` (se tocam/sobrepõem = look Duo).
6. **Pupilas ameixa-escura:** `<circle cx="105" cy="152" r="13" fill="#3A1F4A"/>` + `<circle cx="135" cy="152" r="13" fill="#3A1F4A"/>`. Olhar: desloca ambas ±3–4px juntas.
7. **Brilho do olho:** `<circle cx="109" cy="148" r="4" fill="#fff"/>` + espelho em cx=139.
8. **Boca idle:** `<path d="M107 194 Q120 204 133 194" stroke="#7A3E93" stroke-width="2.5" fill="none" stroke-linecap="round"/>`. **Cantando:** `<ellipse cx="120" cy="199" rx="16" ry="20" fill="#7A3E93"/>` (oval alto = boca aberta, rim dourado `#F7C948` 1.5px opcional).

**Acentos.** Ondas de som = 2–3 arcos concêntricos teal `#1F8A76`, stroke 5px round-cap, raios 18/30/42, centrados fora do corpo (ex.: (205,118)). Faíscas de celebração = 4–6 estrelas de 4 pontas dourado/teal, 8–14px, ao redor da ponta; a ponta racha em 2–3 flâmulas. Pés (só corpo inteiro) = dois nubs ferrugem `#C4462C` 18×10 r5 em (104,226) e (136,226) — omitidos no ícone e no idle flutuante.

### 3.3 Rig de expressões (uma emoção forte cada)

| Pose | Olhos | Boca | Animação |
|---|---|---|---|
| **Ociosa (idle)** | redondos, pupilas centro-baixo | sorriso fino | corpo scale-Y 100↔102% + `translateY ±2px`, 2.4s ease-in-out (respira/flameja) |
| **Escutando** | maiores (pupila r=14) | "o" pequeno | inclina o grupo ~8° (rotate em torno de (120,180)); 2 arcos teal **entrando** pela direita |
| **Alegria/Celebração** | crescentes `^ ^` (troca circle por `<path d="M92 150 Q100 140 108 150" stroke="#3A1F4A" stroke-width="5"/>`) | cantando (elipse ameixa) | scale-Y +15% (ponta racha em flâmulas), 4–6 faíscas com pop `cubic-bezier(.34,1.56,.64,1)` |
| **Encorajando** (após erro — nunca zomba) | uma pálpebra pisca (um olho vira arco) | sorriso aberto pequeno | leve lean +5° pro usuário, bochechas +opacidade, 1 estrela dourada flutuando ao lado |

Conjunto mínimo para começar = essas 4 + a **pose de escuta assinatura** (cabeça inclinada + anéis de onda) já coberta em "Escutando".

### 3.4 Redução a ícone e ícone do app

- **Ícone 16–48px:** mantém silhueta-chama âmbar chapada + 2 olhos (pupilas ameixa-escura) + brilho branco. Remove gradiente, ripples, bochecha; boca vira 1 ponto ou some. Mono/negativo: chama `#F2A83B` sólida com olhos **recortados** em branco. Área de proteção = 12% da largura.
- **Ícone do app:** rounded-square iOS (superellipse, corner ~22%). Fundo = **Amanhecer escuro** `linear-gradient(135deg,#4A2560,#E4572E,#F7C948)`. EVA na frente em âmbar+dourado, olhos brancos, 1 faísca teal no alto-direita. Padding 16% do lado. Ember-no-escuro = a EVA **brilha** (contraste), virando amanhecer na home screen.

### 3.5 Entrega técnica (dev solo)

Comece com **Lottie** (`lottie-web`) para animações pré-renderadas (mais barato/simples). Migre para **Rive** se quiser reações state-driven em tempo real (é o que a Duo usa). Rig para animação: manter r-olho e espaçamento constantes; animar só **bounce** (scale do corpo), **crista/ponta** e **pupilas**. Sincronizar as poses com os três eventos sonoros (ver [§5](#5-feedback-sonoro-sobre-o-toneplayer)) — dupla codificação som+visual.

---

## 4. Logo (wordmark + ícone do app)

### 4.1 Wordmark

- **"Canto"** em **Baloo 2 700/800**, minúsculas ou capitalizado, cor **carvão `#2E2A26`** (claro) ou **creme/branco** (escuro). **Sem serifa, sem itálico** — o antigo `Cant-o` itálico do v1 **sai**.
- Acento de marca (âmbar) só no **traço/ponto**, nunca no texto inteiro (legibilidade).
- **Motivo de som opcional** no "o": o "o" vira um **anel de afinação** (ring âmbar + ponto brasa = cabeça de nota / alvo "no tom"), ou uma **onda sonora** sublinhando o wordmark. Reforça "canto/voz".
- **Lockup:** EVA à **esquerda** do texto (horizontal), com espaço = altura de um olho (~54px @240). Versão empilhada: EVA em cima, "Canto" embaixo, centralizado.

### 4.2 Glifo "o" (motivo de som) — reutilizável em wordmark e favicon

```html
<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="none" stroke="#F2A83B" stroke-width="16"/>
  <circle cx="50" cy="50" r="14" fill="#E4572E"/>
  <!-- arco de som opcional (remover no favicon): -->
  <path d="M 50 2 A 48 48 0 0 1 92 74" fill="none" stroke="#F2A83B" stroke-width="2.5" opacity="0.4"/>
</svg>
```

### 4.3 Ícone do app + família de ícones

- **Tile (1024):** `<rect width=1024 height=1024 rx=229 fill="url(#amanhecer)"/>` + glow radial creme no topo (opacity .18) + 2 círculos creme opacity .08 (r 360 e 460) atrás da EVA + EVA escalada a ~62% do tile, centro-baixo, com halo creme 6px na silhueta pra separar do fundo âmbar. **Sem texto.**
- **Adaptativo Android:** 108×108dp, safe zone 72×72dp. Camada BACKGROUND = Amanhecer full-bleed; FOREGROUND = EVA dentro do círculo seguro de 66dp (pontas da chama/crista **dentro** do safe circle); MONOCHROME (Android 13) = silhueta EVA em cor única.
- **apple-touch-icon:** 180×180 PNG, sem alfa, cantos quadrados (iOS mascara). Fornecer também 152, 167, 120.
- **Favicon:** usar o **motivo "o"** (anel âmbar + ponto brasa), não a EVA. 16/32/48 + `.ico` multi-size. Versão dark idêntica (o anel âmbar funciona nos dois).
- **Maskable & loja:** maskable 512×512 com 20% de padding seguro; Play Store 512×512 e App Store 1024×1024 = tile Amanhecer full-bleed + EVA com halo creme, **sem alfa, sem cantos arredondados baked, sem badges/texto**.

### 4.4 Alternativa sabiá (esqueleto SVG)

`viewBox 0 0 200 200`, camadas de trás pra frente: (1) asas meia-lua r=26 em (58,120) e (142,120), fill `#E08A2A`; (2) corpo cápsula centro (100,112) 96×110, fill Amanhecer-lite (âmbar topo → `#E08A2A` base); (3) barriga `<ellipse cx=100 cy=128 rx=27 ry=31 fill=#FFF6E9>`; (4) equalizer opcional na barriga (3 `<rect>` teal quando canta); (5) olhos 2 `<circle r=15 fill=#3A2A2E>` em (84,100),(116,100) + brilho r=5 em (80,96),(112,96); (6) bico **aberto** em (100,120), dois triângulos (superior `#F2843B`, inferior `#E4572E`), gap ~8; (7) crista assinatura em (100,58), 3 pétalas leque 24° — esq `#7A3E93`, meio `#E4572E`, dir `#F2A83B`; (8) pés brasa em (86,168),(114,168). Rig: manter r-olho=15 e espaçamento=32 constantes; animar só bounce, crista e pupilas.

### 4.5 Migração no repo

- `src/pages/Landing.tsx`: trocar `Cant<em>o</em>` pelo wordmark com glifo (o `<em>` itálico **sai**).
- `src/styles/auth.css`: em `.auth-word em {}` remover `italic`.
- `.auth-logo`: trocar o Icon "spark" pela cabeça da EVA ou pelo anel-"o".
- Fontes: adicionar `@font-face`/Google **Baloo 2 + Nunito** (+ Fredoka opcional) e apontar `--font-display` para Baloo 2.

---

## 5. Feedback Sonoro (sobre o TonePlayer)

O maior buraco reportado ("a pessoa não sabe o que está fazendo, falta feedback sonoro") se resolve tornando o **áudio — não a tela — o professor do iniciante**, exatamente onde a pedagogia manda: som-antes-do-símbolo (Gordon/Suzuki/Kodály), modelagem antes da tentativa (Rosenshine), feedback de competência como alavanca de engajamento durável (SDT).

**Loop-núcleo do iniciante = call-and-response por pitch:** EVA toca o alvo ("cante ESTA nota"), o tom **some**, a pessoa iguala de memória, e um **sino de confirmação** toca quando o pitch trava afinado.

Tudo se constrói sobre `src/audio/TonePlayer.ts` (AudioContext próprio, já isolado do mic; triangle+lowpass; master gain; `playChord`/`playNote`/`stop`/`resume`/`now`), estendido com 4 timbres novos.

### 5.1 Duas restrições que regem tudo

1. **Anti-vazamento:** som e escuta nunca se sobrepõem (o alvo some **antes** de o mic pontuar), teto de nível **0.2**, ducking, e banner "use fones" na primeira sessão.
2. **Anti-dependência (hipótese da orientação):** o tom de referência e o drone **fadeiam e são retirados** conforme o iniciante acerta; o feedback contínuo é de **banda** (>25 cents), nunca uma linha nervosa. **Nenhum som é veredito** — só confirmação positiva e nudges gentis; **nada de buzzer**. Erro = ausência de confirmação + nudge neutro.

### 5.2 Extensões ao TonePlayer

| Método | O que faz |
|---|---|
| `playReference(midi, {sustain=1.4, level=0.16, vowel:'loo'})` | Toca UMA nota-alvo sustentada com timbre vocal-like ("loo"): Oscillator `triangle` + `sine` a +0 dobrando 6dB abaixo (corpo de "oo"), no lowpass ~1500Hz. Envelope: attack 0.12s → hold → release 0.30s. **Sem vibrato.** Retorna `Promise<void>` que resolve **quando o som ficou totalmente em silêncio** (gancho anti-vazamento). |
| `confirmChime(midi)` | Pluck curto de 2 notas ascendentes (alvo + 3ª maior OU 5ª justa: `midi`, `midi+4` ou `+7`), deslocadas ~90ms. Cada nota: `sine` (+ `triangle` 10dB abaixo pra brilho de sino), decay exponencial `0.10 → 0.0001` em 0.18s. Pico 0.10, total ~0.3s. Dispara UMA vez na borda de subida da trava. |
| `tick({level=0.05})` | Nudge **não-pitchado**: ruído branco ~60ms → bandpass ~2kHz → gain 0.05 decay. Só após desvio sustentado `|cents|>25` por >600ms, rate-limit 1 a cada 1.5s. Tom neutro ("ainda procurando"). |
| `setWarmth(cents)` + ducking do master | Expõe o BiquadFilter existente para o **brilho/bloom** do drone: `|cents|` 0→50 controla o lowpass de ~2200Hz (afinado, brilhante) a ~900Hz (longe, abafado) via `setTargetAtTime(v, now, 0.12)`. Só ativo com drone ligado. |

### 5.3 Sequenciamento e orquestrador

**Máquina de estados do match** (o alvo nunca soa enquanto o mic pontua): `PLAYING_TARGET` (toca `playReference`, mic mudo) → aguarda a Promise (silêncio) → `LISTENING` (mic pontua, nenhum tom) → `LOCKED` (confirmação). "Ouvir de novo" reentra em `PLAYING_TARGET`.

**Novo módulo `src/audio/noteMatchCoach.ts`** (classe pura, RN-safe, espelhando `src/domain/onboarding/firstInTune.ts`, sem React): recebe o TonePlayer e o alvo. Métodos `start(midi)` (transpõe → `playReference` → resolve no silêncio), `feed(frame: PitchFrame)` (gating de confirmação, brilho do drone, tick; mantém `armedLock`/último tick/contador de travas), `stop()`. Emite eventos `{type:'locked'|'drift'|'bloom', ...}` para a UI sincronizar EVA (dupla codificação).

**Gatilho da confirmação:** disparar `confirmChime` na transição para trava estável — `frame.locked` passa a true **E** `lockMs>=300` **E** `|cents|<=~20` **E** não disparou nos últimos 1200ms. Rearmar só quando `locked` volta a false por >400ms. No match, exigir também `frame.note.midi == alvo (±12)`; no onboarding free-mode, aceitar qualquer nota travada. **Nenhum cue reativo responde a frames com <120–150ms de estabilidade.**

**Drone-guia (default OFF):** reusa `playChord`, mas toca a tônica/alvo **uma 8ª ou 5ª abaixo** da nota cantada, nível 0.08–0.10, auto-fade e retirada após N=3 travas limpas ("agora sem a guia"). Enquanto toca, o mic pontua normalmente (banda separada reduz mascaramento). Durante a janela de trava, aplicar ducking do drone (`master.setTargetAtTime(0.06, now, 0.1)`).

**Transposição:** helper `transposeToComfort(targetMidi, voiceType|rangeMidi)` desloca por ±12 até a faixa confortável (usa `RangeTest`/`voiceType.ts`) antes de `playReference`. Botões "muito grave ↑" / "muito agudo ↓" chamam `playReference(midi±12)`.

### 5.4 Identidade sonora (ativo de marca — é um app de VOZ)

Fuja dos timbres sintéticos da Duolingo e use timbres **acústicos/vocais** pra reforçar identidade de canto e o beachhead gospel. Esta paleta de 3 sons **é a voz não-verbal da EVA**, consistente em onboarding, trilha e exercícios:

1. **Timbre "loo" macio** (triangle+sine, lowpass ~1500) = a "voz" da EVA cantando o alvo. Grave uma vez e reuse.
2. **Sino de confirmação** (terça/quinta ascendente, decay rápido) = o **"som de acerto" assinatura do Canto** — o momento de recompensa da marca. Caloroso e gospel-friendly, **jamais arcade**. Um jingle/abertura pode derivar do mesmo sino (terça+quinta).
3. **Nunca há som negativo** — a ausência do sino é o "não ainda".

Sabor gospel nos momentos grandes: acerto = pluck de marimba/piano ou terça maior curta (~200ms); lição completa = arpejo triunfante ou stab de coral "ahh"; streak = whoosh + sino. Tudo <300ms, normalizado, mp3+ogg, pareado com haptics, respeitando o mute do sistema. **Um `sonic-logo` de ~0.6s** (glissando ascendente que "trava" num acorde maior — o equivalente sonoro do anel fechando no alvo) no splash e na celebração; a EVA "abre o bico" sincronizada.

**Arquivos a tocar:** `TonePlayer.ts` (novos métodos), novo `noteMatchCoach.ts`, `Onboarding.tsx` (passo de match), `firstInTune.ts` (alvo opcional com tolerância de oitava), `HarmonyTrainer.tsx` (reusa o toggle de drone), `voiceType.ts`/`RangeTest.tsx` (`transposeToComfort`). `midiToFreq`/`freqToNote`/`midiLabel` já existem em `notes.ts`.

---

## 6. Linguagem Simples (anti-jargão)

O fundador está certo: as pessoas não sabem o que é *humming*. Todo termo técnico da copy atual (verificado em `src/data/coaching.ts`, `src/data/adaptive.ts`, `src/domain/eva-voice/prompt.ts`, `src/data/achievements.ts`) é barreira de entrada para o beachhead — adultos iniciantes gospel/worship que nunca tiveram aula. A espinha dorsal é o **foco externo de atenção** (Chua/Wulf et al. 2021, g≈0,58 em retenção e transferência): sempre nomear pela **sensação** ou pelo **som/resultado**, nunca pela anatomia interna.

### 6.1 Regra de primeira aparição (global)

Nenhum termo técnico aparece nu. Na **primeira** vez em qualquer tela, o termo vem com a ação entre aspas na mesma frase: *"Faça um humming (um mmm de boca fechada)."* Depois, o app pode usar só o leigo ("o mmm") ou o técnico com tooltip. Implementar como componente reutilizável **`TermoLeigo`** (props `termo`, `leigo`, `acao`, `audioId`) que renderiza o leigo inline + chip clicável com o técnico + botão **ouvir** (toca exemplo de 2–3s). Fonte única de verdade: **`src/data/glossario.ts`**.

### 6.2 Tabela de mapeamento (técnico → leigo + ação)

| Termo técnico | Leigo + ação (foco externo) |
|---|---|
| **humming** | faça um **mmm de boca fechada** (lábios juntos e relaxados, tipo *mmm-hmm* de quem concorda). Nunca escrever só "humming". |
| **SOVT / semi-oclusão / canudo** | **assopre a nota como se soprasse por um canudo fininho** (ou cante com um canudo dentro de um copo d'água). "SOVT" vira rodapé opcional. |
| **lip trill / trill de lábios** | faça **brrrr com os lábios**, tipo criança imitando motor de moto. Solte o ar e deixe os lábios vibrarem sozinhos. |
| **sirene / glide** | **deslize a voz do grave pro agudo e volta, sem degraus**, igual sirene de ambulância. Som escorregando, sem pulos. |
| **passaggio / quebra de registro** | a **viradinha da voz** — o ponto onde a voz quer trocar de marcha subindo. Atravesse a viradinha devagar, em sirene, sem forçar o peito pra cima. |
| **apoio / appoggio** | **segurar a nota firme com o fôlego** — ar constante e costelas abertas até o fim, sem murchar. Guarde ar pro final. |
| **tessitura / range / faixa** | a **faixa de notas onde sua voz é confortável** (sem apertar nem soprar). "Vamos treinar na sua faixa confortável." |
| **registro de peito** | a **voz de peito** — parecida com a de falar, cheia e forte; você sente vibrar no peito. Sem certo/errado. |
| **registro de cabeça** | a **voz de cabeça** — mais leve e alta, ressoa lá em cima, na testa. Nem melhor nem pior, é outra cor. |
| **mix / voz mista** | a **voz mista** — meio-termo que junta a força do peito com a leveza do agudo, sem quebrar na viradinha. |
| **falsete** | o **falsete** — voz fininha e soprada lá do alto, mais soltinha, menos corpo. |
| **vibrato** | o **tremidinho natural** que a nota faz sozinha quando você relaxa. Não force; segure relaxado e deixe oscilar. **Nunca ensinar vibrato na força.** |
| **onset / ataque** | o **jeito de começar a nota** — limpa e no ponto, sem raspar (aperto) nem soprar (ar antes do som). |
| **ressonância / máscara / colocação** | deixe a voz **zunir na frente do rosto** (nariz e bochechas). Mire o som pra frente, como se saísse pela testa. |
| **soproso / breathy** | **voz com ar escapando junto** (um chiado com a nota). Feche um pouco mais o som pra ficar mais cheio. |
| **messa di voce** | **cresça e diminua o volume na MESMA nota** — comece baixinho, abra pro forte, volte pro baixinho. |
| **afinação / pitch / F0 / cents** | **acertar a nota certa** e quão perto do alvo você ficou. "Ficou um tiquinho abaixo — mire um cabelinho mais pra cima." Nunca "F0/cents" crus. |
| **quebra / "a voz quebrou"** | manter o termo do público, mas reenquadrar: "isso é a viradinha pedindo passagem devagar — normal, dá pra alisar". |
| **jitter / shimmer / clarity** | **firmeza e limpeza da voz** (o quanto a nota fica parada e limpa). Nunca expor os termos ao usuário. |
| **formante do cantor / brilho** | o **brilho que faz a voz cortar** e ser ouvida sem microfone. Uma ferramenta/cor, não "o som certo". |
| **audiação / ouvido interno** | **ouça a nota na cabeça ANTES de cantar** — imagine o som, depois solte. |
| **aquecimento** | manter (já é popular), sempre com promessa de segurança: "esquentar a voz antes, pra cantar sem forçar — canto não dói. Comece SEMPRE por aqui." |
| **escala / arpejo / salto** | escala = **subir e descer as notas em ordem, tipo escadinha**; arpejo = **pular de degrau em degrau**; salto = pular direto pra uma nota mais distante. |

### 6.3 Os 7 princípios de escrita

1. **Diga o que FAZER, não o que É.** Toda instrução começa com verbo de ação no imperativo (Solte, Deslize, Segure, Mande pra frente). Definições vêm depois, curtas.
2. **Uma instrução por vez.** Uma deixa focal por mensagem: pitch OU respiração OU vogal — nunca pilha. Se há vários erros, EVA escolhe o de maior alavancagem e cala o resto.
3. **Nomeie pela SENSAÇÃO ou SOM, nunca pela anatomia.** Proibido instruir por partes internas ("abaixe a laringe"). Use resultado sonoro ou imagem externa.
4. **Nunca pressuponha conhecimento.** Zero termo técnico sem tradução+ação na primeira aparição. Nada de siglas cruas (SOVT, F0, KP/KR, cents). Se precisa explicar o termo pra frase fazer sentido, o termo está errado — troque pelo leigo.
5. **Traduza para imagem cotidiana brasileira.** Canudo, sirene de ambulância, brrr de motor, bocejo (abrir a garganta), empurrar um carro (apoio), cheiro de flor (inspiração baixa). Referências BR universais, não termos de método estrangeiro.
6. **Feedback é distância-ao-alvo, nunca veredito sobre a pessoa.** Proibidas: "desafinado", "errado", "ruim", "falhou", "você não consegue". Todo feedback aponta variável específica e consertável ("ficou um tiquinho abaixo", "faltou ar no fim") + próxima ação. Comparação só com a própria pessoa.
7. **Leigo primeiro, técnico opcional (progressive disclosure).** A frase principal é 100% leiga. O termo científico aparece, se aparecer, entre parênteses ou num chip "saiba o nome" clicável — nunca obrigatório pra entender.

**Alvo de legibilidade:** frases curtas (até ~14 palavras), voz ativa, 2ª pessoa ("você"), nível ~6º ano. Uma ideia por frase. EVA fala como coach caloroso ao lado ("bora", "um tiquinho", "gostoso"), não como manual.

### 6.4 Áudio + EVA (o coração do problema)

Texto **não** ensina um som. Cada linha da tabela precisa de exemplo audível de 2–3s tocável por um botão "ouvir". Prioridade de gravação: humming (mmm), brrr de lábios, sirene, canudo/SOVT, os 4 registros lado a lado (peito/cabeça/mix/falsete), vibrato natural, messa di voce. EVA **modela o som antes de pedir** (exemplo trabalhado, Rosenshine) e pode disparar esses exemplos na conversa ("quer ouvir como é?"). Os gestos-chave (boca fechada relaxada, lábios vibrando, boca em canudo, sirene subindo/descendo) viram tanto **ícones do glossário** quanto **expressões da mascote** — reuso direto.

**Implementação:** criar `src/data/glossario.ts` (fonte única, espelha a tabela) + componente `TermoLeigo`; migrar as strings cruas ("lip trill", "SOVT", "messa di voce", "passaggio", "appoggio") que hoje vazam em `coaching.ts`/`adaptive.ts`/`prompt.ts` para passarem pelo glossário. Priorizar `Onboarding.tsx`, depois `ExercisePlayer`, `Dashboard`, `coaching.ts`/`adaptive.ts`.

---

## 7. Onboarding Consertado

**Problema-raiz** do passo atual (`MasteryNoteStep` em `src/pages/Onboarding.tsx`): pede "cante uma nota" **sem alvo** e depende de `f.locked` — a trava do afinador — para vencer. No backend fallback (analyser, sem COOP/COEP) essa trava degrada, então o iniciante canta e nada acende: sem alvo, sem som, sem saber o que fazer.

**A virada:** o app **toca um tom de referência** (via TonePlayer) e o iniciante só precisa **igualar**. Isso dá (1) alvo concreto e audível, (2) feedback sonoro o tempo todo (o drone soa enquanto ele canta — ele ouve os batimentos sumirem quando encaixa), e (3) uma métrica robusta que **não** depende de `f.locked`: cents contra o alvo conhecido, **octave-agnóstica**, idêntica no worklet e no fallback. Passaggio/tessitura saem 100% do caminho crítico. **Zero telas de falha.**

Linguagem só: "som", "igualar", "mais grave", "mais agudo", "igualzinho", "segura mais um pouco". Nada de "passaggio", "tessitura", "firmeza", "semitons".

### 7.1 Novo passo `MatchToneStep` (substitui `MasteryNoteStep`)

Três subfases: **`ouca` → `canta` → `won`**.

- **`ouca`:** card com botão gigante primário **"Ouvir o som"** que chama `tone.resume()` + `tone.playNote(TARGET)` (o gesto do usuário satisfaz a política de autoplay). O drone **sustenta**. Copy única: *"Toca esse som e escuta bem."* Botão secundário "Ouvir de novo"; botão "Agora não" (`onSkip` → range). Linha discreta: *"De fone fica ainda melhor 🎧"*.
- **`canta`:** dispara `engine.start()`; o drone **continua**; título *"Agora canta junto — faz um ahhh no mesmo som"*. Mostra o **BlendRing** + chip de direção ("mais grave" / "mais agudo" / "isso, igualzinho!"). Vitória quando o cantor mantém `|cents|<=THRESHOLD` por ≥700ms → `won`. Sempre há um botão ghost "Seguir" → range.
- **`won`:** `engine.stop()` + `tone.playChord([target, target+4, target+7], {level:0.16, attack:0.05})` (~700ms) → `tone.stop()`. `unlockAchievement('primeira-nota-afinada')`. Copy: *"Isso! Você igualou o som — foi você que fez."* Sem citar nome de nota. Botão "Continuar" → range.

`TARGET = MIDI 57 (A3, 220Hz)`, tocado com `tone.playNote(57, {level:0.12, attack:0.3})`. Como o match é octave-agnóstico, esse único drone central serve voz grave e aguda. Const no topo do arquivo.

### 7.2 Métrica octave-agnóstica (`MatchTargetDetector`)

Novo detector em `src/domain/onboarding/firstInTune.ts`, ao lado do `FirstInTuneDetector`:

```
class MatchTargetDetector(targetMidi, thresholdMs=700, centsTol=40)
```

Por frame com `f.freq!=null` e `f.rms>=RMS_SPEAK (~0.01)`: `midiF=freqToMidiFloat(f.freq)`; `k=Math.round((midiF-targetMidi)/12)`; `cents=(midiF-(targetMidi+12*k))*100`; `inTune = |cents|<=centsTol`. Acumula tempo contíguo `inTune`; `feed()` retorna a nota vencedora quando o tempo contíguo ≥ `thresholdMs`. Expõe `cue(frame)→{cents, dir: 'suba'|'desca'|'ok', matched}`. **Não usar `f.locked` como condição de vitória.**

### 7.3 BlendRing (substitui `div.onb-note-cue`)

Anel SVG/CSS grande (~180px) centralizado. Cor mapeada a `|cents|`: **>120c** cinza-frio (longe), **120→40c** âmbar aquecendo, **≤40c** verde-água `#57d6a6` pulsando + halo. No centro, texto **grande só com direção** em linguagem simples ("MAIS GRAVE ↓", "MAIS AGUDO ↑", "ISSO! ✓") — **nunca** o nome da nota. Barra fina de progresso do hold (0→700ms) surge por baixo quando matched ("segura mais um pouquinho"). Atualização direto no ref (sem `setState` por frame). O BlendRing pode ecoar a waveform do brand-mark, fechando a identidade visual.

Tokens: `--onb-match:#57d6a6` · `--onb-warm:#e9b44c` · `--onb-far:#6b7280` · `--onb-glow:rgba(87,214,166,0.45)`.

### 7.4 Rede de segurança adaptativa (todo mundo vence)

Timer desde o início da escuta:
- **10s sem vitória:** alargar `centsTol` de 40→70; chip vira "quase! chega mais perto do som".
- **18s:** **assistência** — ler a mediana do `midiF` cantado nos últimos ~1.5s e fazer `tone.playNote(medianMidiSnapToPitchClass)` deslizando o drone **PRA** nota do cantor (encontro no meio do caminho), garantindo `|cents|~0` e vitória em <1s. Nunca exibir erro; o pior caso é o app "vir até você". O botão "Seguir" continua disponível o tempo todo.

### 7.5 Passaggio/tessitura fora do onboarding

No step `range`, passar `<RangeTestFlow mode="quick" .../>`. Em modo `quick`, pular direto de `high` para `done` (não entrar em `tessitura` nem `passaggio`): em `RangeTest.tsx` linha ~177, se `mode==='quick'` chamar `finish()` em vez de `setStep('tessitura')`. Os passos tessitura/passaggio continuam **integralmente** na página `/range` (`RangeTestPage`), para o usuário mais avançado depois.

### 7.6 Barra de progresso e ciclo de vida

- **Dots (`onb-dots`):** refletem a nova ordem; `range` quick conta como 1 etapa. Adicionar rótulo "Passo 2 de 4" + micro-texto do que vem ("agora: sua voz"). Sempre um caminho de avanço visível.
- **TonePlayer:** `toneRef = useRef<TonePlayer|null>(null)`; criar lazy no primeiro gesto (padrão do `HarmonyTrainer.tsx` linha ~162). Cleanup no unmount: `toneRef.current?.dispose()` + `engine.stop()`. Ao entrar em `won` e em `onSkip`/`onDone`, parar o drone com `tone.stop()` antes de navegar (não vazar som pro range).
- **Áudio:** o único gerador é o TonePlayer (oscilador triangle+lowpass 1800Hz) — **não** introduzir `<audio>`/samples (mantém o bundle leve, evita cross-origin). O AudioContext do TonePlayer é **separado** da PitchEngine (mic) e os dois coexistem — por isso o feedback sonoro contínuo funciona mesmo no fallback, sem isolamento COOP/COEP.
- **EVA:** o passo de match é o momento ideal pra EVA aparecer como **companheira cantando junto** — estados "escutando" (ondas) e "comemorando" no `won`, espelhando o BlendRing. Ela dá a direção em fala curta ("mais grave...", "isso!") — nunca cifra.

**Arquivos a tocar:** `src/pages/Onboarding.tsx` (novo `MatchToneStep`), `src/domain/onboarding/firstInTune.ts` (novo `MatchTargetDetector`), `src/pages/RangeTest.tsx` (prop `mode='quick'`), `src/styles/onboarding.css` (BlendRing, chip de direção, barra de hold). Reaproveitar cents/needle do `HarmonyTrainer.tsx` (linhas ~94–105) e o ciclo do TonePlayer.

---

## 8. Ordem de Implementação Sugerida

Sequência para um fundador solo — cada onda entrega valor visível e destrava a próxima.

**Onda 0 — Fundação de tokens (meio dia).**
1. Adicionar `@font-face`/Google **Baloo 2 + Nunito**; apontar `--font-display` → Baloo 2, `--font-body` → Nunito.
2. Escrever os **CSS vars** de [§2.2](#22-paleta-e-tokens-css-vars) (paleta + ramp neutro + gradiente). Substituir os tokens do v1 in-place.
3. Implementar o **`.btn` 3D chunky** + variantes ([§2.3](#23-botão-3d-chunky--spec-exata)) e o **Card** ([§2.4](#24-componentes)). Validar contraste no WebAIM (foco: âmbar).

**Onda 1 — Onboarding consertado (a maior alavanca de retenção).**
4. `MatchTargetDetector` em `firstInTune.ts` (puro, testável isolado).
5. Extensões do TonePlayer: `playReference` (com Promise de silêncio), `confirmChime`.
6. `MatchToneStep` + BlendRing + rede de segurança adaptativa; `RangeTest` `mode='quick'`. **Verificar no backend fallback.**

**Onda 2 — Linguagem simples.**
7. `src/data/glossario.ts` (fonte única) + componente `TermoLeigo`.
8. Migrar as strings cruas de `coaching.ts`/`adaptive.ts`/`prompt.ts` pelo glossário; rewrite de copy começando por `Onboarding.tsx`.

**Onda 3 — Mascote e marca.**
9. EVA SVG (corpo-chama + 4 poses + pose de escuta), primeiro estático, depois Lottie ([§3](#3-eva--a-mascote-brief-de-construção-svg)).
10. Wordmark Baloo 2 + glifo "o"; **migração no repo** ([§4.5](#45-migração-no-repo)): tirar o `<em>` itálico, trocar o Icon "spark".
11. Família de ícones do app (tile, adaptativo Android, apple-touch, favicon, maskable).

**Onda 4 — Feedback sonoro rico e celebração juicy.**
12. `tick` + `setWarmth`/ducking no TonePlayer; `noteMatchCoach.ts` (orquestrador RN-safe); drone-guia opt-in.
13. Gravar a **identidade sonora** de 3 sons (loo / sino / sonic-logo) + sabor gospel dos momentos grandes.
14. Celebração juicy (`canvas-confetti` + tally de XP + wash Amanhecer + reação da EVA), sempre atrás de `prefers-reduced-motion`.

**Onda 5 — Trilha e gamificação na nova pele.**
15. Repintar `TrilhaPath`/`LessonNode`/`ContinuarCTA`/`StreakFlame`/`XPCounter` com os componentes chunky ([§2.4](#24-componentes)) e o mapa semântico.

> **Regra viva:** se uma decisão não serve à **segurança psicológica** do cantor inseguro nem ao seu **retorno amanhã** (D1/D7/D30), ela não entra. O v2 troca a roupa, não a alma.
