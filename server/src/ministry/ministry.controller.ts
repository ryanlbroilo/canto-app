import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'
import { PutPlanDto } from './dto/put-plan.dto'
import { SetVoicePartDto } from './dto/set-voice-part.dto'
import { MinistryService } from './ministry.service'

@Controller('ministry')
export class MinistryController {
  constructor(private readonly ministry: MinistryService) {}

  // Qualquer membro autenticado LÊ o plano do ministério.
  @Get('plan')
  getPlan(@CurrentUser() user: AuthUser) {
    return this.ministry.getPlan(user)
  }

  // Só o líder/co-líder edita o plano compartilhado.
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Put('plan')
  putPlan(@CurrentUser() user: AuthUser, @Body() dto: PutPlanDto) {
    return this.ministry.putPlan(user, dto)
  }

  // Naipes do ministério (leitura aberta a membros).
  @Get('members')
  members(@CurrentUser() user: AuthUser) {
    return this.ministry.members(user)
  }

  // O membro define o PRÓPRIO naipe.
  @Put('parts/me')
  setMyVoicePart(@CurrentUser() user: AuthUser, @Body() dto: SetVoicePartDto) {
    return this.ministry.setVoicePart(user, user.userId, dto)
  }

  // O líder atribui o naipe de um membro.
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Put('members/:id/part')
  assignVoicePart(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: SetVoicePartDto) {
    return this.ministry.setVoicePart(user, id, dto)
  }

  // Quadro de prontidão (só líder).
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Get('readiness')
  readiness(@CurrentUser() user: AuthUser) {
    return this.ministry.readiness(user)
  }
}
