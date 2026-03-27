declare const module: any;

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  // 1. khởi tạo ứng dụng web bình thường(HTTP)
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 'loopback');

  // 2. gắn thêm RabbitMQ vào ứng dụng hiện tại
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://${process.env.RABBITMQ_HOST}:5672`], // địa chỉ RabbitMQ trong Docker
      queue: 'nestjs_queue',  // tên hàng đợi
      noAck: false,
      queueOptions: { durable: false}
    }
  })

  //dòng này để kích hoạt "máy quét" dữ liệu
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // tự động loại bỏ field không có trong dto
    forbidNonWhitelisted: true, // gửi filed thừa sẽ bị 400 error
    transform: true, // tự động convert type
}));
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);


    if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

}

bootstrap();
