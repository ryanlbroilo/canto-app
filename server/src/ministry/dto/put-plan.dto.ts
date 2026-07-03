import { IsArray, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

// Item plano do plano de ensaio (o front envia a lista já achatada; o serviço a
// separa em aquecimento + set de harmonia nas duas colunas Json).
export class PlanItemDto {
  @IsIn(['warmup', 'harmony'])
  kind!: 'warmup' | 'harmony'

  // warmup: id de exercício da biblioteca · harmony: id do drill
  @IsString()
  @MaxLength(80)
  ref!: string

  @IsString()
  @MaxLength(120)
  label!: string
}

export class PutPlanDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  title?: string

  @IsOptional()
  @IsString()
  @MaxLength(400)
  notes?: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanItemDto)
  items?: PlanItemDto[]
}
