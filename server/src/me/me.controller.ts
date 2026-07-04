import { Controller, Delete, Get, HttpCode } from '@nestjs/common'
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator'
import { MeService } from './me.service'

// /api/me — autenticado (guard global). LGPD: exportar e excluir os próprios dados.
@Controller('me')
export class MeController {
  constructor(private readonly me: MeService) {}

  @Get('export')
  exportData(@CurrentUser() user: AuthUser) {
    return this.me.exportData(user)
  }

  @Delete()
  @HttpCode(200)
  async deleteMe(@CurrentUser() user: AuthUser) {
    await this.me.deleteMe(user)
    return { ok: true }
  }
}
