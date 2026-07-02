import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] })
  const config = app.get(ConfigService)

  // Segurança de cabeçalhos. API é JSON puro — sem CSP/COEP (isso é do front).
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))

  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  )
  app.useGlobalFilters(new AllExceptionsFilter())

  // CORS por origem: '*' (dev) reflete a origem do request; em produção aceita
  // uma lista separada por vírgula em CORS_ORIGIN.
  const corsOrigin = config.get<string>('CORS_ORIGIN', '*')
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
  })
  app.enableShutdownHooks()

  const port = Number(config.get<number>('PORT', 3333))
  await app.listen(port, '0.0.0.0')
  new Logger('Bootstrap').log(`API do Canto no ar em http://localhost:${port}/api`)
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Falha ao iniciar a API:', err)
  process.exit(1)
})
