import { IsEnum } from 'class-validator'
import { VoicePart } from '@prisma/client'

export class SetVoicePartDto {
  // Enum do Prisma (MAIÚSCULO). O cliente converte antes de enviar.
  @IsEnum(VoicePart)
  voicePart!: VoicePart
}
