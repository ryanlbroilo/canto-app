import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface EvaMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Serviço da EVA: guarda a chave do EVA Hub no SERVIDOR e repassa o chat.
// A EVA recebe SÓ os números do DSP (feature-JSON) que o front manda — nunca
// áudio. Substitui o proxy que ficava no dev-server do Vite (agora inexistente
// em produção): este endpoint é o único caminho, autenticado e com rate-limit.
@Injectable()
export class EvaService {
  constructor(private readonly config: ConfigService) {}

  /** true quando EVA_HUB_KEY e EVA_ASSISTANT_ID estão configurados. */
  get configured(): boolean {
    return !!this.config.get<string>('EVA_HUB_KEY') && !!this.config.get<string>('EVA_ASSISTANT_ID')
  }

  /** Chama o EVA Hub (upstream) e devolve a Response crua — para stream ou JSON. */
  upstream(messages: EvaMessage[], stream: boolean): Promise<Response> {
    const key = this.config.get<string>('EVA_HUB_KEY') as string
    const assistantId = this.config.get<string>('EVA_ASSISTANT_ID') as string
    const url = this.config.get<string>('EVA_HUB_URL', 'https://evahub.com.br/api/v1/chat')
    return fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ assistant_id: assistantId, messages: messages ?? [], stream }),
    })
  }
}
