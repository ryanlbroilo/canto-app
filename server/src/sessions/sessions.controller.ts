import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator'
import { CreateSessionDto } from './dto/create-session.dto'
import { SessionsService } from './sessions.service'

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateSessionDto) {
    return this.sessions.create(user, dto)
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('limit') limit?: string) {
    return this.sessions.list(user, limit ? Number(limit) : undefined)
  }

  @Get('stats')
  stats(@CurrentUser() user: AuthUser) {
    return this.sessions.stats(user)
  }
}
