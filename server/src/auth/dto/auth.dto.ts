import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class RegisterDto {
  // Cria um novo tenant (a "conta") e o usuário OWNER dele. OPCIONAL: sem ele, o
  // servidor provisiona um tenant pessoal a partir do nome/e-mail (cadastro de
  // consumidor sem fricção — não precisa nomear "organização").
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  tenantName?: string

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
  // OPCIONAL: sem slug, o login resolve pelo e-mail (consumidor com 1 conta). Com
  // slug, escopa ao tenant — desambigua quando o mesmo e-mail existe em vários.
  @IsOptional()
  @IsString()
  tenantSlug?: string

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
