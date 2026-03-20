import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({

    imports:[
         ClientsModule .registerAsync([
        {
          name: 'RABBITMQ_SERVICE',  // tên này để Inject vào service
          imports: [ConfigModule ],
          inject: [ConfigService ],
          useFactory: (configService: ConfigService) => ({
            transport: Transport .RMQ,
            options: {
              urls:[
                  `amqp://${configService.get('RABBITMQ_USER')}:${configService.get('RABBITMQ_PASS')}@${configService.get('RABBITMQ_HOST')}:${configService.get('RABBITMQ_PORT')}`
                ],
              queue: 'nestjs_queue',
              queueOptions: {
                durable: false
              },
            },
              noAck: false, // đảm bảo tin nhắn được xử lý (phải để ngoài options nếu không sẽ bị lỗi 406)
          })
    
        },
      ]),
    ],
    exports: [ClientsModule] // export để các module khác dùng được
})
export class RabbitmqModule {}
