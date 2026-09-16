export class CreateUserDto {
  username: string;
  password: string;
  role: 'system_admin' | 'merchant_admin' | 'merchant_user';
  tenantId?: number;
  permissions?: Record<string, any>;
}

export class LoginDto {
  username: string;
  password: string;
}

export class UserResponseDto {
  id: number;
  username: string;
  role: string;
  tenantId?: number;
  permissions?: Record<string, any>;
  createdAt: Date;
}
