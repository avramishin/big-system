import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  Length,
  Min,
  Max,
} from 'class-validator';
import { MonologLogTtl } from '../enums/monolog-log-ttl.enum';

export class CreateLogDto {
  @IsNotEmpty({ message: 'Message is required' })
  @Length(1, 255, { message: 'Messages length should be max 255 bytes' })
  msg: string;

  @IsNotEmpty({
    message: 'Number of seconds to keep this log record, 60 - one minute',
  })
  @IsPositive({ message: 'Expiration should be positive number of seconds' })
  @Min(60, { message: 'Min expiration time is 60 seconds' })
  @Max(1209600, { message: 'Max expiration time is 2 weeks, 1209600 seconds' })
  exp: MonologLogTtl;

  @IsOptional()
  ctx?: any;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @Type(() => String)
  keywords?: string[];
}
