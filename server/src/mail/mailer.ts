// Contrato plugável de e-mail. Uma impl DEV (loga o link no console, zero config)
// e uma SMTP (nodemailer). Selecionada por EMAIL_PROVIDER. Nunca relança — e-mail
// que falha não pode quebrar cadastro/reset.
export interface SendMailArgs {
  to: string
  subject: string
  html: string
  text: string
}

export abstract class Mailer {
  abstract send(args: SendMailArgs): Promise<void>
}
