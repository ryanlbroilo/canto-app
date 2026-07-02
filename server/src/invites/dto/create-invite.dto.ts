import { IsEmail, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator'

export class CreateInviteDto {
  // MEMBER (aluno) por padrão; ADMIN = co-líder do time.
  @IsOptional()
  @IsIn(['MEMBER', 'ADMIN'])
  role?: 'MEMBER' | 'ADMIN'

  // Convite direcionado a um e-mail (opcional). Sem e-mail = link de time reutilizável.
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(180)
  expiresInDays?: number

  // null/ausente = ilimitado (link de time). 1 = uso único.
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxUses?: number
}
