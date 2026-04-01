declare const module: any;

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DomainsService } from './domains/domains.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
async function bootstrap() {
  // 1. khởi tạo ứng dụng web bình thường(HTTP)
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Lấy các service cần thiết từ app context
  const domainsService = app.get(DomainsService);
  const cacheManager = app.get(CACHE_MANAGER);

  app.enableCors({
    // origin: 'http://localhost:5173', // chỉ cho phép frontend chạy ở port 5173 
    origin: async (origin, callback) => {
      // 1. Cho phép Postman (không có origin)
      if (!origin) return callback(null, true);

      // 2. Thử lấy từ Redis trước cho nhanh
      let whiteList: string[] = await cacheManager.get('ALLOWED_DOMAINS');

      // 3. Nếu Redis trống (mới khởi động), lấy từ Postgres nạp vào
      if (!whiteList) {
        whiteList = await domainsService.getAllActiveDomains();
        await cacheManager.set('ALLOWED_DOMAINS', whiteList, 0);
      }

      // 4. Kiểm tra
      if (whiteList.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed for this domain'), false);
      }
    },

    methods: 'GET,POST,PUT,DELETE,PATCH', // chỉ cho phép các lệnh này
    allowedHeaders: 'Content-Type, Authorization, Accept', // chỉ cho phép gửi kèm các header
    credentials: true, // để trình duyệt cho phép gửi cookie
  });
  app.set('trust proxy', 'loopback'); // để phân biệt ip 

  // 2. gắn thêm RabbitMQ vào ứng dụng hiện tại
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://${process.env.RABBITMQ_HOST}:5672`], // địa chỉ RabbitMQ trong Docker
      queue: 'nestjs_queue',  // tên hàng đợi
      noAck: false,
      queueOptions: { durable: false }
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
