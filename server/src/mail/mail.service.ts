import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Mailer } from './mailer'

// Monta os e-mails (verificação / reset) com o link ${APP_URL}/... e delega ao
// Mailer selecionado. Link-building fica num lugar só.
@Injectable()
export class MailService {
  constructor(
    private readonly mailer: Mailer,
    private readonly cfg: ConfigService,
  ) {}

  private appUrl(): string {
    return this.cfg.get<string>('APP_URL', 'http://localhost:5173')
  }

  async sendVerification(to: string, rawToken: string): Promise<void> {
    const link = `${this.appUrl()}/verificar?token=${rawToken}`
    await this.mailer.send({
      to,
      subject: 'Confirme seu e-mail — Canto',
      html: `<p>Bem-vindo ao Canto! Confirme seu e-mail pra proteger sua conta:</p><p><a href="${link}">Confirmar e-mail</a></p>`,
      text: `Bem-vindo ao Canto! Confirme seu e-mail: ${link}`,
    })
  }

  async sendPasswordReset(to: string, rawToken: string): Promise<void> {
    const link = `${this.appUrl()}/redefinir?token=${rawToken}`
    await this.mailer.send({
      to,
      subject: 'Redefinir senha — Canto',
      html: `<p>Recebemos um pedido pra redefinir sua senha.</p><p><a href="${link}">Redefinir senha</a> — o link expira em 1 hora. Se não foi você, ignore.</p>`,
      text: `Redefina sua senha (expira em 1h): ${link}`,
    })
  }
}
