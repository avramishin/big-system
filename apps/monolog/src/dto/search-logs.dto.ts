import { IsOptional } from 'class-validator';
import { PagerDto } from '../../../common/dto/pager.dto';
import { DateRangeDto } from 'apps/common/dto/date-range.dto';

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
  dateRange?: DateRangeDto;

  @IsOptional()
  pager?: PagerDto;
}
