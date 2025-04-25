import { IsNotEmpty } from 'class-validator';

export class HelloDto {
  @IsNotEmpty()
  q: string;
}
