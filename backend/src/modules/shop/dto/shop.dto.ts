import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsUrl, IsIn } from 'class-validator';

const VALID_PLATFORMS = ['taobao', 'pinduoduo', 'douyin'] as const;

export class CreateShopDto {
  // 商户管理员不传 tenantId（由 token 强制注入），故这里只校验类型、不做非空校验；
  // 是否缺失由 controller 统一判定
  @IsOptional()
  @IsInt()
  tenantId?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(VALID_PLATFORMS, { message: 'platform 必须是 taobao、pinduoduo 或 douyin 之一' })
  platform: string;

  @IsOptional()
  @IsUrl({}, { message: 'shopUrl 必须是有效的 URL' })
  shopUrl?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateShopDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(VALID_PLATFORMS, { message: 'platform 必须是 taobao、pinduoduo 或 douyin 之一' })
  platform?: string;

  @IsOptional()
  @IsUrl({}, { message: 'shopUrl 必须是有效的 URL' })
  shopUrl?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
