import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class GetUserAccountsDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsNotEmpty()
  wallet?: string;

  @IsOptional()
  @IsNotEmpty()
  currency?: string;
}
