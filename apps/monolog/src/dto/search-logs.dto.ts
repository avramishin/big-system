import { IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchLogsDto {
  @IsOptional()
  keyword?: string;

  @IsOptional()
  svc?: string;

  @IsOptional()
  rrn?: string;

  @IsOptional()
  msg?: string;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  time_from?: number;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  time_to?: number;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
