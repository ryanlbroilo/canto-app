import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'
import { CreateInviteDto } from './dto/create-invite.dto'
import { InvitesService } from './invites.service'

@Controller('invites')
export class InvitesController {
  constructor(private readonly invites: InvitesService) {}

  // Criar/gerir convites: só líder (OWNER) ou co-líder (ADMIN).
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateInviteDto) {
    return this.invites.create(user, dto)
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.invites.list(user)
  }

  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Delete(':id')
  revoke(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.invites.revoke(user, id)
  }

  // Público: a tela de cadastro lê pra mostrar "você foi convidado para X".
  @Public()
  @Get('preview/:token')
  preview(@Param('token') token: string) {
    return this.invites.preview(token)
  }
}
