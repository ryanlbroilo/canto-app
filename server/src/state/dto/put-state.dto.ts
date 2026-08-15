import { IsArray, IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator'

// Estado do usuário sincronizado (o front manda o estado local completo).
export class PutStateDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  profileName?: string

  @IsOptional()
  @IsString()
  @MaxLength(400)
  profileGoal?: string

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>

  @IsOptional()
  @IsObject()
  baseline?: Record<string, unknown> | null

  @IsOptional()
  @IsArray()
  rangeHistory?: unknown[]

  @IsOptional()
  @IsArray()
  achievements?: unknown[]

  @IsOptional()
  @IsObject()
  freeze?: Record<string, unknown>

  @IsOptional()
  @IsObject()
  weeklyGoal?: Record<string, unknown>

  @IsOptional()
  @IsObject()
  reminder?: Record<string, unknown>

  @IsOptional()
  @IsBoolean()
  seenOnboarding?: boolean
}
