# Conectar a EVA (EVA Hub) — guia de setup

A EVA é uma **persona no EVA Hub** (`evahub.com.br`). O app fala com ela pelo
**controller NestJS** `POST /api/eva/chat` (`server/src/eva/`), que guarda a chave no
servidor — ela nunca vai pro navegador. Sem as chaves configuradas, o endpoint
responde **501** e o app cai na **prévia local** automaticamente (nunca quebra).

> **Fonte de verdade do system prompt:** [`src/domain/eva-voice/prompt.ts`](../src/domain/eva-voice/prompt.ts)
> (`EVA_SYSTEM_PROMPT`). Edite lá e cole na persona. O guard `npm run test:eva` roda
> no `prebuild` e falha se o prompt perder a regra anti-vergonha ou se qualquer voz
> estática rotular o aluno de "desafinado".

## Passo a passo

1. **Criar a persona** no dashboard do EVA Hub → Assistants → nova persona
   `EVA Vocal Coach`. Copie o `assistant_id` (`asst_...`).
2. **Colar o system prompt**: copie o conteúdo de `EVA_SYSTEM_PROMPT` em
   [`src/domain/eva-voice/prompt.ts`](../src/domain/eva-voice/prompt.ts) na
   configuração da persona (a API não define system prompt — ele vive no dashboard).
3. **Adicionar a base de conhecimento** (RAG) na persona — faça upload dos
   documentos da seção "Base de conhecimento" abaixo.
4. **Modelo:** `claude-haiku-4-5` (padrão, barato e rápido — ideal pro coaching).
5. **Gerar uma API key** (API Console → API Keys). Copie (`evh_live_...`).
6. **Configurar o servidor:** no ambiente do backend (`server/.env`), defina:
   ```
   EVA_HUB_KEY=evh_live_...
   EVA_ASSISTANT_ID=asst_...
   # opcional (default já aponta pro EVA Hub):
   # EVA_HUB_URL=https://evahub.com.br/api/v1/chat
   ```
   Validado em `server/src/config/env.validation.ts` — chaves ausentes ⇒ `/api/eva/chat` responde 501.
7. Suba o backend e o front (`npm run dev`) → abra **EVA Coach**. Se conectar, o badge
   mostra **"EVA ao vivo"**; senão, cai na **prévia** local (o `diagnose()` determinístico).

## Como o app fala com a EVA

O app envia, na PRIMEIRA mensagem do usuário, um bloco `[DADOS_DO_ALUNO]` com o
**feature-JSON** do DSP (perfil, range, última sessão: afinação, estabilidade,
vibrato, tempo em cada registro, quebras). A EVA **nunca recebe áudio** — só os
números. O `EVA_SYSTEM_PROMPT` ensina ela a ler esse bloco.

## Base de conhecimento (upload na persona)

O **pacote completo** já está pronto em `conhecimento-eva/` (10 documentos PT-BR,
pesquisados e checados factualmente — ver `conhecimento-eva/README.md`). Faça
upload de **todos** eles na base de conhecimento da persona:

- `conhecimento-eva/respiracao-apoio.md`
- `conhecimento-eva/registros-passaggio.md`
- `conhecimento-eva/ressonancia-formantes.md`
- `conhecimento-eva/ciencia-da-voz.md`
- `conhecimento-eva/saude-vocal.md`
- `conhecimento-eva/biblioteca-exercicios.md`
- `conhecimento-eva/problemas-solucoes.md`
- `conhecimento-eva/pedagogia-aprendizado.md`
- `conhecimento-eva/estilo-repertorio-br.md`
- `conhecimento-eva/glossario.md`
- `conhecimento-eva/tecnica-vocal.md` (visão geral)
- `fundamentacao-academica-vocal.md` (na raiz — fundamentação científica/papers)

Adicione também, se quiser, PDFs de papers de referência (Titze, Welch,
Roubeau/Henrich, Bozeman) para aprofundar ainda mais.
