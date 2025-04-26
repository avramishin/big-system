import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiService {
  getHello() {
    return {
      date: new Date(),
    };
  }
}
