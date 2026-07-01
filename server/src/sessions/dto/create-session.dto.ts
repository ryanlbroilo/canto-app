import {
  IsIn,
  IsISO8601,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator'

// Espelha o SessionRecord do cliente (o front sincroniza cada sessão pra cá).
export class CreateSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  clientId?: string

  @IsIn(['practice', 'exercise'])
  kind!: 'practice' | 'exercise'

  @IsOptional()
  @IsString()
  @MaxLength(64)
  exerciseId?: string

  @IsString()
  @MaxLength(120)
  label!: string

  @IsNumber()
  @Min(0)
  @Max(86400)
  durationSec!: number

  @IsNumber()
  @Min(0)
  @Max(100)
  notesHitPct!: number

  @IsNumber()
  @Min(0)
  avgCentsDev!: number

  @IsOptional()
  @IsObject()
  featureReport?: Record<string, unknown>

  @IsISO8601()
  dateISO!: string
}
