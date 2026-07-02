import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'
import { TenantService } from './tenant.service'

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenant: TenantService) {}

  // Painel do líder: só OWNER/ADMIN veem o time.
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Get('members')
  members(@CurrentUser() user: AuthUser) {
    return this.tenant.members(user)
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Get('members/:id')
  memberDetail(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.tenant.memberDetail(user, id)
  }
}
