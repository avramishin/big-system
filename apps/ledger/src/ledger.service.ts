import { Injectable } from '@nestjs/common';

@Injectable()
export class LedgerService {
  getHello(): string {
    return 'Hello World!';
  }
}
