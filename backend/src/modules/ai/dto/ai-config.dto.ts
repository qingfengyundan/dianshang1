import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class UpsertAiConfigDto {
  @IsString()
  @IsNotEmpty({ message: 'baseUrl 不能为空' })
  baseUrl: string;

  /** 留空表示沿用已有 Key（前端不回显明文，无法重新提交） */
  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsString()
  @IsNotEmpty({ message: 'model 不能为空' })
  model: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
