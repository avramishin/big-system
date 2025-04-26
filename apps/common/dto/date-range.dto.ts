import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class DateRangeDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  from?: number;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  to?: number;
}
