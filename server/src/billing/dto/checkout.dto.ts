import { IsIn } from 'class-validator'

export class CheckoutDto {
  @IsIn(['pro', 'igreja', 'professor'])
  plan!: 'pro' | 'igreja' | 'professor'

  @IsIn(['monthly', 'yearly'])
  cycle!: 'monthly' | 'yearly'
}
