import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

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

  // Aceite da política de privacidade (LGPD). O front trava o botão até marcar.
  @IsOptional()
  @IsBoolean()
  consent?: boolean
}

export class VerifyEmailDto {
  @IsString()
  @MaxLength(200)
  token!: string
}

export class RequestResetDto {
  @IsString()
  @MaxLength(80)
  tenantSlug!: string

  @IsEmail()
  email!: string
}

export class ResetPasswordDto {
  @IsString()
  @MaxLength(200)
  token!: string

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string
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

  @IsOptional()
  @IsBoolean()
  consent?: boolean
}
