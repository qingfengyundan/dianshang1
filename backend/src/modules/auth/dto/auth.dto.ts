import { IsString, IsNotEmpty, MinLength, IsEnum, IsOptional, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(['system_admin', 'merchant_admin', 'merchant_user'])
  role: 'system_admin' | 'merchant_admin' | 'merchant_user';

  @IsOptional()
  @IsNumber()
  tenantId?: number;

  @IsOptional()
  permissions?: Record<string, any>;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UserResponseDto {
  id: number;
  username: string;
  role: string;
  tenantId?: number;
  permissions?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}
