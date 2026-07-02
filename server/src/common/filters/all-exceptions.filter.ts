import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Request, Response } from 'express'

// Filtro global: loga 5xx com stack e devolve JSON limpo. Se a resposta já
// começou (ex.: stream SSE da EVA), não tenta reescrever os headers.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception')

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()
    const req = ctx.getRequest<Request>()

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const payload =
      exception instanceof HttpException ? exception.getResponse() : { statusCode: status, message: 'Erro interno' }

    if (status >= 500) {
      this.logger.error(
        `${req?.method} ${req?.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      )
    }

    if (res.headersSent) return
    res.status(status).json(typeof payload === 'string' ? { statusCode: status, message: payload } : payload)
  }
}
