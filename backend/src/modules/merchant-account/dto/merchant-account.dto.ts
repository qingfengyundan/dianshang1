import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateMerchantAccountDto {
  @IsInt()
  tenantId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['merchant_admin', 'merchant_user'])
  role: 'merchant_admin' | 'merchant_user';
}

export class UpdateMerchantAccountStatusDto {
  @IsBoolean()
  isActive: boolean;
}

export class ResetMerchantAccountPasswordDto {
  @IsString()
  @MinLength(6)
  password: string;
}
