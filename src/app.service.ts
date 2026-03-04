import { Injectable } from '@nestjs/common';



@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Hoàn đẹp trai số 1!';
  }
}



