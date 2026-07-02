import { Body, Controller, Get, Put } from '@nestjs/common'
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator'
import { PutStateDto } from './dto/put-state.dto'
import { StateService } from './state.service'

@Controller('state')
export class StateController {
  constructor(private readonly state: StateService) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.state.get(user)
  }

  @Put()
  put(@CurrentUser() user: AuthUser, @Body() dto: PutStateDto) {
    return this.state.put(user, dto)
  }
}
