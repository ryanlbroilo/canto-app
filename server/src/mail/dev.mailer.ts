import { Injectable, Logger } from '@nestjs/common'
import { Mailer, SendMailArgs } from './mailer'

// DEV: loga o link no console (copie no navegador pra completar o fluxo). Zero
// config — o app funciona de ponta a ponta sem SMTP.
@Injectable()
export class DevMailer extends Mailer {
  private readonly log = new Logger('DevMailer')
  async send({ to, subject, text }: SendMailArgs): Promise<void> {
    this.log.log(`[E-MAIL DEV] para=${to} · assunto="${subject}"\n${text}`)
  }
}
