import KeyvRedis from '@keyv/redis';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ThrottlerCustomGuard } from './common/guards/throttler-custom.guard';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { DomainsModule } from './domains/domains.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // 2. Để ConfigModule chạy toàn cầu

    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true, // để cache module có thể sử dụng ở bất kỳ đâu
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('REDIS_HOST', 'localhost');
        const port = configService.get('REDIS_PORT', 6379);
        return {
          stores: new KeyvRedis(`redis://${host}:${port}`),
          ttl: 60000,// 1 phút
        }
      }
    }),

    // rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get('THROTTLE_TTL') || 60000, // 60s
            limit: config.get('THROTTLE_LIMIT') || 5, // 5 lần/1 phút
          },
        ],
        storage: new ThrottlerStorageRedisService({
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379)
        }),
      }),
    }),


    TypeOrmModule.forRootAsync({              // 3. Dùng forRootAsync thay vì forRoot
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
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
    DomainsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      // useClass: ThrottlerGuard // cấu hình giới hạn toàn bộ các api
      useClass: ThrottlerCustomGuard
    }
  ],
})
export class AppModule { }
