import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator'

class MessageDto {
  @IsIn(['user', 'assistant', 'system'])
  role!: 'user' | 'assistant' | 'system'

  @IsString()
  content!: string
}

export class ChatDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages!: MessageDto[]

  @IsOptional()
  @IsBoolean()
  stream?: boolean
}
