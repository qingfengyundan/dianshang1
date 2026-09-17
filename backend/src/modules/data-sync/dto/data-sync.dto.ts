import { IsInt, IsOptional } from 'class-validator';

export class TriggerDataSyncDto {
  @IsOptional()
  @IsInt()
  shopId?: number;
}
