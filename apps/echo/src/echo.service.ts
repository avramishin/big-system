import { Injectable } from '@nestjs/common';

@Injectable()
export class EchoService {
  getHello(): string {
    return 'Hello World!';
  }
}
