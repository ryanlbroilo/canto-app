import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import { Mailer, SendMailArgs } from './mailer'

// PROD: envia via SMTP (nodemailer). Se SMTP_HOST estiver vazio, degrada pra log
// (não crasha) — o fundador liga as chaves quando quiser (ver §ENV do PROGRESSO).
@Injectable()
export class SmtpMailer extends Mailer {
  private readonly log = new Logger('SmtpMailer')
  private readonly transport?: nodemailer.Transporter

  constructor(private readonly cfg: ConfigService) {
    super()
    const host = this.cfg.get<string>('SMTP_HOST')
    if (host) {
      this.transport = nodemailer.createTransport({
        host,
        port: Number(this.cfg.get('SMTP_PORT')) || 587,
        auth: { user: this.cfg.get<string>('SMTP_USER'), pass: this.cfg.get<string>('SMTP_PASS') },
      })
    } else {
      this.log.warn('SMTP_HOST não configurado — os e-mails serão logados, não enviados.')
    }
  }

  async send({ to, subject, html, text }: SendMailArgs): Promise<void> {
    if (!this.transport) {
      this.log.warn(`[SMTP OFF] para=${to} · ${subject}\n${text}`)
      return
    }
    try {
      await this.transport.sendMail({ from: this.cfg.get<string>('SMTP_FROM'), to, subject, html, text })
    } catch (e) {
      this.log.error(`Falha ao enviar e-mail para ${to}: ${e}`) // nunca relança
    }
  }
}
