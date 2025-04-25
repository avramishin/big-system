import { Injectable } from '@nestjs/common';

@Injectable()
export class MonologService {
  getHello(): string {
    return 'Hello World!';
  }
}
