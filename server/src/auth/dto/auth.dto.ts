import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class RegisterDto {
  // Cria um novo tenant (organização) e o usuário OWNER dele.
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  tenantName!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string

  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string
}

export class LoginDto {
  // Login é escopado por tenant (o mesmo e-mail pode existir em tenants diferentes).
  @IsString()
  tenantSlug!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(1)
  password!: string
}

export class RefreshDto {
  @IsString()
  @MinLength(10)
  refreshToken!: string
}

export class RegisterInviteDto {
  // Entra num tenant EXISTENTE via convite (sem criar organização nova).
  @IsString()
  @MinLength(10)
  token!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string

  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string
}
