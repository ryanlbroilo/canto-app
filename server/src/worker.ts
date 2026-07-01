import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { WorkerModule } from './queue/worker.module'

// Processo do WORKER (container separado). Roda os processors da fila; sem HTTP.
async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['error', 'warn', 'log'],
  })
  app.enableShutdownHooks()
  new Logger('Worker').log('Worker da fila iniciado — consumindo a fila "sessions"')
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Falha ao iniciar o worker:', err)
  process.exit(1)
})
