import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Mailer } from './mailer'
import { DevMailer } from './dev.mailer'
import { SmtpMailer } from './smtp.mailer'
import { MailService } from './mail.service'

// Global: seleciona a impl por EMAIL_PROVIDER (dev = loga; smtp = envia).
@Global()
@Module({
  providers: [
    {
      provide: Mailer,
      useFactory: (cfg: ConfigService) => (cfg.get('EMAIL_PROVIDER') === 'smtp' ? new SmtpMailer(cfg) : new DevMailer()),
      inject: [ConfigService],
    },
    MailService,
  ],
  exports: [Mailer, MailService],
})
export class MailModule {}
