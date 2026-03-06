import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';

// @Module({
//   imports: [
//     UsersModule,
//     JwtModule.register({
//       global: true,
//       // secret: jwtConstants.secret,
//       secret: process.env.JWT_SECRET,
//       signOptions: { expiresIn: '60s' },
//     }),
//   ],
//   providers: [AuthService],
//   controllers: [AuthController],
//   exports: [AuthService],
// }) lỗi không lấy được file env

@Module({
  imports: [
    // UsersModule, // authModule -> userModule và bên kia userModule cũng gọi lại sinh vòng tròn và lỗi

    forwardRef(() => UsersModule),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [AuthService,AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})

export class AuthModule {}
