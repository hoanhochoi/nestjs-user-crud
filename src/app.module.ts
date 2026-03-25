import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // 2. Để ConfigModule chạy toàn cầu
    
      CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true, // để cache module có thể sử dụng ở bất kỳ đâu
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('REDIS_HOST','localhost');
        const port = configService.get('REDIS_PORT',6379);
        return {
          stores: new KeyvRedis(`redis://${host}:${port}`),
          ttl: 60000,// 1 phút
        }
      }
    }),

    TypeOrmModule.forRootAsync({              // 3. Dùng forRootAsync thay vì forRoot
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // host: configService.get<string>('DB_HOST'),  // không phải để localhost 
        // port: configService.get<number>('DB_PORT'),
        // username: configService.get<string>('DB_USERNAME'),
        // password: configService.get<string>('DB_PASSWORD'),
        // database: configService.get<string>('DB_NAME'),

        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),

        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    RolesModule,
    RabbitmqModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
