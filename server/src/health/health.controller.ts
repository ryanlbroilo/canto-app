import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common'
import Redis from 'ioredis'
import { Public } from '../common/decorators/public.decorator'
import { PrismaService } from '../prisma/prisma.service'
import { REDIS_CLIENT } from '../redis/redis.module'

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Get()
  async check() {
    const db = await this.prisma
      .$queryRaw`SELECT 1`
      .then(() => 'up')
      .catch(() => 'down')
    const redis = await this.redis
      .ping()
      .then((r) => (r === 'PONG' ? 'up' : 'down'))
      .catch(() => 'down')

    const body = { status: db === 'up' && redis === 'up' ? 'ok' : 'down', db, redis, ts: new Date().toISOString() }
    if (body.status !== 'ok') throw new ServiceUnavailableException(body)
    return body
  }
}
