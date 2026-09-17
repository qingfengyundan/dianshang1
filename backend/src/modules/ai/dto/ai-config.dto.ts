import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class UpsertAiConfigDto {
  @IsString()
  @IsNotEmpty({ message: 'baseUrl 不能为空' })
  baseUrl: string;

  @IsString()
  @IsNotEmpty({ message: 'apiKey 不能为空' })
  apiKey: string;

  @IsString()
  @IsNotEmpty({ message: 'model 不能为空' })
  model: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
