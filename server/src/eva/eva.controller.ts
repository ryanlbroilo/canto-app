import { Body, Controller, Post, Res } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { Response as ExpressResponse } from 'express'
import { Readable } from 'node:stream'
import type { ReadableStream as WebReadableStream } from 'node:stream/web'
import { ChatDto } from './dto/chat.dto'
import { EvaService } from './eva.service'

@Controller('eva')
export class EvaController {
  constructor(private readonly eva: EvaService) {}

  // Autenticado (guard JWT global) — só usuário logado gasta a chave da EVA.
  // Rate-limit apertado: LLM é caro.
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('chat')
  async chat(@Body() dto: ChatDto, @Res() res: ExpressResponse): Promise<void> {
    if (!this.eva.configured) {
      // 501 → o Coach cai na prévia rule-based com elegância.
      res.status(501).json({ error: 'EVA não configurada (defina EVA_HUB_KEY e EVA_ASSISTANT_ID no servidor)' })
      return
    }

    const wantStream = !!dto.stream
    let upstream: Response
    try {
      upstream = await this.eva.upstream(dto.messages ?? [], wantStream)
    } catch (e) {
      res.status(502).json({ error: e instanceof Error ? e.message : 'eva upstream error' })
      return
    }

    if (wantStream && upstream.ok && upstream.body) {
      // repassa o SSE cru para o cliente
      res.status(200)
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache, no-transform')
      res.setHeader('Connection', 'keep-alive')
      Readable.fromWeb(upstream.body as WebReadableStream).pipe(res)
      return
    }

    // não-stream (ou upstream com erro): devolve o JSON como veio
    const text = await upstream.text()
    res.status(upstream.status)
    res.setHeader('Content-Type', 'application/json')
    res.send(text)
  }
}
