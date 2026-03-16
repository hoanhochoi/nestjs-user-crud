declare const module: any;

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //dòng này để kích hoạt "máy quét" dữ liệu
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // tự động loại bỏ field không có trong dto
    forbidNonWhitelisted: true, // gửi filed thừa sẽ bị 400 error
    transform: true, // tự động convert type
}));
  await app.listen(process.env.PORT ?? 3000);


    if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

}

bootstrap();
